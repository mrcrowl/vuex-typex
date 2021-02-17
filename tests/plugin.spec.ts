import Vue from "vue";
import * as Vuex from "vuex";
import { Store } from "vuex";
import { getStoreBuilder, ModuleBuilder, StoreBuilder } from "../src/index";

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
        Vue.use(Vuex)
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

            expect(log.length).toBe(2)
            expect(log).toEqual(["pluggy/increase", "pluggy/decrease"])
        })
    })
})