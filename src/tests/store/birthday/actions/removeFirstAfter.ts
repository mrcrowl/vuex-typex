import birthday from "../birthday"
import { BareActionContext } from "../../../../index"
import { BirthdayState } from "../state"
import { RootState } from "../../root"

export default async function removeFirstAfter(context: BareActionContext<BirthdayState, RootState>, delay: number)
{
    if (context.state.birthdays.length > 2)
    {
        await new Promise((resolve, _) => setTimeout(resolve, 1000)); // second delay
        birthday.commitRemoveFirstBirthday()
    }
}