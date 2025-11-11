import { reactive } from 'vue'

export type PromiseResult<T, E> =
  | { status: 'fulfilled', data: T }
  | { status: 'rejected', err: E }

export type PromiseState<T, E> =
  | { status: 'pending' }
  | PromiseResult<T, E>

export type PromiseWrapper<T, E> = PromiseLike<PromiseResult<T, E>> & {
  promise: Promise<T>
  state: PromiseState<T, E>
}

export const wrapPromise = <T, E>(promise: Promise<T>): PromiseWrapper<T, E> => {
  const wrapper: PromiseWrapper<T, E> = reactive({
    promise,
    state: { status: 'pending' as const },
    then: promise
      .then(data => wrapper.state = { status: 'fulfilled', data })
      .catch(err => wrapper.state = { status: 'rejected', err })
      .then.bind(promise),
  })

  return wrapper
}
