<script>
import Pod from '@shell/edit/workload/Pod.vue';

export default {
  name:       'WorkloadDeployments',
  components: { Pod },
  props:      {
    value: {
      type:     Object,
      required: true,
    },

    mode: {
      type:    String,
      default: 'create',
    },
  },
};
</script>

<template>
  <Pod />
</template>
