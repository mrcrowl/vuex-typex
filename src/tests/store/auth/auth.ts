
import * as Vuex from "vuex"
import { ModuleBuilder } from "../../.."
import { AuthState } from "./state"
import { RootState } from "../index"
import { Module } from "vuex"

const initialState: AuthState = {
    userID: "b6c8185c6d0af2f5d968",
    isLoggedIn: true 
}

const a = new ModuleBuilder<AuthState, RootState>("auth", initialState)

const auth = {
    commitSetUserID: a.commit((state, payload: { userID: string }) => state.userID = payload.userID, "setUserID"),
    commitSetIsLoggedIn: a.commit((state, payload: { isLoggedIn: boolean }) => state.isLoggedIn = payload.isLoggedIn, "isLoggedIn"),
    dispatchLogin: a.dispatch((context) =>
    {
        return
    }, "login"),
    provideStore: a.provideStore()
}

export default auth
export const authModule: Module<AuthState, RootState> = a.toVuexModule()