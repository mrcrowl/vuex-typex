
import { ActionContext, ActionTree, GetterTree, Module, MutationTree, Store, StoreOptions, ModuleTree } from "vuex"

const useRootNamespace = { root: true }

export type MutationHandler<S, P> = (state: S, payload: P) => void
export type ActionHandler<S, R, P, T> = (context: BareActionContext<S, R>, payload: P) => Promise<T> | T
export type GetterHandler<S, R, T> = (state: S, rootState: R) => T

interface RootStore<R> extends Store<R> { rootGetters?: any }

export interface BareActionContext<S, R>
{
    state: S
    rootState: R
}

class ModuleBuilderImpl<S, R={}> implements ModuleBuilder<S, R> {
    private _store: RootStore<R>

    private _getters: GetterTree<S, R> = {}
    private _mutations: MutationTree<S> = {}
    private _actions: ActionTree<S, R> = {}

    private _vuexModule: Module<S, R> | undefined

    constructor(public readonly namespace: string, private state: S) { }

    commit<P>(handler: MutationHandler<S, void>): () => void
    commit<P>(handler: MutationHandler<S, P>): (payload: P) => void
    commit<P>(handler: MutationHandler<S, void>, name: string): () => void
    commit<P>(handler: MutationHandler<S, P>, name: string): (payload: P) => void
    commit<P>(handler: MutationHandler<S, P>, name?: string)
    {
        const { key, namespacedKey } = qualifyKey(handler, this.namespace, name)
        if (this._mutations[key])
        {
            throw new Error(`There is already a mutation named ${key}.`)
        }
        this._mutations[key] = handler
        return ((payload: P) => this._store.commit(namespacedKey, payload, useRootNamespace)) as any
    }

    dispatch<P, T>(handler: ActionHandler<S, R, void, void>): () => Promise<void>
    dispatch<P, T>(handler: ActionHandler<S, R, P, void>): (payload: P) => Promise<void>
    dispatch<P, T>(handler: ActionHandler<S, R, void, T>): () => Promise<T>
    dispatch<P, T>(handler: ActionHandler<S, R, P, T>): (payload: P) => Promise<T>
    dispatch<P, T>(handler: ActionHandler<S, R, void, void>, name: string): () => Promise<void>
    dispatch<P, T>(handler: ActionHandler<S, R, P, void>, name: string): (payload: P) => Promise<void>
    dispatch<P, T>(handler: ActionHandler<S, R, void, T>, name: string): () => Promise<T>
    dispatch<P, T>(handler: ActionHandler<S, R, P, T>, name: string): (payload: P) => Promise<T>
    dispatch<P, T>(handler: any, name?: string): any
    {
        const { key, namespacedKey } = qualifyKey(handler, this.namespace, name)
        if (this._actions[key])
        {
            throw new Error(`There is already an action named ${key}.`)
        }
        this._actions[key] = handler
        return (payload: P) => this._store.dispatch(namespacedKey, payload, useRootNamespace)
    }

    read<T>(handler: GetterHandler<S, R, T>): () => T
    read<T>(handler: GetterHandler<S, R, T>, name: string): () => T
    read<T>(handler: GetterHandler<S, R, T>, name?: string): () => T
    {
        const { key, namespacedKey } = qualifyKey(handler, this.namespace, name)
        if (this._getters[key])
        {
            throw new Error(`There is already a getter named ${key}.`)
        }
        this._getters[key] = handler
        return () =>
        {
            if (this._store.rootGetters)
            {
                return this._store.rootGetters[namespacedKey] as T
            }
            return this._store.getters[namespacedKey] as T
        }
    }

    vuexModule(): Module<S, R>
    {
        if (!this._vuexModule)
        {
            this._vuexModule = {
                namespaced: true,
                state: this.state,
                getters: this._getters,
                mutations: this._mutations,
                actions: this._actions
            }
        }
        return this._vuexModule
    }

    _provideStore(store: Store<R>)
    {
        this._store = store
    }
}

