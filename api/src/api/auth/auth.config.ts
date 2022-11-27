import { Injectable } from '@nestjs/common';
import type { AppInfo } from 'supertokens-node/lib/build/types';
import appConfig from '../../config/app.config';

type AuthModuleConfig = { appInfo: AppInfo; connectionURI: string; apiKey?: string; apiBasePath?: string };

@Injectable()
export class AuthConfigService implements AuthModuleConfig {
	appInfo: AppInfo;
	connectionURI: string;
	apiKey?: string | undefined;
	apiBasePath?: string | undefined;

	constructor() {
		this.appInfo = {
			appName: appConfig.APP_NAME,
			apiDomain: appConfig.API_DOMAIN,
			websiteDomain: appConfig.WEB_DOMAIN,
			apiBasePath: appConfig.API_BASE_PATH
		};

		this.connectionURI = appConfig.ST_CORE_URL;
	}
}
