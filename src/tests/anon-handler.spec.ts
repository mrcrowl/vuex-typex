import { expect } from "chai"
import * as Vue from "vue"
import Vuex from "vuex"
import { buildStore } from "./store"
import { RootState } from "./store/index"
import birthday, { birthdayModuleBuilder } from "./store/birthday/birthday"
import auth from "./store/auth/auth"
import { getStoreBuilder } from "../index"
import { StoreBuilder, ModuleBuilder } from "../index"

interface AnonState { age: number }

describe("Create an anon store", () =>
{
    let moduleBuilder: ModuleBuilder<AnonState>
    beforeEach(() =>
    {
        const anonStore = getStoreBuilder("anon")
        anonStore.reset()
        moduleBuilder = anonStore.module("anon", { age: 36 })
    })

    describe("try to create a getter with anon function", () =>
    {
        it("should fail", () =>
        {

            expect(() =>
            {
                const readApproxDaysAlive = moduleBuilder.read((state: AnonState) => Math.round(state.age * 365.25))
            }).to.throw()
        })
    })

    describe("try to create a getter with explicit name", () =>
    {
        it("should succeed", () =>
        {
            expect(() =>
            {
                const readApproxDaysAlive = moduleBuilder.read((state: AnonState) => Math.round(state.age * 365.25), "daysAlive")
            }).to.not.throw()
        })
    })

    const daysAliveGetter = (state: AnonState) => Math.round(state.age * 365.25) // <-- named function
    describe("try to create a getter with named function", () =>
    {
        it("should succeed", () =>
        {
            expect(() =>
            {
                const readApproxDaysAlive = moduleBuilder.read(daysAliveGetter)
            }).to.not.throw()
        })
    })
})