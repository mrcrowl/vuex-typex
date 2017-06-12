
import { ModuleBuilder } from "../../.."
import { AuthState } from "./state"
import { RootState } from "../index"
import { Module } from "vuex"

const initialState: AuthState = {
    userID: "b6c8185c6d0af2f5d968",
    isLoggedIn: true
}

const m = new ModuleBuilder<AuthState, RootState>("auth", initialState)

const auth = {
    commitSetUserID: m.commit((state, payload: { userID: string }) => state.userID = payload.userID),
    commitSetIsLoggedIn: m.commit((state, payload: { isLoggedIn: boolean }) => state.isLoggedIn = payload.isLoggedIn),
    dispatchLogin: m.dispatch((context) =>
    {
        return
    })
}

export default auth
export const birthdayModule: Module<AuthState, RootState> = m.toVuexModule()