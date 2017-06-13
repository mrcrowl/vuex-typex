
import { ActionContext, ActionTree, GetterTree, Module, MutationTree, Store } from "vuex"

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

export class ModuleBuilder<S, R> {
    private store: RootStore<R>

    private getters: GetterTree<S, R> = {}
    private mutations: MutationTree<S> = {}
    private actions: ActionTree<S, R> = {}

    constructor(private namespace: string, private state: S) { }

    commit<P>(handler: MutationHandler<S, void>): () => void
    commit<P>(handler: MutationHandler<S, P>): (payload: P) => void
    commit<P>(handler: MutationHandler<S, void>, name: string): () => void
    commit<P>(handler: MutationHandler<S, P>, name: string): (payload: P) => void
    commit<P>(handler: MutationHandler<S, P>, name?: string)
    {
        const { key, namespacedKey } = qualifyKey(handler, this.namespace, name)
        this.mutations[key] = handler
        return ((payload: P) => this.store.commit(namespacedKey, payload, useRootNamespace)) as any
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
        this.actions[key] = handler
        return (payload: P) => this.store.dispatch(namespacedKey, payload, useRootNamespace)
    }

    read<T>(handler: GetterHandler<S, R, T>): () => T
    read<T>(handler: GetterHandler<S, R, T>, name: string): () => T
    read<T>(handler: GetterHandler<S, R, T>, name?: string): () => T
    {
        const { key, namespacedKey } = qualifyKey(handler, this.namespace, name)
        this.getters[key] = handler
        return () =>
        {
            if (this.store.rootGetters)
            {
                return this.store.rootGetters[namespacedKey] as T
            }
            return this.store.getters[namespacedKey] as T
        }
    }

    provideStore(): (store: Store<R>) => void
    {
        return (store) => this.store = store
    }

    toVuexModule(): Module<S, R>
    {
        return {
            namespaced: true,
            state: this.state,
            getters: this.getters,
            mutations: this.mutations,
            actions: this.actions
        }
    }
}

function qualifyKey(handler: Function, namespace: string | undefined, name?: string): { key: string, namespacedKey: string }
{
    const key: string = name || handler.name
    if (!key)
    {
        throw new Error(`Vuex handler functions must not be anonymous. Possible causes: fat-arrow functions, uglify`)
    }
    return namespace ? { key, namespacedKey: `${namespace}/${key}` } : { key, namespacedKey: key }
}