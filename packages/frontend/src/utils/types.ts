export type Ctor<T = any> = new (...args: any[]) => T

export type Func<T = any, As extends any[] = any[]> = (...args: As) => T

export type Nullable<T> = T | null
