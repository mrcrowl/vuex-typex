
import { AuthState } from "./auth/state";
import { BirthdayState } from "../store/birthday/state"

export interface RootState
{
    auth: AuthState
    birthday: BirthdayState
}