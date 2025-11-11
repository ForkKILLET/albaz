<script setup lang="ts" generic="T">
import { computed } from 'vue'
import Error from '@comp/utils/Error.vue'
import type { AllError } from '@util/errors'
import { wrapPromise } from '@util/promise'
import Loading from './Loading.vue'

const props = defineProps<{
  promise: Promise<T>
}>()

const promiseWrapped = computed(() => wrapPromise<T, AllError>(props.promise))

const state = computed(() => promiseWrapped.value.state)
</script>

<template>
  <template v-if="state.status === 'pending'">
    <slot name="fallback">
      <Loading />
    </slot>
  </template>
  <template v-else-if="state.status === 'fulfilled'">
    <slot name="default" :data="state.data" />
  </template>
  <template v-else-if="state.status === 'rejected'">
    <slot name="catch" :error="state.err">
      <Error :err="state.err" />
    </slot>
  </template>
</template>
