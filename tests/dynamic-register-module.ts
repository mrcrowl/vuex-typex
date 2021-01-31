import Vue from "vue"
import Vuex, { Store } from "vuex"
import { buildStore } from "./store"
import { RootState } from "./store/index"
import { getStoreBuilder } from "../src/index"

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
            }).toThrow()
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
            }).toThrow()

            getStoreBuilder().registerModule('birthday')
            
            expect(() => {
                birthday.commitClearBirthdays()
            }).not.toThrow()
        })
    })
})