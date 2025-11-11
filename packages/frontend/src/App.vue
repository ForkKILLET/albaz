<script setup lang="ts">
import { computed, provide, useTemplateRef } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import * as R from 'remeda'

import { kHeaderEl } from '@util/injections'

const header = useTemplateRef('header')

const route = useRoute()

interface Crumb {
  segment: string
  path: string
  isLeaf: boolean
}

const crumbs = computed(() => route.path
  .split('/')
  .filter((segment, index) => ! index || segment)
  .reduce<Crumb[]>((crumbs, segment, index, { length }) => {
    const prevPath = R.last(crumbs)?.path ?? ''
    const isLeaf = index === length - 1
    crumbs.push({
      segment: index ? segment : '~',
      path: `${prevPath}${segment}${isLeaf ? '' : '/'}`,
      isLeaf,
    })
    return crumbs
  }, [])
)

provide(kHeaderEl, header)
</script>

<template>
  <div class="root">
    <main>
      <div class="crumb">
        <template v-for="{ segment, path, isLeaf } of crumbs">
          <RouterLink :to="path">{{ segment }}</RouterLink>
          <span v-if="! isLeaf" class="crumb-slash">/</span>
        </template>
      </div>

      <header ref="header"></header>

      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.root {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100vw;
  height: 100vh;
}

.crumb {
  text-align: left;
}

.crumb-slash {
  margin: 0 .25em;
}

main {
  height: 100%;
  box-sizing: border-box;
  padding: .5rem 2rem;
  background-color: #2c2c2c;
  overflow-y: auto;
  scrollbar-width: none;
}

header {
  margin: 2rem 0;
}

@media (orientation: landscape) {
  main {
    width: max(50vw, 500px);
  }
}

@media (orientation: portrait) {
  main {
    width: 100vw;
  }
}
</style>
