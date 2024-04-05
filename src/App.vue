<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import '../shell/assets/styles/app.scss';

const count = ref(0);

function increment() {
  count.value++;
}

onMounted(() => {
  const store = useStore;

  console.log('STORE', { store, that: this });
});
</script>

<template>
  <div>
    <router-view />
    <h1>NOT FAIL {{ $translate('greetings.hello') }}</h1>
    <h2>{{ t('login.howdy') }}</h2>
    <button @click="increment">
      Click this: {{ count }}
    </button>
  </div>
</template>
