
import { ActionContext, ActionTree, GetterTree, Module, MutationTree, Store, StoreOptions, ModuleTree, Plugin } from "vuex"

const useRootNamespace = { root: true }

export type MutationHandler<S, P> = (state: S, payload: P) => void
export type ActionHandler<S, R, P, T> = (context: BareActionContext<S, R>, payload: P) => Promise<T> | T
export type GetterHandler<S, R, T> = (state: S, rootState: R) => T


interface Dictionary<T> { [key: string]: T }
interface RootStore<R> extends Store<R> { rootGetters?: any }

export interface BareActionContext<S, R>
{
    state: S
    rootState: R
}

class ModuleBuilderImpl<S, R={}> implements ModuleBuilder<S, R> {
    protected _store: RootStore<R> | undefined

    protected _getters: GetterTree<S, R> = {}
    protected _mutations: MutationTree<S> = {}
    protected _actions: ActionTree<S, R> = {}
    protected _moduleBuilders: Dictionary<ModuleBuilder<any, R>> = {}

    protected _vuexModule: Module<S, R> | undefined

    constructor(public readonly namespace: string, private _initialState: S) { }

    state(): () => S
    {
        if (!this.namespace)
        {
            return () => <any>this._store!.state as S
        }
        else if (this.namespace.indexOf("/") < 0)
        {
            return () => (<any>this._store!.state)[this.namespace] as S
        }
        else
        {
            const namespaces = this.namespace.split("/")
            return () =>
            {
                let accessor: any = this._store!.state
                for (const name of namespaces)
                {
                    accessor = accessor[name]
                }
                return (<any>accessor) as S
            }
        }
    }

    module<M>(namespace: string, initialState: M): ModuleBuilder<M, R>
    module<M>(namespace: string): ModuleBuilder<M, R>
    module<M>(namespace: string, initialState?: M): ModuleBuilder<M, R>
    {
        const existingModule = this._moduleBuilders[namespace]
        const qualifiedNamespace = qualifyNamespace(this.namespace, namespace)
        if (!initialState)
        {
            // no second argument: get an existing module
            if (!existingModule)
            {
                throw new Error(`There is no module named '${qualifiedNamespace}'.  If you meant to create a nested module, then provide initial-state as the second argument.'`)
            }
            return existingModule
        }

        // both arguments: create a module        
        if (existingModule)
        {
            throw new Error(`There is already a module named '${qualifiedNamespace}'.  If you meant to get the existing module, then provide no initialState argument.`)
        }
        const nestedBuilder = new ModuleBuilderImpl(qualifiedNamespace, initialState)
        this._moduleBuilders[namespace] = nestedBuilder
        return nestedBuilder
    }

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
        return ((payload: P) => this._store!.commit(namespacedKey, payload, useRootNamespace)) as any
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
        return (payload: P) => this._store!.dispatch(namespacedKey, payload, useRootNamespace)
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
            if (this._store!.rootGetters)
            {
                return this._store!.rootGetters[namespacedKey] as T
            }
            return this._store!.getters[namespacedKey] as T
        }
    }

    vuexModule(): Module<S, R>
    {
        if (!this._vuexModule)
        {
            // build nested modules recursively, if any
            const modules: ModuleTree<R> = {}
            for (const namespace of Object.keys(this._moduleBuilders))
            {
                modules[namespace] = this._moduleBuilders[namespace].vuexModule()
            }

            this._vuexModule = {
                namespaced: true,
                state: this._initialState,
                getters: this._getters,
                mutations: this._mutations,
                actions: this._actions,
                modules
            }
        }
        return this._vuexModule
    }

    _provideStore(store: Store<R>)
    {
        this._store = store

        forEachValue(this._moduleBuilders, m => m._provideStore(store))
    }
}

function qualifyKey(handler: Function, namespace: string | undefined, name?: string): { key: string, namespacedKey: string }
{
    const key: string = name || handler.name
    if (!key)
    {
        throw new Error(`Vuex handler functions must not be anonymous. Possible causes: fat-arrow functions, uglify.  To fix, pass a unique name as a second parameter after your callback.`)
    }
    return { key, namespacedKey: qualifyNamespace(namespace, key) }
}

function qualifyNamespace(namespace: string | undefined, key: string)
{
    return namespace ? `${namespace}/${key}` : key
}

export interface ModuleBuilder<S, R={}>
{
    /** The namespace of this ModuleBuilder */
    readonly namespace: string

    /** Creates a strongly-typed nested module within this module */
    module<M>(namespace: string, initialState: M): ModuleBuilder<M, R>

    /** Gets an existing nested module within this module */
    module<M>(namespace: string): ModuleBuilder<M, R>

    /** Creates a strongly-typed commit function for the provided mutation handler */
    commit<P>(handler: MutationHandler<S, void>): () => void
    commit<P>(handler: MutationHandler<S, P>): (payload: P) => void
    commit<P>(handler: MutationHandler<S, void>, name: string): () => void
    commit<P>(handler: MutationHandler<S, P>, name: string): (payload: P) => void

