<script setup lang="ts">
defineProps<{
  tag: string
}>()
</script>

<template>
  <span class="post-tag">{{ tag }}</span>
</template>

<style scoped>
.post-tag {
  display: inline-flex;
  align-items: center;

  font-size: .85rem;
  background-color: var(--color-primary);

  height: 1.2rem;
  padding: 0 .5rem;
  border-radius: .6rem;
}
</style>
