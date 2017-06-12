
type a = { a: string }
type b = { b: number }
type c = { c: Date }
type d<T> = { d: (payload: { s: T }) => T }

type e = a & b & c & d<Symbol> & { z: StringConstructor }

type f = {[K in keyof e]: e[K]}

var abcd: e;
