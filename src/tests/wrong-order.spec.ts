import { expect } from "chai"
import * as Vue from "vue"
import * as Vuex from "vuex"
import { buildStore } from "./store"
import { RootState } from "./store/index"
import birthday, { birthdayModuleBuilder } from "./store/birthday/birthday"
import auth from "./store/auth/auth"
import { getStoreBuilder } from "../index"

describe("Output the store", () =>
{
    let store: Vuex.Store<RootState>

    beforeEach(() =>
    {
        Vue.use(Vuex)
        store = buildStore()
        store.replaceState({
            birthday: { birthdays: [] },
            auth: { isLoggedIn: false, userID: "" }
        })
    })

    describe("then try to add another module", () =>
    {
        it("should fail", () =>
        {
            expect(() => getStoreBuilder().module("blah", {})).to.throw()
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