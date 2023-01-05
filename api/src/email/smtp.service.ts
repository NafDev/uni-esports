import { readFileSync } from 'node:fs';
import { Injectable } from '@nestjs/common';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
import { compile } from 'handlebars';
import mjml2html from 'mjml';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import appConfig from '../config/app.config';

export enum EmailTemplates {
	VERIFY_USER = 'verify-user.mjml',
	RESET_PASSWORD = 'reset-password.mjml',
	TEAM_INVITE = 'team-invite.mjml'
}

export interface IEmailVariables {
	link?: string;
	teamName?: string;
}

@Injectable()
export class SmtpService {
	private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
	private readonly templates: Map<EmailTemplates, HandlebarsTemplateDelegate> = new Map();

	constructor(@OgmaLogger(SmtpService) private readonly logger: OgmaService) {
		for (const templateFile of Object.values(EmailTemplates)) {
			const mjmlResult = mjml2html(readFileSync(`emails/templates/${templateFile}`).toString());

			if (mjmlResult.errors.length > 0) {
				throw new Error(
					`Could not parse mjml file "${templateFile}": ${JSON.stringify(mjmlResult.errors, undefined, 2)}`
				);
			}

			const hbsTemplateFn = compile(mjmlResult.html);
			this.templates.set(templateFile, hbsTemplateFn);
		}

		this.transporter = nodemailer.createTransport(
			{
				host: appConfig.SMTP_HOST,
				port: appConfig.SMTP_PORT,
				// Secure: true,
				auth: {
					user: appConfig.SMTP_USER,
					pass: appConfig.SMTP_PASS
				}
			},
			{ debug: appConfig.isDev }
		);
	}

	async sendEmail(recipient: string, subject: string, template: EmailTemplates, variables?: IEmailVariables) {
		const hbsTemplate = this.templates.get(template);

		if (!hbsTemplate) {
			this.logger.error(`Invalid email template string = "${template}"`);
			return;
		}

		try {
			const result = await this.transporter.sendMail({
				from: `${appConfig.APP_NAME} <${appConfig.SMTP_SENDFROM}>`,
				to: recipient,
				subject,
				html: hbsTemplate({ ...variables, appName: appConfig.APP_NAME })
			});
			this.logger.info('Email sent', { template, messageId: result.messageId });
		} catch (error: unknown) {
			if (error instanceof Error) {
				this.logger.error(error.message, error.stack);
			}

			throw error;
		}
	}
}
