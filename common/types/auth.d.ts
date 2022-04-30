import { Roles } from "./roles";

export interface AccessTokenPayload {
  roles?: Roles[];
}
