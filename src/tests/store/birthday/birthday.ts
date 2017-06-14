
import * as Vuex from "vuex"
import { getStoreBuilder } from "../../.."
import { BirthdayState, Birthday } from "./state"
import { Module } from "vuex"
import { RootState } from "../index"
import removeFirstAfterDelay from "./actions/removeFirstAfter";
import { ModuleBuilder } from "../../.."

const initialState: BirthdayState = {
    birthdays: []
}

const mb = getStoreBuilder<RootState>().module<BirthdayState>("birthday", initialState)

const addBirthdayMut = (state: BirthdayState, payload: { birthday: Birthday }) => state.birthdays.push(payload.birthday)
const removeFirstBirthdayMut = (state: BirthdayState) => state.birthdays.shift()

const oldestNameGetter = mb.read((state): string | undefined =>
{
    const oldestBirthday = (<Birthday[]>state.birthdays).slice().sort((a, b) => a.dob.getTime() - b.dob.getTime())[0]
    return oldestBirthday && oldestBirthday.name
}, "oldestName")

const dateOfBirthForMethod = mb.read((state) => (name: string) => 
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
    commitAddBirthday: mb.commit(addBirthdayMut),
    commitRemoveFirstBirthday: mb.commit(removeFirstBirthdayMut),

    // actions
    dispatchRemoveFirstAfterDelay: mb.dispatch(removeFirstAfterDelay),
}

// birthday.commitAddBirthday({ birthday: { dob: new Date(1980, 2, 3), name: "Louise" } })
// birthday.commitRemoveFirstBirthday()
// birthday.dateOfBirthFor("Louise")
// birthday.dispatchRemoveFirstAfter(1000)

export default birthday
export { mb as birthdayModuleBuilder }