import { shallowMount } from '@vue/test-utils';
import AuthConfigCreateProvider from '@shell/pages/c/_cluster/auth/config/create/_provider.vue';

const template = { id: 'github', _type: 'githubConfig' };

const createWrapper = ({
  provider = 'github',
  takenIds = ['github', 'local'],
  name = 'github-2',
} = {}) => shallowMount(AuthConfigCreateProvider, {
  // The page loads its configs in fetch(), which shallowMount does not run
  data: () => ({
    template, takenIds, value: {}, editComponent: {}
  } as any),
  global: {
    mocks: {
      $route:      { params: { cluster: 'local', provider } },
      $fetchState: { pending: false, error: null },
      $store:      {
        dispatch: jest.fn(),
        getters:  { 'i18n/withFallback': () => 'GitHub' },
      },
    },
  },
  props: {} as any,
}) as any;

const setName = (wrapper: any, name: string) => {
  wrapper.vm.authConfigCreate.name = name;
};

describe('page: AuthConfigCreateProvider', () => {
  it('should default the name to a free one for the provider', async() => {
    const wrapper = createWrapper();

    // fetch() sets this from nextAuthConfigName; the page renders whatever it holds
    setName(wrapper, 'github-2');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.nameError).toBeNull();
  });

  it.each([
    ['it is empty', '', 'authConfig.create.name.required'],
    ['it is not a DNS label', 'GitHub Two', 'authConfig.create.name.invalid'],
    ['another config already has it', 'github', 'authConfig.create.name.taken'],
  ])('should reject a name when %s', (_label, name, key) => {
    const wrapper = createWrapper();

    setName(wrapper, name);

    // The test harness renders a translation key as `%key%`
    expect(wrapper.vm.nameError).toContain(key);
  });

  // Nothing is created until the provider form saves, so the name and description
  // are handed down rather than written to the server here.
  it('should provide the name and description to the provider form', () => {
    const wrapper = createWrapper();

    setName(wrapper, 'github-2');
    wrapper.vm.authConfigCreate.description = 'Contractors';

    expect(wrapper.vm.authConfigCreate).toStrictEqual({
      name:        'github-2',
      description: 'Contractors',
      normanType:  '',
      created:     false,
    });
  });

  // The API rejects a change to `metadata.name`, so once the form has created the
  // config the name is no longer the form's to offer.
  it('should stop offering the name once the config has been created', () => {
    const wrapper = createWrapper();

    setName(wrapper, 'github-2');
    wrapper.vm.authConfigCreate.created = true;

    expect(wrapper.vm.nameError).toBeNull();
  });

  it('should report a provider this Rancher does not have', () => {
    const wrapper = shallowMount(AuthConfigCreateProvider, {
      data:   () => ({ template: null } as any),
      global: {
        mocks: {
          $route:      { params: { cluster: 'local', provider: 'nonsense' } },
          $fetchState: { pending: false, error: null },
          $store:      { dispatch: jest.fn(), getters: { 'i18n/withFallback': () => 'nonsense' } },
        },
      },
    });

    expect(wrapper.find('[data-testid="auth-config-name"]').exists()).toBe(false);
  });
});
