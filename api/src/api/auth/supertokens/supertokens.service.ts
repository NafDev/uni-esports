import { Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import appConfig, { WEB_EMAIL_VERIFY } from '../../../config/app.config';
import { PrismaService } from '../../../db/prisma/prisma.service';
import { EmailTemplates, SmtpService } from '../../../email/smtp.service';
import { AuthConfigService } from '../auth.config';
import { STEmailVerification, STSession } from './supertokens.types';

@Injectable()
export class SupertokensService {
	constructor(
		private readonly config: AuthConfigService,
		private readonly prisma: PrismaService,
		private readonly smtpService: SmtpService
	) {
		supertokens.init({
			appInfo: config.appInfo,
			supertokens: { connectionURI: config.connectionURI },
			recipeList: [
				STSession.init({
					antiCsrf: 'NONE',
					cookieSameSite: 'strict',
					sessionExpiredStatusCode: 511,
					cookieSecure: appConfig.isProd
				}),
				STEmailVerification.init({
					emailDelivery: {
						override(oI) {
							return {
								async sendEmail(input) {
									switch (input.type) {
										case 'EMAIL_VERIFICATION':
											await smtpService.sendEmail(input.user.email, 'Verify your email', EmailTemplates.VERIFY_USER, {
												link: input.emailVerifyLink
											});
											break;
										default:
											return oI.sendEmail(input);
									}
								}
							};
						}
					},

					async getEmailForUserId(userId) {
						const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

						if (!user) {
							throw new Error('Could not find user');
						}

						return user.email;
					},
					async getEmailVerificationURL() {
						return WEB_EMAIL_VERIFY;
					},

					override: {
						functions(originalImpl) {
							return {
								...originalImpl,
								async createEmailVerificationToken(input) {
									if (await STEmailVerification.isEmailVerified(input.userId, input.email, {})) {
										return { status: 'EMAIL_ALREADY_VERIFIED_ERROR' };
									}

									return originalImpl.createEmailVerificationToken(input);
								},

								async isEmailVerified(input) {
									const user = await prisma.user.findUnique({
										where: { id: input.userId },
										select: { verified: true }
									});

									return user?.verified ?? false;
								},

								async unverifyEmail(input) {
									if (input.userContext.isVerifyingEmail === true) {
										return originalImpl.unverifyEmail(input);
									}

									await prisma.user.update({
										where: { id: input.userId },
										data: { verified: false },
										select: {}
									});
									return { status: 'OK' };
								},

								async verifyEmailUsingToken(input) {
									// Verify an email
									const STResponse = await originalImpl.verifyEmailUsingToken(input);

									if (STResponse.status === 'EMAIL_VERIFICATION_INVALID_TOKEN_ERROR') {
										return { status: 'EMAIL_VERIFICATION_INVALID_TOKEN_ERROR' };
									}

									const { id, email } = STResponse.user;

									// Set user enabled in our DB
									await prisma.user.update({ where: { id }, data: { verified: true } });

									// Remove user from ST DB
									await STEmailVerification.unverifyEmail(id, email, { isVerifyingEmail: true });

									return { status: 'OK', user: { id, email } };
								}
							};
						}
					}
				})
			]
		});
	}
}
