
import * as Vuex from "vuex"
import { ModuleBuilder } from "../../.."
import { BirthdayState, Birthday } from "./state"
import { Module } from "vuex"
import { RootState } from "../index"
import removeFirstAfterDelay from "./actions/removeFirstAfter";

const initialState: BirthdayState = {
    birthdays: []
}

const b = new ModuleBuilder<BirthdayState, RootState>("birthday", initialState)

const addBirthdayMut = (state: BirthdayState, payload: { birthday: Birthday }) => state.birthdays.push(payload.birthday)
const removeFirstBirthdayMut = (state: BirthdayState) => state.birthdays.shift()

const oldestNameGetter = b.read((state): string | undefined =>
{
    const oldestBirthday = (<Birthday[]>state.birthdays).slice().sort((a, b) => a.dob.getTime() - b.dob.getTime())[0]
    return oldestBirthday && oldestBirthday.name
}, "oldestName")

const dateOfBirthForMethod = b.read((state) => (name: string) => 
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
    commitAddBirthday: b.commit(addBirthdayMut),
    commitRemoveFirstBirthday: b.commit(removeFirstBirthdayMut),

    // actions
    dispatchRemoveFirstAfterDelay: b.dispatch(removeFirstAfterDelay),
    provideStore: b.provideStore()
}

// birthday.commitAddBirthday({ birthday: { dob: new Date(1980, 2, 3), name: "Louise" } })
// birthday.commitRemoveFirstBirthday()
// birthday.dateOfBirthFor("Louise")
// birthday.dispatchRemoveFirstAfter(1000)

export default birthday
export const birthdayModule: Module<BirthdayState, RootState> = b.toVuexModule()