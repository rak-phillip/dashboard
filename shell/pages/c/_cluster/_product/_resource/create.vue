<script setup lang="ts">
import { createRouter } from 'vue-router';
import ResourceDetail from '@shell/components/ResourceDetail';

console.log('[shell] createRouter === window.__createRouterProbe:', createRouter === (window as any).__createRouterProbe); // eslint-disable-line no-console
</script>

<template>
  <ResourceDetail component-testid="cluster-manager-create" />
</template>
