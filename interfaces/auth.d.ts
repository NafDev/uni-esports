import { Role } from "./roles";

export interface AccessTokenPayload {
	roles?: Role[];
	pendingEmailVerification?: true;
}

export interface SteamOpenIdParameters {
	"openid.assoc_handle": string;
	"openid.claimed_id": string;
	"openid.identity": string;
	"openid.mode": string;
	"openid.ns": string;
	"openid.op_endpoint": string;
	"openid.response_nonce": string;
	"openid.return_to": string;
	"openid.sig": string;
	"openid.signed": string;
}
