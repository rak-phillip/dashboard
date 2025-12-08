<script setup lang="ts">
import { ref, toValue } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import init, {
  new_pod, json_to_yaml, yaml_to_json, update, save, get
} from 'rancher_yaml';
import { set } from 'lodash';

import { CSRF } from '@shell/config/cookies';
import CodeMirror from '@shell/components/CodeMirror';
import { LabeledInput } from '@components/Form/LabeledInput';
import { RcButton } from '@components/RcButton';

import { PodTemplate } from '~/bindings/PodTemplate';
import { _EDIT } from '@shell/config/query-params';

const props = defineProps<{ mode: String }>();

const podSpec = ref<PodTemplate>({
  id:         null,
  apiVersion: '',
  kind:       '',
  metadata:   {
    namespace:       '',
    name:            '',
    labels:          { app: '' },
    annotations:     { 'field.cattle.io/description': null },
    fields:          [],
    resourceVersion: null
  },
  spec: {
    containers: [
      {
        templateId:               crypto.randomUUID(),
        name:                     '',
        image:                    '',
        ports:                    [],
        imagePullPolicy:          null,
        resources:                undefined,
        terminationMessagePath:   null,
        terminationMessagePolicy: null,
        volumeMounts:             []
      }
    ],
    affinity:                      undefined,
    dnsPolicy:                     null,
    enableServiceLinks:            null,
    nodeName:                      null,
    preemptionPolicy:              null,
    priority:                      null,
    restartPolicy:                 null,
    schedulerName:                 null,
    securityContext:               undefined,
    serviceAccount:                null,
    serviceAccountName:            null,
    terminationGracePeriodSeconds: null,
    tolerations:                   [],
    volumes:                       [],
    imagePullSecrets:              [],
    initContainers:                [],
  },
});
const podSpecYaml = ref();

init().then((_wasm) => {
  if (props.mode === _EDIT) {
    getPod().then((result) => {
      podSpec.value = result;
      podSpecYaml.value = json_to_yaml(podSpec.value);
    });
  } else {
    podSpec.value = new_pod();
    podSpecYaml.value = json_to_yaml(podSpec.value);
  }
});

const shouldUpdateYaml = ref(true);
const updateSpec = (key: string, value: string) => {
  shouldUpdateYaml.value = false;

  set(podSpec.value, key, value);
  podSpecYaml.value = json_to_yaml(podSpec.value);
};

const updateYaml = (value: string) => {
  if (!shouldUpdateYaml.value) {
    shouldUpdateYaml.value = true;

    return;
  }

  podSpecYaml.value = value;
  podSpec.value = yaml_to_json(toValue(podSpec), toValue(podSpecYaml));
};

const addContainer = () => {
  podSpec.value.spec.containers.push({
    templateId:               crypto.randomUUID(),
    name:                     `container-${ crypto.randomUUID().split('-')[0] }`,
    image:                    '',
    ports:                    [],
    imagePullPolicy:          null,
    resources:                undefined,
    terminationMessagePath:   null,
    terminationMessagePolicy: null,
    volumeMounts:             []
  });
  podSpecYaml.value = json_to_yaml(podSpec.value);
};

const removeContainer = (containerId: string) => {
  podSpec.value.spec.containers = podSpec.value.spec.containers.filter((container) => {
    return container.templateId !== containerId;
  });
  podSpecYaml.value = json_to_yaml(podSpec.value);
};

const store = useStore();
const router = useRouter();
const options = { parseJSON: false };
const csrf = store.getters['cookies/get']({ key: CSRF, options });
const namespace = router.currentRoute.value.params.namespace;
const id = router.currentRoute.value.params.id;

const savePod = async() => {
  try {
    if (props.mode === _EDIT) {
      await update(podSpec.value, 'https://127.0.0.1:8005', namespace, id, csrf);

      return;
    }

    await save(podSpec.value, 'https://127.0.0.1:8005', csrf);
  } catch (err) {
    console.error('FAIL POST', { err });
  } finally {
    router.push(
      {
        name:   'c-cluster-product-resource',
        params: {
          cluster:  'local',
          product:  'explorer',
          resource: 'pod',
        }
      }
    );
  }
};

const getPod = async() => {
  try {
    const result = await get('https://127.0.0.1:8005', namespace, id, csrf);

    return result;
  } catch (err) {
    console.error('FAIL GET', { err });
  }
};

const cancel = () => {
  router.back();
};
</script>

<template>
  <pre v-if="false">{{ podSpec }}</pre>
  <div class="form-container">
    <div class="form">
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
      <div class="container-form">
        <div class="wasm-container">
          <span class="wasm-header">Containers</span>
          <rc-button
            secondary
            @click="addContainer"
          >
            Add
          </rc-button>
        </div>
        <template
          v-for="(container, idx) in podSpec.spec.containers"
          :key="container.templateId"
        >
          <div class="wasm-container">
            <span class="wasm-header-sm">Container: {{ container.name }}</span>
            <rc-button
              tertiary
              @click="removeContainer(container.templateId)"
            >
              Delete
            </rc-button>
          </div>
          <LabeledInput
            label="Container Name"
            :value="container.name"
            @update:value="(e: string) => updateSpec(`spec.containers[${idx}].name`, e)"
          />
          <span class="wasm-header-xs">Image</span>
          <LabeledInput
            label="Container Image"
            :value="container.image"
            @update:value="(e: string) => updateSpec(`spec.containers[${idx}].image`, e)"
          />
        </template>
      </div>
    </div>
    <div class="yaml-spec">
      <code-mirror
        :value="podSpecYaml"
        @onInput="updateYaml"
      />
    </div>
  </div>
  <div class="wasm-footer">
    <rc-button @click="savePod">
      Save
    </rc-button>
    <rc-button
      secondary
      @click="cancel"
    >
      Cancel
    </rc-button>
  </div>
</template>

<style scoped lang="scss">
.form-container {
  display: flex;
  gap: 1rem;
  flex-grow: 1;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 42rem;
}

.namespace-form {
  display: flex;
  gap: 1rem;
}

.container-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.yaml-spec {
  flex-grow: 1;
}

.wasm-header {
  font-size: 1.5rem;
  line-height: calc(2 / 1.5);
}

.wasm-header-sm {
  font-size: 1.25rem;
  line-height: calc(1.75 / 1.25);
}

.wasm-header-xs {
  font-size: 1.125rem;
  line-height: calc(1.75 / 1.125);
}

.wasm-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wasm-footer {
  display: flex;
  flex-direction: row-reverse;
  position: sticky;
  bottom: 1rem;
  gap: 1rem;
}
</style>
