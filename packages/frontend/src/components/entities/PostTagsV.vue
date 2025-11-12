<script setup lang="ts">
import PostTagV from './PostTagV.vue'

defineProps<{
  tags: string[]
}>()
</script>

<template>
  <span class="post-tags">
    <PostTagV v-for="tag in tags" :key="tag" :tag="tag" />
  </span>
</template>

<style scoped>
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
}
</style>
