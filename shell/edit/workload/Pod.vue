<script setup lang="ts">
import { ref } from 'vue';
import init, { new_pod, json_to_yaml } from 'rancher_yaml';
import { set } from 'lodash';

import { LabeledInput } from '@components/Form/LabeledInput';
import { PodTemplate } from '~/bindings/PodTemplate';

const podSpec = ref<PodTemplate>({
  apiVersion: '',
  kind:       '',
  metadata:   {
    namespace:   '',
    name:        '',
    labels:      { app: '' },
    annotations: { 'field.cattle.io/description': null },
  },
  spec: { containers: [] },
});
const podSpecYaml = ref();

init().then((_wasm) => {
  podSpec.value = new_pod();
  podSpecYaml.value = json_to_yaml(podSpec.value);
});

const updateSpec = (key: string, value: string) => {
  set(podSpec.value, key, value);
  podSpecYaml.value = json_to_yaml(podSpec.value);
};
</script>

<template>
  <h1>POD NOT FAIL</h1>
  <pre>{{ podSpec }}</pre>
  <LabeledInput
    label="Namespace"
    :value="podSpec.metadata.namespace"
    @update:value="(e: string) => updateSpec('metadata.namespace', e)"
  />
  <LabeledInput
    label="Name"
    :value="podSpec.metadata.name"
    @update:value="(e: string) => updateSpec('metadata.name', e)"
  />
  <LabeledInput
    label="Description"
    :value="podSpec.metadata.annotations['field.cattle.io/description']"
    @update:value="(e: string) => updateSpec(`metadata.annotations['field.cattle.io/description']`, e)"
  />
  <pre>{{ podSpecYaml }}</pre>
</template>

<style scoped lang="scss">

</style>
