<script setup lang="ts">
defineProps<{
  date: Date
}>()
</script>

<template>
  <time :datetime="date.toISOString()">{{ date.toLocaleDateString() }}</time>
</template>

<style scoped>
time {
  color: #a4a4a4;
}
</style>
