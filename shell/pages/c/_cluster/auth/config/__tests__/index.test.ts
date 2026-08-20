import { shallowMount } from '@vue/test-utils';
import AuthConfigList from '@shell/pages/c/_cluster/auth/config/index.vue';
import AuthProviderRow from '@shell/components/auth/AuthProviderRow.vue';
import AuthProvidersEmptyState from '@shell/components/auth/AuthProvidersEmptyState.vue';
import DisableLocalLoginCard from '@shell/components/auth/DisableLocalLoginCard.vue';

const localConfig = { id: 'local', enabled: true };

const oktaConfig = {
  id:           'okta-corp',
  enabled:      true,
  nameDisplay:  'okta-corp',
  sideLabel:    'SAML',
  icon:         'okta.svg',
  stateDisplay: 'Active',
};

const disabledConfig = {
  id: 'github', enabled: false, nameDisplay: 'github', sideLabel: 'OAuth'
};

const createFeature = (value: boolean, lockedValue: boolean | null = null) => ({
  spec:   { value },
  status: { lockedValue },
  save:   jest.fn(),
});

const createWrapper = ({
  configs = [localConfig, oktaConfig],
  feature = createFeature(false),
  canUpdateFeature = true,
} = {}) => shallowMount(AuthConfigList, {
  // The page loads its configs in fetch(), which shallowMount does not run
  data:   () => ({ allConfigs: configs } as any),
  global: {
    mocks: {
      $route:      { params: { cluster: 'local' } },
      $fetchState: { pending: false, error: null },
      $store:      {
        dispatch: jest.fn(),
        getters:  {
          'features/get':         () => feature.spec.value,
          'management/byId':      () => feature,
          'management/schemaFor': () => ({ resourceMethods: canUpdateFeature ? ['GET', 'PUT'] : ['GET'] }),
        },
      },
    },
  },
});

describe('page: AuthConfigList', () => {
  it('should list the providers that have been configured', () => {
    const wrapper = createWrapper();

    const rows = wrapper.findAllComponents(AuthProviderRow);

    // One for Okta, one for the local provider section
    expect(rows).toHaveLength(2);
    expect(rows[0].props('title')).toBe('okta-corp');
    expect(rows[0].props('chips')).toStrictEqual(['SAML']);
    expect(rows[0].props('icon')).toBe('okta.svg');
    expect(rows[0].props('statusLabel')).toBe('Active');
  });

  // Rancher pre-creates a disabled authconfig per supported type; those are the
  // create catalogue, not configured providers.
  it('should keep unconfigured provider types out of the list', () => {
    const wrapper = createWrapper({ configs: [localConfig, oktaConfig, disabledConfig] });

    const titles = wrapper.findAllComponents(AuthProviderRow).map((row) => row.props('title'));

    expect(titles).not.toContain('github');
  });

  it('should link a configured provider to its edit page', () => {
    const wrapper = createWrapper();

    expect(wrapper.findAllComponents(AuthProviderRow)[0].props('to')).toStrictEqual({
      name:   'c-cluster-auth-config-id',
      params: { cluster: 'local', id: 'okta-corp' },
      query:  { mode: 'edit' },
    });
  });

  describe('when no external provider is configured', () => {
    it('should guide the user to add one', () => {
      const wrapper = createWrapper({ configs: [localConfig] });

      expect(wrapper.findComponent(AuthProvidersEmptyState).exists()).toBe(true);
      expect(wrapper.find('[data-testid="auth-config-create"]').exists()).toBe(false);
    });

    // Turning local login off with nothing to replace it locks everyone out.
    it('should not offer to disable local login', () => {
      const wrapper = createWrapper({ configs: [localConfig] });

      expect(wrapper.findComponent(DisableLocalLoginCard).exists()).toBe(false);
    });

    it('should still show the local provider', () => {
      const wrapper = createWrapper({ configs: [localConfig] });

      const rows = wrapper.findAllComponents(AuthProviderRow);

      expect(rows).toHaveLength(1);
      expect(rows[0].props('title')).toBe('%authConfig.list.localRow.title%');
    });
  });

  describe('disabling local login', () => {
    it('should write the value straight to the feature flag', async() => {
      const feature = createFeature(false);
      const wrapper = createWrapper({ feature });

      await wrapper.findComponent(DisableLocalLoginCard).vm.$emit('update:value', true);

      expect(feature.spec.value).toBe(true);
      expect(feature.save).toHaveBeenCalledWith();
    });

    it('should put the flag back and explain itself when the save fails', async() => {
      const feature = createFeature(false);

      feature.save.mockRejectedValue(new Error('nope'));

      const wrapper = createWrapper({ feature });

      await wrapper.findComponent(DisableLocalLoginCard).vm.$emit('update:value', true);

      expect(feature.spec.value).toBe(false);
      expect((wrapper.vm as any).toggleError).toBe('nope');
    });

    it('should lock the switch when the user cannot write feature flags', () => {
      const wrapper = createWrapper({ canUpdateFeature: false });

      expect(wrapper.findComponent(DisableLocalLoginCard).props('disabled')).toBe(true);
    });

    it('should lock the switch when the server has pinned the flag', () => {
      const wrapper = createWrapper({ feature: createFeature(false, true) });

      expect(wrapper.findComponent(DisableLocalLoginCard).props('disabled')).toBe(true);
    });
  });
});
