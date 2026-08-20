<script>
import { MANAGEMENT } from '@shell/config/types';
import { Banner } from '@components/Banner';
import Loading from '@shell/components/Loading';
import { RcButton } from '@components/RcButton';
import { RcIcon } from '@components/RcIcon';
import { RcCounterBadge } from '@components/Pill';
import ActionMenu from '@shell/components/ActionMenuShell.vue';
import AuthProviderRow from '@shell/components/auth/AuthProviderRow.vue';
import AuthProvidersEmptyState from '@shell/components/auth/AuthProvidersEmptyState.vue';
import DisableLocalLoginCard from '@shell/components/auth/DisableLocalLoginCard.vue';
import { HIDE_LOCAL_AUTH_PROVIDER } from '@shell/store/features';
import { MODE, _EDIT } from '@shell/config/query-params';
import { LOCAL_AUTH_ID } from '@shell/utils/auth';

const resource = MANAGEMENT.AUTH_CONFIG;

export default {
  name:       'AuthConfigList',
  components: {
    ActionMenu,
    AuthProviderRow,
    AuthProvidersEmptyState,
    Banner,
    DisableLocalLoginCard,
    Loading,
    RcButton,
    RcCounterBadge,
    RcIcon,
  },

  async fetch() {
    this.allConfigs = await this.$store.dispatch('management/findAll', { type: resource });
  },

  data() {
    return {
      allConfigs:  [],
      toggleError: null,
    };
  },

  computed: {
    /**
     * A configured provider is an authconfig that has been enabled. The rest are
     * pre-created singletons that stand in for a provider type you could add, and
     * belong in the create catalogue rather than here.
     */
    rows() {
      return this.allConfigs.filter((c) => c.enabled && c.id !== LOCAL_AUTH_ID);
    },

    localConfig() {
      return this.allConfigs.find((c) => c.id === LOCAL_AUTH_ID);
    },

    disableLocalAuth() {
      return this.$store.getters['features/get'](HIDE_LOCAL_AUTH_PROVIDER);
    },

    localAuthFeature() {
      return this.$store.getters['management/byId'](MANAGEMENT.FEATURE, HIDE_LOCAL_AUTH_PROVIDER);
    },

    /**
     * The switch writes a feature flag, which needs both the schema permission and
     * a flag the server hasn't locked to a fixed value.
     */
    canToggleLocalAuth() {
      const schema = this.$store.getters['management/schemaFor'](MANAGEMENT.FEATURE);
      const canUpdate = (schema?.resourceMethods || []).includes('PUT');

      return canUpdate && !!this.localAuthFeature && this.localAuthFeature.status?.lockedValue === null;
    },

    createLocation() {
      return {
        name:   'c-cluster-auth-config-create',
        params: { cluster: this.$route.params.cluster }
      };
    },

    localUsersRoute() {
      return {
        name:   'c-cluster-product-resource',
        params: {
          cluster: this.$route.params.cluster, product: 'auth', resource: MANAGEMENT.USER
        }
      };
    },

    brandingRoute() {
      return {
        name:   'c-cluster-settings-brand',
        params: { cluster: this.$route.params.cluster }
      };
    }
  },

  methods: {
    editLocation(row) {
      return {
        name:   'c-cluster-auth-config-id',
        params: { cluster: this.$route.params.cluster, id: row.id },
        query:  { [MODE]: _EDIT }
      };
    },

    chipsFor(row) {
      return row.sideLabel ? [row.sideLabel] : [];
    },

    async setDisableLocalAuth(value) {
      const feature = this.localAuthFeature;

      if (!feature) {
        return;
      }

      this.toggleError = null;
      feature.spec.value = value;

      try {
        await feature.save();
      } catch (e) {
        // The call failed, so the change was never made - put the flag back
        feature.spec.value = !value;
        this.toggleError = e.message || e;
      }
    }
  }
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <header class="auth-config-header">
      <div class="auth-config-header__title">
        <h1 class="m-0">
          {{ t('authConfig.list.title') }}
        </h1>
        <p class="text-muted m-0">
          {{ t('authConfig.list.description') }}
        </p>
      </div>
      <rc-button
        v-if="rows.length"
        variant="primary"
        :to="createLocation"
        data-testid="auth-config-create"
      >
        <template #before>
          <RcIcon
            type="plus"
            size="medium"
          />
        </template>
        {{ t('authConfig.list.create') }}
      </rc-button>
    </header>

    <Banner
      v-if="toggleError"
      color="error"
      :label="toggleError"
    />

    <AuthProvidersEmptyState
      v-if="!rows.length"
      :create-location="createLocation"
    />

    <template v-else>
      <DisableLocalLoginCard
        :value="disableLocalAuth"
        :disabled="!canToggleLocalAuth"
        @update:value="setDisableLocalAuth"
      />

      <div class="auth-config-section-header">
        <div class="auth-config-section-header__label">
          <h2 class="auth-config-section-title">
            {{ t('authConfig.list.external') }}
          </h2>
          <RcCounterBadge
            type="inactive"
            :count="rows.length"
          />
        </div>
        <router-link :to="brandingRoute">
          {{ t('authConfig.list.customiseLogin') }}
        </router-link>
      </div>

      <AuthProviderRow
        v-for="row in rows"
        :key="row.id"
        :title="row.nameDisplay"
        :icon="row.icon"
        :chips="chipsFor(row)"
        :meta="row.id"
        status="success"
        :status-label="row.stateDisplay"
        :to="editLocation(row)"
        :data-testid="`auth-config-row-${ row.id }`"
      >
        <template #trailing>
          <ActionMenu
            :resource="row"
            :button-aria-label="t('sortableTable.tableActionsLabel', { resource: row.id })"
          />
        </template>
      </AuthProviderRow>
    </template>

    <h2 class="auth-config-section-title auth-config-section-title--standalone">
      {{ t('authConfig.list.local') }}
    </h2>

    <AuthProviderRow
      v-if="localConfig"
      :title="t('authConfig.list.localRow.title')"
      :chips="[t('authConfig.list.localRow.chip')]"
      :meta="t('authConfig.list.localRow.meta')"
      :status="disableLocalAuth ? 'none' : 'success'"
      :status-label="disableLocalAuth ? t('authConfig.list.localRow.disabled') : t('authConfig.list.localRow.active')"
      data-testid="auth-config-row-local"
    >
      <template #trailing>
        <router-link :to="localUsersRoute">
          {{ t('authConfig.list.localRow.manageUsers') }}
        </router-link>
      </template>
    </AuthProviderRow>
  </div>
</template>

<style lang="scss" scoped>
.auth-config-header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;

  &__title {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

.auth-config-section-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin: 20px 0;

  &__label {
    align-items: center;
    display: flex;
    gap: 8px;
  }
}

.auth-config-section-title {
  margin: 0;
  color: var(--label-secondary);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.6px;
  line-height: 18px;
  text-transform: uppercase;

  &--standalone {
    margin: 20px 0;
  }
}
</style>
