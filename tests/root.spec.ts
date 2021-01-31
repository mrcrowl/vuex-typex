import Vue from "vue";
import * as Vuex from "vuex";
import { getStoreBuilder, StoreBuilder } from "../src/index";

interface RootState { name: string }

describe("Create a store", () =>
{
    let storeBuilder: StoreBuilder<RootState>
    beforeEach(() =>
    {
        Vue.use(Vuex)
        storeBuilder = getStoreBuilder<RootState>("root")
        storeBuilder.reset()
    })

    describe("that has no modules (root-only)", () =>
    {
        it("should access root state value", () =>
        {
            const stateReader = storeBuilder.state()
            const store = storeBuilder.vuexStore({
                state: { name: "david" }
            })
            expect(stateReader().name).toBe("david")
        })

        it("should support getters", () =>
        {
            const uppercaseName = (state: RootState) => state.name.toUpperCase()
            const uppercaseNameGetter = storeBuilder.read(uppercaseName)
            const store = storeBuilder.vuexStore({
                state: { name: "david" }
            })
            expect(uppercaseNameGetter()).toBe("DAVID")
        })
    })
})