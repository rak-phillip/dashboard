import { mount } from '@vue/test-utils';
import authConfigMixin from '@shell/mixins/auth-config';
import childHook from '@shell/mixins/child-hook';
//
describe('mixin: authConfigMixin', () => {
  describe('method: save', () => {
    const componentMock = (model: any) => ({
      data: () => ({
        value: { configType: 'oidc' },
        model,
      }),
      computed: { principal: () => ({ me: {} }) },
      global:   {
        mocks: {
          $store: { dispatch: () => model },
          $route: {
            params: { id: '123' },
            query:  { mode: 'edit' },
          },
        }
      }
    });
    const FakeComponent = {
      render() {},
      mixins:  [authConfigMixin, childHook],
      methods: { applyHooks: jest.fn() },
    };

    it('should return error', async() => {
      const instance = mount(FakeComponent, componentMock({
        doAction: jest.fn(),
        save:     'make it fail'
      })).vm as any;
      const fakeCallback = jest.fn();

      await instance.save(fakeCallback);

      expect(fakeCallback).toHaveBeenCalledWith(false);
    });

    it('should not return error', async() => {
      const model = {
        authConfigName: 'whatever',
        doAction:       jest.fn(),
        save:           async() => {}
      };
      const instance = mount(FakeComponent, componentMock(model)).vm as any;
      const fakeCallback = jest.fn();

      await instance.save(fakeCallback);

      expect(fakeCallback).toHaveBeenCalledWith(true);
    });

    it.each([
      'oidc'
    ])('should keep custom scope on save', async(type) => {
      const scope = 'openid profile email groups whatever';
      const model = {
        scope,
        authConfigName: 'whatever',
        doAction:       jest.fn(),
        save:           async() => {}
      };
      const instance = mount(FakeComponent, componentMock(model)).vm as any;

      await instance.save(jest.fn());

      expect(instance.model.scope).toStrictEqual(scope);
    });
  });

  describe('accessMode on enable', () => {
    const FakeComponent = {
      render() {},
      mixins:  [authConfigMixin, childHook],
      methods: { applyHooks: jest.fn() },
    };

    const createMock = (model: any, overrides: Record<string, any> = {}) => ({
      data: () => ({
        value: { configType: 'oidc' },
        model,
        ...overrides,
      }),
      computed: { principal: () => ({ me: {} }) },
      global:   {
        mocks: {
          $store: { dispatch: () => model },
          $route: {
            params: { id: model.id || '123' },
            query:  { mode: 'edit' },
          },
        }
      }
    });

    it.each([
      ['github', 'githubConfig'],
      ['githubapp', 'githubAppConfig'],
    ])('should default accessMode to restricted for %s on enable', async(id, type) => {
      const model = {
        id,
        type,
        enabled:        false,
        authConfigName: 'whatever',
        doAction:       jest.fn(),
        save:           jest.fn(),
      };
      const instance = mount(FakeComponent, createMock(model)).vm as any;

      await instance.save(jest.fn());

      expect(model.save).toHaveBeenCalled();
      expect(instance.model.accessMode).toStrictEqual('required');
    });

    it('should default accessMode to unrestricted for non-github oauth on enable', async() => {
      const model = {
        id:             'googleoauth',
        type:           'googleOauthConfig',
        enabled:        false,
        authConfigName: 'whatever',
        doAction:       jest.fn(),
        save:           jest.fn(),
      };
      const instance = mount(FakeComponent, createMock(model)).vm as any;

      await instance.save(jest.fn());

      expect(instance.model.accessMode).toStrictEqual('required');
    });

    it('should set accessMode to required after enabling a provider', async() => {
      const model = {
        enabled:        false,
        accessMode:     'unrestricted',
        authConfigName: 'whatever',
        doAction:       jest.fn(),
        save:           async() => {}
      };
      const instance = mount(FakeComponent, createMock(model)).vm as any;

      await instance.save(jest.fn());

      expect(instance.model.accessMode).toStrictEqual('required');
    });

    it('should not change accessMode when editing an already enabled provider', async() => {
      const model = {
        enabled:        true,
        accessMode:     'unrestricted',
        authConfigName: 'whatever',
        doAction:       jest.fn(),
        save:           async() => {}
      };
      const instance = mount(FakeComponent, createMock(model, { editConfig: true })).vm as any;

      await instance.save(jest.fn());

      expect(instance.model.accessMode).toStrictEqual('unrestricted');
    });
  });

  // Adding a second provider of a type creates a config of its own. Nothing is
  // written until the form saves, because `metadata.name` cannot be changed once
  // the config exists.
  describe('creating a provider', () => {
    const FakeComponent = {
      render() {},
      mixins:  [authConfigMixin, childHook],
      methods: { applyHooks: jest.fn() },
    };

    const createMock = (dispatch: jest.Mock, replace: jest.Mock, authConfigCreate: any) => ({
      data: () => ({
        value: { configType: 'oauth' },
        model: {
          clientId: 'client-id', clientSecret: 'shhh', enabled: false
        },
      }),
      computed: { principal: () => ({ me: {} }) },
      global:   {
        provide: { authConfigCreate },
        mocks:   {
          $store:  { dispatch },
          $router: { replace },
          $route:  {
            params: { cluster: 'local' },
            query:  { mode: 'edit' },
          },
        }
      }
    });

    const serverModel = () => ({
      id:          'github-2',
      type:        'githubConfig',
      hostname:    'github.com',
      tls:         true,
      annotations: { 'field.cattle.io/description': 'Contractors' },
      doAction:    jest.fn(),
      save:        jest.fn(),
    });

    const createInstance = (overrides: any = {}) => {
      const created = serverModel();
      const dispatch = jest.fn((action: string, payload: any) => {
        switch (action) {
        case 'rancher/find': return created;
        case 'rancher/clone': return { ...payload.resource };
        case 'auth/test': return 'auth-code';
        case 'rancher/findAll': return [];
        default: return undefined;
        }
      });
      const replace = jest.fn();
      const authConfigCreate = {
        name: 'github-2', description: 'Contractors', normanType: 'githubConfig', ...overrides
      };

      return {
        created,
        dispatch,
        replace,
        instance: mount(FakeComponent, createMock(dispatch, replace, authConfigCreate)).vm as any,
      };
    };

    it('should create the config through the Kubernetes API', async() => {
      const { instance, dispatch } = createInstance();

      await instance.save(jest.fn());

      expect(dispatch).toHaveBeenCalledWith('management/request', {
        url:    '/k8s/clusters/local/apis/management.cattle.io/v3/authconfigs',
        method: 'POST',
        data:   {
          apiVersion: 'management.cattle.io/v3',
          kind:       'AuthConfig',
          metadata:   { name: 'github-2', annotations: { 'field.cattle.io/description': 'Contractors' } },
          type:       'githubConfig',
          enabled:    false,
        },
      });
    });

    it('should leave out the description annotation when none was given', async() => {
      const { instance, dispatch } = createInstance({ description: '' });

      await instance.save(jest.fn());

      const [, payload] = dispatch.mock.calls.find(([action]) => action === 'management/request') as any;

      expect(payload.data.metadata).toStrictEqual({ name: 'github-2' });
    });

    it('should carry what was filled in onto the config the server created', async() => {
      const { instance } = createInstance();

      await instance.save(jest.fn());

      expect(instance.model.clientId).toBe('client-id');
      expect(instance.model.id).toBe('github-2');
      expect(instance.authConfigName).toBe('github-2');
    });

    it('should move to the new config own page once it exists', async() => {
      const { instance, replace } = createInstance();

      await instance.save(jest.fn());

      expect(replace).toHaveBeenCalledWith({
        name:   'c-cluster-auth-config-id',
        params: { cluster: 'local', id: 'github-2' },
        query:  { mode: 'edit' },
      });
    });

    it('should report a failed create and go no further', async() => {
      const { instance, dispatch, replace } = createInstance();
      const btnCb = jest.fn();

      dispatch.mockImplementation((action: string) => {
        if (action === 'management/request') {
          throw new Error('already exists');
        }

        return undefined;
      });

      await instance.save(btnCb);

      expect(btnCb).toHaveBeenCalledWith(false);
      expect(replace).not.toHaveBeenCalled();
      expect(instance.errors.length).toBeGreaterThan(0);
    });
  });
});
