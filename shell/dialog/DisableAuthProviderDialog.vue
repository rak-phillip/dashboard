<script>
import { Card } from '@components/Card';
import { Banner } from '@components/Banner';
import { Checkbox } from '@components/Form/Checkbox';
import { RcIcon } from '@components/RcIcon';

export default {
  name: 'DisableAuthProviderDialog',

  emits: ['close'],

  components: {
    Banner, Card, Checkbox, RcIcon
  },

  props: {
    /**
     * Inherited global identifier prefix for tests
     * Define a term based on the parent component to avoid conflicts on multiple components
     */
    componentTestid: {
      type:    String,
      default: 'disable-auth-provider'
    },

    /** The provider's display name, shown in the title. */
    name: {
      type:    String,
      default: ''
    },

    disableCb: {
      type:    Function,
      default: () => {}
    }
  },

  data() {
    return { acknowledged: false };
  },

  computed: {
    title() {
      return this.name ? this.t('authConfig.disable.title', { name: this.name }) : this.t('authConfig.disable.titleGeneric');
    }
  },

  methods: {
    close() {
      this.$emit('close');
    },

    disable() {
      if (!this.acknowledged) {
        return;
      }

      this.disableCb();
      this.$emit('close');
    }
  }
};
</script>

<template>
  <Card
    class="disable-auth-provider"
    :show-highlight-border="false"
  >
    <template #title>
      <h4 class="text-default-text">
        {{ title }}
      </h4>
    </template>
    <template #body>
      <div class="disable-auth-provider__body">
        <p>{{ t('authConfig.disable.loggedOut') }}</p>

        <a
          :href="t('authConfig.disable.docsUrl')"
          target="_blank"
          rel="noopener noreferrer nofollow"
          class="disable-auth-provider__link"
        >
          {{ t('authConfig.disable.learnMore') }}
          <RcIcon
            type="external-link"
            size="medium"
          />
        </a>

        <Banner
          color="warning"
          class="disable-auth-provider__warning"
        >
          <p>{{ t('authConfig.disable.irreversible') }}</p>
          <Checkbox
            v-model:value="acknowledged"
            :label="t('authConfig.disable.acknowledge')"
            :data-testid="componentTestid + '-acknowledge'"
          />
        </Banner>
      </div>
    </template>
    <template #actions>
      <button
        class="btn role-secondary"
        @click="close"
      >
        {{ t('generic.cancel') }}
      </button>
      <div class="spacer" />
      <button
        class="btn role-primary bg-error ml-10"
        :disabled="!acknowledged"
        :data-testid="componentTestid + '-confirm-button'"
        @click="disable"
      >
        {{ t('authConfig.disable.confirm') }}
      </button>
    </template>
  </Card>
</template>

<style lang='scss' scoped>
  .disable-auth-provider {
    &.card-container {
      box-shadow: none;
    }

    &__body {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    &__link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    &__warning {
      width: 100%;
      margin: 0;
    }

    :deep(.card-actions) {
      display: flex;

      .spacer {
        flex: 1;
      }
    }
  }
</style>
