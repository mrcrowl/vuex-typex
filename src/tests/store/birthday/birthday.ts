
import { ModuleBuilder } from "../../.."
import { BirthdayState, Birthday } from "./state"
import { Module } from "vuex"
import { RootState } from "../root"
import * as Vuex from "vuex"
import removeFirstAfter from "../../../../dist/tests/store/birthday/actions/removeFirstAfter"

const initialState: BirthdayState = {
    birthdays: [
        {
            name: "Richard",
            dob: new Date(1995, 10, 11)
        },
        {
            name: "Erlich",
            dob: new Date(1983, 1, 17)
        },
        {
            name: "Nelson",
            dob: new Date(1996, 3, 28)
        },
        {
            name: "Dinesh",
            dob: new Date(1989, 1, 7)
        },
        {
            name: "Bertram",
            dob: new Date(1985, 7, 14)
        },
        {
            name: "Donald",
            dob: new Date(1994, 5, 31)
        },
        {
            name: "Monica",
            dob: new Date(1996, 8, 26)
        }
    ]
}

const m = new ModuleBuilder<BirthdayState, RootState>("birthday", initialState)

const addBirthdayMut = (state: BirthdayState, payload: { birthday: Birthday }) => state.birthdays.push(payload.birthday)
const removeFirstBirthdayMut = (state: BirthdayState) => state.birthdays.shift()

const oldestNameGetter = m.read((state): Birthday | undefined =>
{
    const sortedBirthdays = (<Birthday[]>[]).sort((a, b) => a.dob.getTime() - b.dob.getTime())
    return sortedBirthdays[0]
}, "oldestName")

const dateOfBirthForMethod = m.read((state) => (name: string) => 
{
    const matches = state.birthdays.filter(b => b.name === name)
    if (matches.length)
    {
        return matches[0].dob
    }

    return
}, "dob")

const birthday = {
    // getters + methods
    get oldestName() { return oldestNameGetter() },
    dateOfBirthFor(name: string) { return dateOfBirthForMethod()(name) },

    // mutations    
    commitAddBirthday: m.commit(addBirthdayMut),
    commitRemoveFirstBirthday: m.commit(removeFirstBirthdayMut),

    // actions
    dispatchRemoveFirstAfter: m.dispatch(removeFirstAfter)
}

// birthday.commitAddBirthday({ birthday: { dob: new Date(1980, 2, 3), name: "Louise" } })
// birthday.commitRemoveFirstBirthday()
// birthday.dateOfBirthFor("Louise")
// birthday.dispatchRemoveFirstAfter(1000)

export default birthday
export const birthdayModule: Module<BirthdayState, RootState> = m.toVuexModule()