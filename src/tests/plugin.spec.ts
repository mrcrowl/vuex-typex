import { expect } from "chai"
import * as Vue from "vue"
import * as Vuex from "vuex"
import { buildStore } from "./store"
import { RootState } from "./store/index"
import birthday, { birthdayModuleBuilder } from "./store/birthday/birthday"
import auth from "./store/auth/auth"
import { getStoreBuilder, StoreBuilder, ModuleBuilder } from "../index"
import { Store } from "vuex"

interface PluginState { age: number }

describe("Create a store", () =>
{
    let moduleBuilder: ModuleBuilder<PluginState>
    let storeBuilder: StoreBuilder<{}>
    let log: string[] = []
    let commitIncrease: () => void
    let commitDecrease: () => void
    beforeEach(() =>
    {
        storeBuilder = getStoreBuilder("plugin-store")
        moduleBuilder = storeBuilder.module("pluggy", { age: 36 })
        commitIncrease = moduleBuilder.commit((state, payload) => { state.age++ }, "increase")
        commitDecrease = moduleBuilder.commit((state, payload) => { state.age-- }, "decrease")
    })

    describe("that includes a logger plugin", () =>
    {
        it("should log each mutation", () =>
        {
            const loggerPlugin = (store: Store<{}>) =>
            {
                store.subscribe((mutation, state) =>
                {
                    log.push(mutation.type)
                })
            }

            storeBuilder.vuexStore({ plugins: [loggerPlugin] })
            commitIncrease()
            commitDecrease()

            expect(log.length).to.eq(2)
            expect(log).to.deep.equal(["pluggy/increase", "pluggy/decrease"])
        })
    })
})