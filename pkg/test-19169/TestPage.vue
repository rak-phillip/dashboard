<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div>
    <h1>Test 19169</h1>
    <p>Route name: <code>{{ route.name }}</code></p>
    <p>Route path: <code>{{ route.path }}</code></p>
  </div>
</template>
