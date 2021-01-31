import { getStoreBuilder, StoreBuilder } from "../src/index"
import { ModuleBuilder } from "../src/index"

interface AnonState { age: number }

describe("Create an anon store", () =>
{
    let moduleBuilder: ModuleBuilder<AnonState>
    
    beforeEach(() =>
    {
        const anonStore: StoreBuilder<{}> = getStoreBuilder("anon")
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
            }).toThrow()
        })
    })

    describe("try to create a getter with explicit name", () =>
    {
        it("should succeed", () =>
        {
            expect(() =>
            {
                const readApproxDaysAlive = moduleBuilder.read((state: AnonState) => Math.round(state.age * 365.25), "daysAlive")
            }).not.toThrow()
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
            }).not.toThrow()
        })
    })
})