<script setup lang="ts">
import type { PostMeta } from '@albaz/schema'
import PostMetaV from '@comp/entities/PostMetaV.vue'
import { computed } from 'vue'

const props = defineProps<{
  folder?: string
  posts: PostMeta[]
}>()

const postsFiltered = computed(() => {
  const { posts, folder } = props
  if (! folder) return posts
  return posts.filter(post => post.file.startsWith(folder))
})
</script>

<template>
  <div class="post-list">
    <div class="post-list-header">
      <p v-if="! folder">{{ $t('postCount', { count: postsFiltered.length }) }}</p>
      <p v-else>{{ $t('postCountInFolder', { count: postsFiltered.length, folder }) }}</p>
    </div>

    <div class="post-list-entries">
      <PostMetaV v-for="post of postsFiltered" :key="post.file" :post="post" flavor="entry" />
    </div>
  </div>
</template>

<style scoped>
.post-list {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.post-list-entries {
  text-align: left;
}
</style>
