<script setup lang="ts">
import Await from '@comp/utils/Await.vue'
import BaseView from '@comp/BaseView.vue'
import PostList from '@comp/PostList.vue'
import { config } from '@store/config'
import { blogStore } from '@store/blog'
import z from 'zod'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const postIndex = blogStore.getPostIndex()

const Params = z.object({
  folder: z.string().optional(),
})
const params = computed(() => Params.parse(route.params))
</script>

<template>
  <BaseView>
    <template #header>
      <h1>{{ config.blogTitle }}</h1>
    </template>

    <Await :promise="postIndex" #="{ data: index }">
      <PostList :posts="index.posts" :folder="params.folder" />
    </Await>
  </BaseView>
</template>
