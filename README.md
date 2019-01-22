# Vuex-Typex

### A TypeScript pattern for strongly-typed access to Vuex Store modules

I really like [vuex-typescript](https://github.com/istrib/vuex-typescript/) by [@istrib](https://github.com/istrib)

I just wanted to take the ideas _bit_ further.

My main changes are:
 - Avoid passing $store/context to the accessor methods: we can encapsulate these within the accessors by providing the store later:
  i.e. `basket.commitAppendItem(newItem)` should be sufficient.
 - No need to distinguish between payload / payload-less versions of commit + dispatch.
   Typescript overloads solve this problem.
 - Promises returned from dispatch should be strongly-typed.
 - Assumes namespaced modules

I also took the point of view that we don't need to start with a vuex-store options object.  If we treat the accessor-creator as a builder, then the store can be generated:

```typescript
import { getStoreBuilder, BareActionContext } from "vuex-typex"
import Vuex, { Store } from "vuex"
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
    const delayedAppendAction = async (context: BareActionContext<BasketState, RootState>) =>
    {
        await delay(1000)
        basket.commitAppendItem({ item: { id: "abc123", name: "ABC Item" } })
    }

    export const commitAppendItem = moduleBuilder.commit(appendItemMutation)
    export const dispatchDelayedAppend = moduleBuilder.dispatch(delayedAppendAction)
}
export default basket

/// in the main app file
const storeBuilder = getStoreBuilder<RootState>()
new Vue({
    el: '#app',
    template: "....",
    store: storeBuilder.vuexStore()
})
```

- A [more complete example as a gist](https://gist.github.com/mrcrowl/d7fd8d0369759a9fe315dbf27dc1bced)
