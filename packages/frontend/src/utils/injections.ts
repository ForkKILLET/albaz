import type { InjectionKey, ShallowRef } from 'vue'

export const kHeaderEl = Symbol('HeaderEl') as InjectionKey<ShallowRef<HTMLElement| null>>
