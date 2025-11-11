<script setup lang="ts">
import Await from '@comp/utils/Await.vue'

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkEmoji from 'remark-emoji'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

defineProps<{
  source: string
}>()

const render = (source: string) => unified()
  .use(remarkParse)
  .use(remarkEmoji)
  .use(remarkRehype)
  .use(rehypeStringify)
  .process(source)
  .then(String)
</script>

<template>
  <Await :promise="render(source)">
    <template #fallback>
      <pre>{{ source }}</pre>
    </template>

    <template #="{ data: html }">
      <div v-html="html" class="html"></div>
    </template>
  </Await>
</template>

<style scoped>
.html :deep(p) {
  margin: 1rem 0;
}
</style>
