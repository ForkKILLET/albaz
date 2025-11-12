<script setup lang="ts">
import type { PostMeta } from '@albaz/schema'
import Date from '@comp/utils/Date.vue'
import PostTagsV from '@comp/entities/PostTagsV.vue'

defineProps<{
  post: PostMeta
  flavor: 'title' | 'entry'
}>()
</script>

<template>
  <div :class="['post-meta', flavor]">
    <h2 class="post-title">
      <RouterLink :to="`/post/${post.file}`">{{ post.title }}</RouterLink>
    </h2>
    <span class="post-summary">{{ post.summary }}</span>

    <PostTagsV class="post-tags" :tags="post.tags" />

    <span class="post-created-at"><Date :date="post.createdAt" /> C</span>
    <span class="post-updated-at"><Date :date="post.updatedAt" /> M</span>
  </div>
</template>

<style scoped>
.post-meta {
  display: grid;

  align-items: baseline;
  gap: .5rem;

  padding: 1rem 0;

  transition: background-color .2s ease;
}

.post-meta.entry {
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    "title   s1   created-at"
    "summary tags updated-at";
}

.post-meta.title {
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    "title   title      title"
    "summary summary    summary"
    "tags    created-at updated-at";
}

@media (orientation: portrait) or (max-width: 450px) {
  .post-meta.entry {
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      "title   s1   s2"
      "summary s1   created-at"
      "tags    tags updated-at";
  }
}

@media (orientation: portrait) or (max-width: 450px) {
  .post-meta.title {
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      "title      title   title"
      "summary    summary summary"
      "created-at s1      updated-at"
      "tags       tags    tags";
  }
}

.post-title {
  grid-area: title;
}
.post-meta.entry .post-title {
  text-align: left;
}

.post-summary {
  grid-area: summary;
}
.post-meta.title .post-summary {
  text-align: center;
}

.post-tags {
  grid-area: tags;
}
.post-meta.entry .post-tags {
  justify-self: end;
}
.post-meta.title .post-tags {
  justify-self: start;
}

.post-created-at {
  grid-area: created-at;
  justify-self: end;
  font-family: monospace;
}

.post-updated-at {
  grid-area: updated-at;
  justify-self: end;
  font-family: monospace;
}
</style>
