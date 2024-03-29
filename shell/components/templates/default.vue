<script>
import { mapState } from 'vuex';
import FixedBanner from '@shell/components/FixedBanner';
import AwsComplianceBanner from '@shell/components/AwsComplianceBanner';
import AzureWarning from '@shell/components/auth/AzureWarning';

export default {

  components: {
    FixedBanner,
    AwsComplianceBanner,
    AzureWarning,
  },

  middleware: [
    'authenticated'
  ],

  computed: { ...mapState(['managementReady']) }
};
</script>

<template>
  <div class="dashboard-root">
    <FixedBanner :header="true" />
    <h2>Management Ready: {{ managementReady }}</h2>
    <AwsComplianceBanner v-if="managementReady" />
    <AzureWarning v-if="managementReady" />
  </div>
</template>
