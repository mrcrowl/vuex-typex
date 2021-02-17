import { getStoreBuilder } from "../src/index"
import Vuex, { Store, ActionContext } from "vuex"
import Vue from "vue"
const delay = (duration: number) => new Promise((c, e) => setTimeout(c, duration))

Vue.use(Vuex)

export interface RootState { basket: BasketState }
export interface BasketState { items: Item[] }
export interface Item { id: string, name: string }

const storeBuilder = getStoreBuilder<RootState>()
const moduleBuilder = storeBuilder.module<BasketState>("basket", { items: [] })

namespace basket
{
    const appendItemMutation = (state: BasketState, payload: { item: Item }) => state.items.push(payload.item)
    const delayedAppendAction = async (context: ActionContext<BasketState, RootState>) =>
    {
        await delay(1000)
        basket.commitAppendItem({ item: { id: "abc123", name: "ABC Item" } })
    }

    export const commitAppendItem = moduleBuilder.commit(appendItemMutation)
    export const dispatchDelayedAppend = moduleBuilder.dispatch(delayedAppendAction)
}
export default basket