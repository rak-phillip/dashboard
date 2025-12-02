<script setup lang="ts">
import { ref } from 'vue';
import init, { new_pod, json_to_yaml } from 'rancher_yaml';

import { LabeledInput } from '@components/Form/LabeledInput';
import { PodTemplate } from '~/bindings/PodTemplate';

const podSpec = ref<PodTemplate>({
  apiVersion: '',
  kind:       '',
  metadata:   {
    name:   '',
    labels: { app: '' }
  },
  spec: { containers: [] },
});
const podSpecYaml = ref();

init().then((_wasm) => {
  podSpec.value = new_pod();
  podSpecYaml.value = json_to_yaml(podSpec.value);
});

const updateName = (value: string) => {
  podSpec.value.metadata.name = value;
  podSpecYaml.value = json_to_yaml(podSpec.value);
};
</script>

<template>
  <h1>POD NOT FAIL</h1>
  <pre>{{ podSpec }}</pre>
  <LabeledInput
    label="Name"
    :value="podSpec.metadata.name"
    @update:value="updateName"
  />
  <pre>{{ podSpecYaml }}</pre>
</template>

<style scoped lang="scss">

</style>
