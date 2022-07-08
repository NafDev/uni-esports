import { Role } from "./roles";

export interface AccessTokenPayload {
	roles?: Role[];
	pendingEmailVerification?: true;
}
