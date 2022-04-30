/* eslint-disable @typescript-eslint/naming-convention */
import { IsNotEmpty } from 'class-validator';
import { extractString } from '../../../util/helpers';

// https://stackoverflow.com/questions/53573820/steam-openid-signature-validation/63652502#63652502
export class SteamOpenIdParams {
  @IsNotEmpty() 'openid.ns': string;
  @IsNotEmpty() 'openid.mode': string;
  @IsNotEmpty() 'openid.op_endpoint': string;
  @IsNotEmpty() 'openid.claimed_id': string;
  @IsNotEmpty() 'openid.identity': string;
  @IsNotEmpty() 'openid.return_to': string;
  @IsNotEmpty() 'openid.response_nonce': string;
  @IsNotEmpty() 'openid.assoc_handle': string;
  @IsNotEmpty() 'openid.signed': string;
  @IsNotEmpty() 'openid.sig': string;
}

/**
 * Create a URL for a client to authorise themselves through Steam (OpenID 2.0)
 * @param returnUrl The URL which the client will be redirected (by Steam) to after authentication
 * @param realm The domain which is requesting permission from the Steam user for their profile information
 */
export function steamAuthenticationRedirectUrl(returnUrl: string, realm: string) {
  return (
    'https://steamcommunity.com/openid/login' +
    '?openid.ns=http://specs.openid.net/auth/2.0' +
    '&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select' +
    '&openid.identity=http://specs.openid.net/auth/2.0/identifier_select' +
    `&openid.return_to=${returnUrl}` +
    `&openid.realm=${realm}` +
    '&openid.mode=checkid_setup'
  );
}

/**
 * Create a Steam OpenID 2.0 authentication check URL
 * @returns The URL to `GET` to verify that a user was authenticated by Steam
 */
export function steamAuthenticationVerifyUrl(params: Required<SteamOpenIdParams>) {
  return `https://steamcommunity.com/openid/login?${new URLSearchParams({
    ...params,
    'openid.mode': 'check_authentication',
  }).toString()}`;
}

export function steamIdFromClaimedIdParam(claimedId: string) {
  return extractString(/\d{17,}/, claimedId);
}

/**
 * The expected authentication check response from Steam is:
 * ```
 * ns:http://specs.openid.net/auth/2.0
 * is_valid:true
 * ```
 *
 * @param response The response string from `GET https://steamcommunity.com/openid/login?openid.mode=check_authentication&...`
 * @returns Outcome of verification check, else throws error on unexpected response
 */
export function evaluateSteamOidResponse(response: string) {
  /*
   */
  if (!response.includes('is_valid')) {
    throw new Error('Unexpected response from Steam OpenID authentication server');
  }

  return response.includes('is_valid:true');
}
