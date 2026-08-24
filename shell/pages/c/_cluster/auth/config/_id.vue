<script>
import ResourceDetail from '@shell/components/ResourceDetail';
import Loading from '@shell/components/Loading';
import { MANAGEMENT } from '@shell/config/types';
import { providerKey } from '@shell/models/management.cattle.io.authconfig';

export default {
  name:       'AuthConfigDetail',
  components: { Loading, ResourceDetail },

  /**
   * Several configs can share one provider, and the form to edit them belongs to
   * the provider rather than to any one config, so it is resolved from the type
   * rather than from the id in the route.
   */
  async fetch() {
    try {
      const config = await this.$store.dispatch('management/find', {
        type: MANAGEMENT.AUTH_CONFIG,
        id:   this.$route.params.id,
      });

      this.provider = providerKey(config?._type);
    } catch (e) {
      // Leave it to ResourceDetail, which reports a missing resource in context
    }
  },

  data() {
    return { provider: null };
  },

  computed: {
    AUTH_CONFIG() {
      return MANAGEMENT.AUTH_CONFIG;
    }
  },
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <ResourceDetail
    v-else
    :resource-override="AUTH_CONFIG"
    :sub-type-override="provider"
    :flex-content="true"
  />
</template>
