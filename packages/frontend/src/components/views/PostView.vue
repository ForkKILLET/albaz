<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import z from 'zod'

import BaseView from '@comp/BaseView.vue'
import Await from '@comp/utils/Await.vue'
import PostContentV from '@comp/entities/PostContentV.vue'
import PostMetaV from '@comp/entities/PostMetaV.vue'
import { blogStore } from '@store/blog'

const route = useRoute()

const Params = z.object({
  file: z.string(),
})
const params = computed(() => Params.parse(route.params))
</script>

<template>
  <BaseView>
    <template #header>
      <Await :promise="blogStore.getPostMeta(params.file)" #="{ data: meta }">
        <PostMetaV :post="meta" flavor="title" />
      </Await>
    </template>

    <Await :promise="blogStore.getPostContent(params.file)" #="{ data: content }">
      <PostContentV :content="content" :file="params.file" />
    </Await>
  </BaseView>
</template>
