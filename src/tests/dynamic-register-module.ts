import { expect } from "chai"
import Vue from "vue"
import Vuex, { Store } from "vuex"
import { buildStore } from "./store"
import { RootState } from "./store/index"
import auth from "./store/auth/auth"
import { getStoreBuilder } from "../index"

describe("Output the store", () =>
{
    let store: Store<RootState>

    beforeEach(() =>
    {
        Vue.use(Vuex)
    })

    describe("register module before calling vuexStore()", () =>
    {
        it("should fail", async () =>
        { 
            expect(() => {
                getStoreBuilder().registerModule('aModule')
            }).to.throw()
        })
    })

    describe("call an unregistered module", () =>
    {
        it("should only work after registered", async () =>
        {
            store = buildStore()
            const birthday = (await import("./store/birthday/birthday")).default

            expect(() => {
                birthday.commitClearBirthdays()
            }).to.throw()

            getStoreBuilder().registerModule('birthday')
            
            expect(() => {
                birthday.commitClearBirthdays()
            }).to.not.throw()
        })
    })
})