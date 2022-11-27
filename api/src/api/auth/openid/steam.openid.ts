import { Equals, IsNotEmpty } from 'class-validator';
import appConfig, { WEB_STEAM_REDIRECT } from '../../../config/app.config';

// https://stackoverflow.com/questions/53573820/steam-openid-signature-validation/63652502#63652502
export class SteamOpenIdParameters {
	@IsNotEmpty() 'openid.assoc_handle': string;
	@IsNotEmpty() 'openid.claimed_id': string;
	@IsNotEmpty() 'openid.identity': string;
	@IsNotEmpty() @Equals('id_res') 'openid.mode': string;
	@IsNotEmpty() @Equals('http://specs.openid.net/auth/2.0') 'openid.ns': string;
	@IsNotEmpty() @Equals('https://steamcommunity.com/openid/login') 'openid.op_endpoint': string;
	@IsNotEmpty() 'openid.response_nonce': string;
	@IsNotEmpty() @Equals(WEB_STEAM_REDIRECT) 'openid.return_to': string;
	@IsNotEmpty() 'openid.sig': string;
	@IsNotEmpty() 'openid.signed': string;
}

export const steamOpenId = {
	/**
	 * Create a URL for a client to authorise themselves through Steam (OpenID 2.0)
	 * @param returnUrl The URL which the client will be redirected (by Steam) to after authentication
	 * @param realm The domain which is requesting permission from the Steam user for their profile information
	 */
	authRedirectUrl(returnUrl: string, realm: string) {
		return (
			'https://steamcommunity.com/openid/login' +
			'?openid.ns=http://specs.openid.net/auth/2.0' +
			'&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select' +
			'&openid.identity=http://specs.openid.net/auth/2.0/identifier_select' +
			`&openid.return_to=${returnUrl}` +
			`&openid.realm=${realm}` +
			'&openid.mode=checkid_setup'
		);
	},

	/**
	 * Create a Steam OpenID 2.0 authentication check URL from client-provided parameters
	 * @returns The URL to `GET` to verify that a user was authenticated by Steam
	 */
	authVerifyUrl(parameters: Required<SteamOpenIdParameters>) {
		return `https://steamcommunity.com/openid/login?${new URLSearchParams({
			...parameters,
			'openid.mode': 'check_authentication'
		}).toString()}`;
	},

	/**
	 * The expected authentication check response from Steam is:
	 * ```text
	 * ns:http://specs.openid.net/auth/2.0
	 * is_valid:true
	 * ```
	 * @param response The response string from `GET https://steamcommunity.com/openid/login?openid.mode=check_authentication&...`
	 * @returns Outcome of verification check, else throws error on unexpected response
	 */
	evaluateAuthResponse(response: string) {
		if (!response.includes('is_valid')) {
			throw new Error(`Unexpected response from Steam OpenID authentication server - ${response}`);
		}

		return response.includes('is_valid:true');
	},

	/**
	 * Extract Steam64 ID from OpenID 2.0 response header
	 * @param claimedId `openid.claimed_id`
	 */
	stripClaimedId(claimedId: string) {
		return claimedId.replace('https://steamcommunity.com/openid/id/', '');
	}
};
