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

  computed: { ...mapState(['managementReady']) },

  mounted() {
    console.log('STORE', { store: this.$store });
    this.$store.dispatch('loadManagement');
  }
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
