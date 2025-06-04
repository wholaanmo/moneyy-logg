<template>
  <router-view></router-view>
</template>

<script setup>
import { provide } from 'vue'

// Provide a value for 'key' (e.g., a config object, API client, etc.)
provide('key', {
  someValue: "Hello, this is provided!"
})
</script>
