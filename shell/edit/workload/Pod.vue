<script setup lang="ts">
import { ref } from 'vue';
import init, { new_pod, json_to_yaml } from 'rancher_yaml';
import { set } from 'lodash';

import { LabeledInput } from '@components/Form/LabeledInput';
import { PodTemplate } from '~/bindings/PodTemplate';
import { Container } from '~/bindings/Container';

type UIContainer = Container & { templateId: string }
type UIPodTemplate = Omit<PodTemplate, 'spec'> & {
  spec: Omit<PodTemplate['spec'], 'containers'> & {
    containers: UIContainer[];
  }
}

const podSpec = ref<UIPodTemplate>({
  apiVersion: '',
  kind:       '',
  metadata:   {
    namespace:   '',
    name:        '',
    labels:      { app: '' },
    annotations: { 'field.cattle.io/description': null },
  },
  spec: {
    containers: [
      {
        templateId: crypto.randomUUID(),
        name:       '',
        image:      '',
        ports:      []
      }
    ]
  },
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
  <pre v-if="false">{{ podSpec }}</pre>
  <div class="namespace-form">
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
  </div>
  <div>
    <template
      v-for="(container, idx) in podSpec.spec.containers"
      :key="container.templateId"
    >
      General
      <LabeledInput
        label="Container Name"
        :value="container.name"
        @update:value="(e: string) => updateSpec(`spec.containers[${idx}].name`, e)"
      />
      Image
      <LabeledInput
        label="Container Image"
        :value="container.image"
        @update:value="(e: string) => updateSpec(`spec.containers[${idx}].image`, e)"
      />
    </template>
  </div>
  <pre>{{ podSpecYaml }}</pre>
</template>

<style scoped lang="scss">
.namespace-form {
  display: flex;
  gap: 1rem;
}
</style>
