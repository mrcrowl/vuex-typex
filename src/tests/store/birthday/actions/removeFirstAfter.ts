import birthday from "../birthday"
import { BareActionContext } from "../../../../index"
import { BirthdayState } from "../state"
import { RootState } from "../../index"

export default async function removeFirstAfterDelay(context: BareActionContext<BirthdayState, RootState>, delay: number)
{
    if (context.state.birthdays.length > 2)
    {
        await new Promise((resolve, _) => setTimeout(resolve, delay)); // second delay
        birthday.commitRemoveFirstBirthday()
    }

    return
}