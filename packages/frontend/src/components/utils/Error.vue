<script setup lang="ts">
import type { PostNotFoundError } from '@util/errors'
import type { ZodError } from 'zod'

defineProps<{
  err: PostNotFoundError | ZodError | Error
}>()
</script>

<template>
  <div class="error">
    {{ err.message }}
  </div>
</template>
