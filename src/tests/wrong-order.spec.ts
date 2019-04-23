import { expect } from "chai"
import Vue from "vue"
import Vuex, { Store } from "vuex"
import { buildStore } from "./store"
import { RootState } from "./store/index"
import birthday, { birthdayModuleBuilder } from "./store/birthday/birthday"
import auth from "./store/auth/auth"
import { getStoreBuilder } from "../index"

describe("Output the store", () =>
{
    let store: Store<RootState>

    beforeEach(() =>
    {
        Vue.use(Vuex)
        store = buildStore()
        store.replaceState({
            birthday: { birthdays: [] },
            auth: { isLoggedIn: false, userID: "" }
        })
    })

    describe("then create a different store and try to add a module", () =>
    {
        it("should succeed", () =>
        {
            expect(() =>
            {
                const anotherStore = getStoreBuilder("another")
                anotherStore.module("another-module", {})
            }).to.not.throw()
        })
    })
})