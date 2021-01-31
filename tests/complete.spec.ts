import Vue from "vue";
import Vuex, { Store } from "vuex";
import birthday from "./store/birthday/birthday";
import { buildStore, RootState } from "./store/index";

describe("Run an action", () =>
{
    let store: Store<RootState>

    beforeEach(() =>
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
    })

    describe("that removes first 2 birthdays with delays", () =>
    {
        it("should show Bertram after removing first two birthdays", async () =>
        {
            expect(birthday.oldestName).toEqual("Erlich")
            await birthday.dispatchRemoveFirstAfterDelay(5)
            await birthday.dispatchRemoveFirstAfterDelay(5)
            expect(birthday.oldestName).toEqual("Bertram")
        })

        it("DOB for Betram should be defined", async () =>
        {
            expect(birthday.dateOfBirthFor("Bertram")).toBeDefined
        })

        it("DOB for Betram should be 14-Aug-1985", async () =>
        {
            expect(birthday.dateOfBirthFor("Bertram")!.getTime()).toEqual(new Date(1985, 7, 14).getTime())
        })

        it("DOB for Joe Bloggs should be undefined", async () =>
        {
            expect(birthday.dateOfBirthFor("Joe Bloggs")).toBeUndefined
        })

        it("oldestName should be undefined when no birthdays", async () =>
        {
            birthday.commitClearBirthdays()
            expect(birthday.oldestName).toBeUndefined
        })

        it("oldestName should be Nancy when birthday added from empty", async () =>
        {
            birthday.commitClearBirthdays()
            birthday.commitAddBirthday({ birthday: { dob: new Date(2017, 5, 15), name: "Nancy" } })
            expect(birthday.oldestName).toEqual("Nancy")
        })
    })
})