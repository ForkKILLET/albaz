<script setup lang="ts">
import { kHeaderEl } from '@util/injections'
import { inject } from 'vue'

const headerEl = inject(kHeaderEl)
</script>

<template>
  <Teleport :to="headerEl">
    <slot name="header"></slot>
  </Teleport>

  <slot name="default" :header-el="headerEl"></slot>
</template>
