<script>
import { mapState } from 'vuex';
import FixedBanner from '@shell/components/FixedBanner';
import AwsComplianceBanner from '@shell/components/AwsComplianceBanner';

export default {

  components: {
    FixedBanner,
    AwsComplianceBanner,
  },

  computed: { ...mapState(['managementReady']) }
};
</script>

<template>
  <div class="dashboard-root">
    <FixedBanner :header="true" />
    <AwsComplianceBanner v-if="managementReady" />
  </div>
</template>