function qualifyKey(handler: Function, namespace: string | undefined, name?: string): { key: string, namespacedKey: string }
{
    const key: string = name || handler.name
    if (!key)
    {
        throw new Error(`Vuex handler functions must not be anonymous. Possible causes: fat-arrow functions, uglify.  To fix, pass a unique name as a second parameter after your callback.`)
    }
    return namespace ? { key, namespacedKey: `${namespace}/${key}` } : { key, namespacedKey: key }
}

export interface ModuleBuilder<S, R={}>
{
    /** The namespace of this ModuleBuilder */
    readonly namespace: string

    /** Returns a strongly-typed commit function for the provided mutation handler */
    commit<P>(handler: MutationHandler<S, void>): () => void
    commit<P>(handler: MutationHandler<S, P>): (payload: P) => void
    commit<P>(handler: MutationHandler<S, void>, name: string): () => void
    commit<P>(handler: MutationHandler<S, P>, name: string): (payload: P) => void

    /** Returns a strongly-typed dispatch function for the provided action handler */
    dispatch<P, T>(handler: ActionHandler<S, R, void, void>): () => Promise<void>
    dispatch<P, T>(handler: ActionHandler<S, R, P, void>): (payload: P) => Promise<void>
    dispatch<P, T>(handler: ActionHandler<S, R, void, T>): () => Promise<T>
    dispatch<P, T>(handler: ActionHandler<S, R, P, T>): (payload: P) => Promise<T>
    dispatch<P, T>(handler: ActionHandler<S, R, void, void>, name: string): () => Promise<void>
    dispatch<P, T>(handler: ActionHandler<S, R, P, void>, name: string): (payload: P) => Promise<void>
    dispatch<P, T>(handler: ActionHandler<S, R, void, T>, name: string): () => Promise<T>
    dispatch<P, T>(handler: ActionHandler<S, R, P, T>, name: string): (payload: P) => Promise<T>

    /** Returns a strongly-typed read function for the provided getter function */
    read<T>(handler: GetterHandler<S, R, T>): () => T
    read<T>(handler: GetterHandler<S, R, T>, name: string): () => T

    /** Returns a Vuex Module.  Called after all strongly-typed functions have been obtained */
    vuexModule(): Module<S, R>

    _provideStore(store: Store<R>): void
}

class StoreBuilderImpl<R> implements StoreBuilder<R> {
    private _moduleBuilders: ModuleBuilder<any, R>[] = []
    private _vuexStore: Store<R> | undefined

    constructor() { }

    module<S>(namespace: string, state: S): ModuleBuilder<S, R>
    {
        if (this._vuexStore)
        {
            throw new Error("Can't call module() after vuexStore() has been called")
        }
        const builder = new ModuleBuilderImpl<S, R>(namespace, state)
        this._moduleBuilders.push(builder)
        return builder
    }

    vuexStore(): Store<R>
    {
        if (!this._vuexStore)
        {
            const options: StoreOptions<R> = this.createStoreOptions()
            const store = new Store<R>(options)
            this._moduleBuilders.forEach(m => m._provideStore(store))
            this._vuexStore = store
        }
        return this._vuexStore
    }

    private createStoreOptions(): StoreOptions<R>
    {
        const modules: ModuleTree<R> = {}
        this._moduleBuilders.forEach(m => modules[m.namespace] = m.vuexModule())
        return { modules }
    }
}

export interface StoreBuilder<R>
{
    /** Get a ModuleBuilder for the namespace provided */
    module<S>(namespace: string, state: S): ModuleBuilder<S, R>

    /** Output a Vuex Store after all modules have been built */
    vuexStore(): Store<R>
}

const storeBuilderSingleton = new StoreBuilderImpl<any>()
const namedStoreBuilderMap: { [name: string]: StoreBuilderImpl<any> } = Object.create(null)

/** Get a reference to the default store builder */
export function getStoreBuilder<R>(): StoreBuilder<R>
/** Get a reference to a named store builder */
export function getStoreBuilder<R>(name: string): StoreBuilder<R>
export function getStoreBuilder<R>(name?: string): StoreBuilder<R>
{
    // the default store builder
    if (!name)
    {
        return storeBuilderSingleton
    }

    // a named store builder    
    const builder = namedStoreBuilderMap[name] || (namedStoreBuilderMap[name] = new StoreBuilderImpl<R>())
    return builder
}
