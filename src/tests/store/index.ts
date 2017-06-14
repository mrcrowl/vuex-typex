
import { getStoreBuilder } from "../.."
import { AuthState } from "./auth/state";
import { BirthdayState } from "./birthday/state"
import { Store } from "vuex"

export interface RootState
{
    auth: AuthState
    birthday: BirthdayState
}

export const buildStore = () => getStoreBuilder<RootState>().vuexStore()