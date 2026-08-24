<script>
import { provide, reactive } from 'vue';
import Loading from '@shell/components/Loading';
import { LabeledInput } from '@components/Form/LabeledInput';
import { Banner } from '@components/Banner';
import { RcButton } from '@components/RcButton';
import { RcSeparator } from '@components/RcSeparator';
import AuthProviderLogo from '@shell/components/auth/AuthProviderLogo.vue';
import { MANAGEMENT } from '@shell/config/types';
import { providerIcon, providerKey } from '@shell/models/management.cattle.io.authconfig';
import { isValidAuthConfigName, nextAuthConfigName } from '@shell/utils/auth-providers';

const resource = MANAGEMENT.AUTH_CONFIG;

export default {
  name:       'AuthConfigCreateProvider',
  components: {
    AuthProviderLogo,
    Banner,
    LabeledInput,
    Loading,
    RcButton,
    RcSeparator,
  },

  setup() {
    // The provider form creates the config itself when it first saves, and reads
    // the name and description from here to do it.
    const authConfigCreate = reactive({
      name: '', description: '', normanType: '', created: false
    });

    provide('authConfigCreate', authConfigCreate);

    return { authConfigCreate };
  },

  async fetch() {
    const allConfigs = await this.$store.dispatch('management/findAll', { type: resource });
    const template = allConfigs.find((config) => providerKey(config._type) === this.provider);

    if (!template) {
      return;
    }

    this.template = template;
    this.takenIds = allConfigs.map((config) => config.id);
    this.authConfigCreate.normanType = template._type;
    this.authConfigCreate.name = nextAuthConfigName(this.takenIds, this.provider);

    // The form is filled in against an empty config of the chosen provider's type
    this.value = await this.$store.dispatch('management/create', { type: resource, _type: template._type });
    this.editComponent = this.$store.getters['type-map/importEdit'](resource, this.provider);
  },

  data() {
    return {
      template:      null,
      takenIds:      [],
      value:         null,
      editComponent: null,
    };
  },

  computed: {
    provider() {
      return this.$route.params.provider;
    },

    icon() {
      return providerIcon(this.template?._type);
    },

    displayName() {
      return this.$store.getters['i18n/withFallback'](`model.authConfig.provider."${ this.provider }"`, null, this.provider);
    },

    nameHint() {
      return this.nameError || '';
    },

    nameError() {
      const name = this.authConfigCreate.name;

      if (this.authConfigCreate.created) {
        return null;
      }

      if (!name) {
        return this.t('authConfig.create.name.required');
      }

      if (!isValidAuthConfigName(name)) {
        return this.t('authConfig.create.name.invalid');
      }

      if (this.takenIds.includes(name)) {
        return this.t('authConfig.create.name.taken', { name });
      }

      return null;
    },

    listLocation() {
      return {
        name:   'c-cluster-auth-config',
        params: { cluster: this.$route.params.cluster }
      };
    }
  },
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <Banner
    v-else-if="!template"
    color="error"
    :label="t('authConfig.create.unknownProvider', { provider })"
  />
  <div v-else>
    <div class="auth-config-masthead">
      <rc-button
        variant="link"
        class="auth-config-back"
        :to="listLocation"
        data-testid="auth-config-back"
      >
        <template #before>
          <i class="icon icon-chevron-left" />
        </template>
        {{ t('authConfig.create.back') }}
      </rc-button>
      <h1 class="auth-config-title">
        <AuthProviderLogo :icon="icon" />
        {{ t('authConfig.create.provider.title', { provider: displayName }) }}
      </h1>
    </div>

    <div class="auth-config-identity">
      <LabeledInput
        v-model:value="authConfigCreate.name"
        :label="t('authConfig.create.name.label')"
        :required="true"
        :disabled="authConfigCreate.created"
        :status="nameError ? 'error' : null"
        :sub-label="nameHint"
        data-testid="auth-config-name"
      />
      <LabeledInput
        v-model:value="authConfigCreate.description"
        :label="t('authConfig.create.descriptionField.label')"
        :placeholder="t('authConfig.create.descriptionField.placeholder')"
        data-testid="auth-config-description"
      />
    </div>

    <RcSeparator class="mb-20" />

    <component
      :is="editComponent"
      v-if="editComponent"
      :value="value"
      :initial-value="value"
      :live-value="value"
      mode="edit"
      real-mode="edit"
      as="config"
    />
  </div>
</template>

<style lang="scss" scoped>
.auth-config-masthead {
  margin-bottom: 20px;
}

.auth-config-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px 0;
}

a.rc-button.variant-link.auth-config-back {
  padding: 0; // left-align the link with the heading below it
}

.auth-config-identity {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px; // the name's hint runs to two lines and would meet the separator
}
</style>
