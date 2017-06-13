
import { AuthState } from "./auth/state";
import { BirthdayState } from "../store/birthday/state"
import { Store } from "vuex"
import { authModule } from './auth/auth'
import { birthdayModule } from './birthday/birthday'

export interface RootState
{
    auth: AuthState
    birthday: BirthdayState
}

export const createStore = () => new Store<RootState>({
    modules: {
        auth: authModule,
        birthday: birthdayModule
    }
})