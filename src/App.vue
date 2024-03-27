<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}
</script>

<template>
  <div>
    <router-view />
    <h1>NOT FAIL</h1>
    <button @click="increment">
      Click this: {{ count }}
    </button>
  </div>
</template>
