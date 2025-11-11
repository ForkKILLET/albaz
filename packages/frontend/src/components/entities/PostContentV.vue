<script setup lang="ts">
import type { PostContent } from '@albaz/schema'
import Markdown from '@comp/utils/Markdown.vue'

defineProps<{
  file: string
  content: PostContent
}>()
</script>

<template>
  <div class="post-content">
    <template v-if="file.endsWith('.html')">
      <div v-html="content.text" class="html"></div>
    </template>
    <template v-else-if="file.endsWith('.md')">
      <Markdown :source="content.text" />
    </template>
  </div>
</template>

<style scoped>
/* Hide the first heading in the post content since it's shown in the page header */
.post-content:deep(> .html > h1:first-child) {
  display: none;
}
</style>
