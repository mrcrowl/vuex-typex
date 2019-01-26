import { expect } from "chai";
import Vue from "vue";
import * as Vuex from "vuex";
import { buildStore } from "./store";
import birthday from "./store/birthday/birthday";
import { RootState } from "./store/index";

let store: Vuex.Store<RootState>

async function test()
{
    Vue.use(Vuex)
    store = buildStore()
    store.replaceState({
        birthday: {
            birthdays: [
                { name: "Richard", dob: new Date(1995, 10, 11) },
                { name: "Erlich", dob: new Date(1983, 1, 17) },
                { name: "Nelson", dob: new Date(1996, 3, 28) },
                { name: "Dinesh", dob: new Date(1989, 1, 7) },
                { name: "Bertram", dob: new Date(1985, 7, 14) },
                { name: "Donald", dob: new Date(1994, 5, 31) },
                { name: "Monica", dob: new Date(1996, 8, 26) },
            ]
        },
        auth: { isLoggedIn: false, userID: "" }
    })
    expect(birthday.oldestName).equal("Erlich")
    await birthday.dispatchRemoveFirstAfterDelay(20)
    await birthday.dispatchRemoveFirstAfterDelay(20)
    expect(birthday.oldestName).equal("Bertram")
}

test();