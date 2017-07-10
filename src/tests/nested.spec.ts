import { expect } from "chai"
import * as Vue from "vue"
import * as Vuex from "vuex"
import { buildStore } from "./store"
import { RootState } from "./store/index"
import { getStoreBuilder, StoreBuilder, ModuleBuilder } from "../index"
import { Store } from "vuex"

interface OuterState { str: string, inner: InnerState }
interface InnerState { int: number }

describe("Create a store", () =>
{
    let outerBuilder: ModuleBuilder<OuterState>
    let innerBuilder: ModuleBuilder<InnerState>
    let storeBuilder: StoreBuilder<{}>
    beforeEach(() =>
    {
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
            
            expect(readState().inner.int).to.equal(42)
        })
    })
})