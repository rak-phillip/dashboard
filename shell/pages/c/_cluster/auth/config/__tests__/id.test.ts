import { shallowMount } from '@vue/test-utils';
import AuthConfigDetail from '@shell/pages/c/_cluster/auth/config/_id.vue';
import ResourceDetail from '@shell/components/ResourceDetail/index.vue';

const createWrapper = (config: any, id = 'github-2') => {
  const dispatch = jest.fn(() => (config instanceof Error ? Promise.reject(config) : Promise.resolve(config)));

  const wrapper = shallowMount(AuthConfigDetail, {
    global: {
      mocks: {
        $route:      { params: { cluster: 'local', id } },
        $fetchState: { pending: false, error: null },
        $store:      { dispatch },
      },
      stubs: { Loading: true, ResourceDetail: true },
    },
  });

  return { wrapper, dispatch };
};

const runFetch = async(wrapper: any) => {
  await (wrapper.vm.$options as any).fetch.call(wrapper.vm);
  await wrapper.vm.$nextTick();
};

describe('page: AuthConfigDetail', () => {
  // Several configs can share one provider, so the form belongs to the provider
  // rather than to the config named in the route.
  it('should resolve the form from the provider type, not the config name', async() => {
    const { wrapper } = createWrapper({ id: 'github-2', _type: 'githubConfig' });

    await runFetch(wrapper);

    expect(wrapper.findComponent(ResourceDetail).props('subTypeOverride')).toBe('github');
  });

  it('should leave a config it cannot load to ResourceDetail', async() => {
    const { wrapper } = createWrapper(new Error('nope'));

    await runFetch(wrapper);

    expect(wrapper.findComponent(ResourceDetail).props('subTypeOverride')).toBeNull();
  });
});
