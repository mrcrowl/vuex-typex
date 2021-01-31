import Vue from "vue";
import * as Vuex from "vuex";
import { getStoreBuilder, ModuleBuilder, StoreBuilder } from "../src/index";

interface OuterState { str: string, inner: InnerState }
interface InnerState { int: number }

describe("Create a store", () =>
{
    let outerBuilder: ModuleBuilder<OuterState>
    let innerBuilder: ModuleBuilder<InnerState>
    let storeBuilder: StoreBuilder<{}>
    beforeEach(() =>
    {
        Vue.use(Vuex)
        storeBuilder = getStoreBuilder("nested-store")
        outerBuilder = storeBuilder.module("outer", <OuterState>{ str: "hello, world." })
        innerBuilder = outerBuilder.module("inner", <InnerState>{ int: 42 })
        // innerBuilder = storeBuilder.module("outer/inner", { int: 42 })
    })

    describe("that includes nested modules", () =>
    {
        it("should access nested value", () =>
        {
            const store = storeBuilder.vuexStore()
            const readState = outerBuilder.state()

            expect(readState().inner.int).toBe(42)
        })
    })
})