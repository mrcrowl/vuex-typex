import { expect } from "chai"
import * as Vue from "vue"
import * as Vuex from "vuex"
import { createStore } from "./store"
import { RootState } from "./store/index"
import birthday from "./store/birthday/birthday"
import auth from "./store/auth/auth"

describe("Running an action", () =>
{
    let store: Vuex.Store<RootState>

    beforeEach(() =>
    {
        Vue.use(Vuex)
        store = createStore()
        store.replaceState({
            birthday: {
                birthdays: [
                    { name: "Richard", dob: new Date(1995, 10, 11) },
                    { name: "Erlich", dob: new Date(1983, 1, 17) },
                    { name: "Nelson", dob: new Date(1996, 3, 28) },
                    { name: "Dinesh", dob: new Date(1989, 1, 7) },
                    { name: "Bertram", dob: new Date(1985, 7, 14) },
                    { name: "Donald", dob: new Date(1994, 5, 31) },
                    { name: "Monica", dob: new Date(1996, 8, 26) },
                ]
            },
            auth: { isLoggedIn: false, userID: "" }
        })
        auth.provideStore(store)
        birthday.provideStore(store)
    })

    describe("remove first 2 birthdays", () =>
    {
        it("should show Bertram after removing first two birthdays", async () =>
        {
            expect(birthday.oldestName).equal("Erlich")
            await birthday.dispatchRemoveFirstAfterDelay(25)
            await birthday.dispatchRemoveFirstAfterDelay(25)
            expect(birthday.oldestName).equal("Bertram")
        })
    })
})