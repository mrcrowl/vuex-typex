
import { AuthState } from "./state"
import { RootState } from "../index"
import { getStoreBuilder } from "../../../src"

const initialState: AuthState = {
    userID: "b6c8185c6d0af2f5d968",
    isLoggedIn: true 
}

const storeBuilder = getStoreBuilder<RootState>()
const moduleBuilder = storeBuilder.module<AuthState>("auth", initialState)

const auth = {
    commitSetUserID: moduleBuilder.commit((state, payload: { userID: string }) => state.userID = payload.userID, "setUserID"),
    commitSetIsLoggedIn: moduleBuilder.commit((state, payload: { isLoggedIn: boolean }) => state.isLoggedIn = payload.isLoggedIn, "isLoggedIn"),
    dispatchLogin: moduleBuilder.dispatch((context) =>
    {
        return
    }, "login")
}

export default auth