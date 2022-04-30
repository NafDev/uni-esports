import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
// Himport mjml2html = require('mjml');
import mjml2html from 'mjml';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { AppConfig } from '../config/config.service';

export enum EmailTemplates {
  VERIFY_USER = 'verify-user.mjml',
}

export interface EmailVariables {
  verifyLink?: string;
}

@Injectable()
export class SmtpService {
  private readonly logger = new Logger(SmtpService.name);

  private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  private readonly templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(private readonly appConfig: AppConfig) {
    for (const templateFile of Object.values(EmailTemplates)) {
      const mjmlResult = mjml2html(readFileSync(`emails/templates/${templateFile}`).toString());

      if (mjmlResult.errors.length !== 0) {
        this.logger.error(`Could not parse mjml file ${templateFile} -> ${mjmlResult.errors.toString()}`);
        process.exit(1);
      }

      const hbsTemplateFn = compile(mjmlResult.html);
      this.templates.set(templateFile, hbsTemplateFn);
    }

    const smtpConn = appConfig.smtpConnection;

    this.transporter = nodemailer.createTransport({
      host: smtpConn.host,
      port: smtpConn.port,
      secure: true,
      auth: {
        user: smtpConn.user,
        pass: smtpConn.pass,
      },
    });
  }

  async sendEmail(recipient: string, subject: string, template: EmailTemplates, variables?: EmailVariables) {
    return this.transporter.sendMail({
      from: `${this.appConfig.appName ? `"${this.appConfig.appName}"` : ''} <${this.appConfig.sendFromEmail}>`,
      to: recipient,
      subject,
      html: this.templates.get(template)({ ...variables, appName: this.appConfig.appName }),
    });
  }
}