    /** Creates a strongly-typed dispatch function for the provided action handler */
    dispatch<P, T>(handler: ActionHandler<S, R, void, void>): () => Promise<void>
    dispatch<P, T>(handler: ActionHandler<S, R, P, void>): (payload: P) => Promise<void>
    dispatch<P, T>(handler: ActionHandler<S, R, void, T>): () => Promise<T>
    dispatch<P, T>(handler: ActionHandler<S, R, P, T>): (payload: P) => Promise<T>
    dispatch<P, T>(handler: ActionHandler<S, R, void, void>, name: string): () => Promise<void>
    dispatch<P, T>(handler: ActionHandler<S, R, P, void>, name: string): (payload: P) => Promise<void>
    dispatch<P, T>(handler: ActionHandler<S, R, void, T>, name: string): () => Promise<T>
    dispatch<P, T>(handler: ActionHandler<S, R, P, T>, name: string): (payload: P) => Promise<T>

    /** Creates a strongly-typed read function for the provided getter function */
    read<T>(handler: GetterHandler<S, R, T>): () => T
    read<T>(handler: GetterHandler<S, R, T>, name: string): () => T

    /** Creates a method to return this module's state */
    state(): () => S

    /** Output a Vuex Module definition. Called after all strongly-typed functions have been obtained */
    vuexModule(): Module<S, R>

    _provideStore(store: Store<R>): void
}

class StoreBuilderImpl<R> extends ModuleBuilderImpl<any, R> {
    constructor()
    {
        super("", {})
    }

    module<S>(namespace: string, initialState: S): ModuleBuilder<S, R>
    module<S>(namespace: string): ModuleBuilder<S, R>
    module<S>(namespace: string, initialState?: S): ModuleBuilder<S, R>
    {
        if (this._store && initialState)
        {
            throw new Error("Can't add module after vuexStore() has been called")
        }

        return super.module(namespace, initialState) as ModuleBuilder<S, R>
    }

    vuexStore(): Store<R>
    vuexStore(overrideOptions: StoreOptions<R>): Store<R>
    vuexStore(overrideOptions: StoreOptions<R> = {}): Store<R>
    {
        if (!this._store)
        {
            const options: StoreOptions<R> = {
                ...this.vuexModule(),
                ...overrideOptions
            }
            const store = new Store<R>(options)
            forEachValue(this._moduleBuilders, m => m._provideStore(store))
            this._store = store
        }
        return this._store
    }

    reset()
    {
        this._store = undefined
        this._moduleBuilders = {}
    }
}

const forEachValue = <T>(dict: Dictionary<T>, loop: (value: T) => any) =>
{
    Object.keys(dict).forEach(key => loop(dict[key]))
}

export interface VuexStoreOptions<R>
{
    plugins?: Plugin<R>[]
}

export interface StoreBuilder<R>
{
    /** Creates a ModuleBuilder for the namespace provided */
    module<S>(namespace: string, state: S): ModuleBuilder<S, R>

    /** Gets an existing ModuleBuilder for the namespace provided */
    module<S>(namespace: string): ModuleBuilder<S, R>

    /** Output a Vuex Store after all modules have been built */
    vuexStore(): Store<R>

    /** Output a Vuex Store and provide options, e.g. plugins -- these take precedence over any auto-generated options */
    vuexStore(overrideOptions: StoreOptions<R>): Store<R>

    /** Creates a strongly-typed commit function for the provided mutation handler */
    commit<P>(handler: MutationHandler<R, void>): () => void
    commit<P>(handler: MutationHandler<R, P>): (payload: P) => void
    commit<P>(handler: MutationHandler<R, void>, name: string): () => void
    commit<P>(handler: MutationHandler<R, P>, name: string): (payload: P) => void

    /** Creates a strongly-typed dispatch function for the provided action handler */
    dispatch<P, T>(handler: ActionHandler<R, R, void, void>): () => Promise<void>
    dispatch<P, T>(handler: ActionHandler<R, R, P, void>): (payload: P) => Promise<void>
    dispatch<P, T>(handler: ActionHandler<R, R, void, T>): () => Promise<T>
    dispatch<P, T>(handler: ActionHandler<R, R, P, T>): (payload: P) => Promise<T>
    dispatch<P, T>(handler: ActionHandler<R, R, void, void>, name: string): () => Promise<void>
    dispatch<P, T>(handler: ActionHandler<R, R, P, void>, name: string): (payload: P) => Promise<void>
    dispatch<P, T>(handler: ActionHandler<R, R, void, T>, name: string): () => Promise<T>
    dispatch<P, T>(handler: ActionHandler<R, R, P, T>, name: string): (payload: P) => Promise<T>

    /** Creates a strongly-typed read function for the provided getter function */
    read<T>(handler: GetterHandler<R, R, T>): () => T
    read<T>(handler: GetterHandler<R, R, T>, name: string): () => T

    /** Creates a method to return the root state */
    state(): () => R

    /** WARNING: Discards vuex store and reset modules (non intended for end-user use) */
    reset(): void
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
