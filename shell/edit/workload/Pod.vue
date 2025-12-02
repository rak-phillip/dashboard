<script setup lang="ts">
import { ref } from 'vue';
import init, { new_pod } from 'rancher_yaml';

const podSpec = ref({});

init().then((_wasm) => {
  podSpec.value = new_pod();
});
</script>

<template>
  <h1>POD NOT FAIL</h1>
  <pre>{{ podSpec }}</pre>
</template>

<style scoped lang="scss">

</style>
