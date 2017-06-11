
import { ModuleBuilder } from "../../.."
import { BirthdayState, Birthday } from "./state"
import { Module } from "vuex"
import { RootState } from "../root"

const initialState: BirthdayState = {
    birthdays: [
        {
            name: "Jacob",
            dob: new Date(2006, 10, 11)
        },
        {
            name: "Danny",
            dob: new Date(2009, 11, 30)
        }
    ]
}

const builder = new ModuleBuilder<BirthdayState, RootState>("birthday", initialState)

const commitAddBirthday = builder.commit((state, payload: { birthday: Birthday }) =>
{
    state.birthdays.push(payload.birthday)
})

const commitRemoveFirstBirthday = builder.commit((state) =>
{
    state.birthdays.shift()
})

const getOldestName = builder.read((state): Birthday | undefined =>
{
    const sortedBirthdays = (<Birthday[]>[]).sort((a, b) => a.dob.getTime() - b.dob.getTime())
    return sortedBirthdays[0]
})

const getDOBforName = builder.read((state) => (name: string) => 
{
    const matches = state.birthdays.filter(b => b.name === name)
    if (matches.length)
    {
        return matches[0].dob
    }

    return
}, "dob")

const dispatchRemoveFirstAfter = builder.dispatch(async (context, delay: number) =>
{
    if (context.state.birthdays.length > 2)
    {
        await new Promise((resolve, _) => setTimeout(resolve, 1000)); // second delay
        commitRemoveFirstBirthday()
    }
})

const module = {
    // getters + methods
    get oldestName() { return getOldestName() },
    dateOfBirthFor(name: string) { return getDOBforName()(name) },

    // mutations    
    commitAddBirthday,
    commitRemoveFirstBirthday,

    // actions
    dispatchRemoveFirstAfter,
}

module.commitAddBirthday({ birthday: { dob: new Date(1980, 2, 3), name: "Louise" } })
module.commitRemoveFirstBirthday()
module.dateOfBirthFor("Louise")
module.dispatchRemoveFirstAfter(1000)

export default module

export const vuexModule: Module<BirthdayState, RootState> = builder.toVuexModule()