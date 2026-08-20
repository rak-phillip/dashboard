import AuthConfig, { configTypeForProvider, providerIcon, providerKey } from '@shell/models/management.cattle.io.authconfig';
import { requireAsset } from '@shell/utils/require-asset';

jest.mock('@shell/utils/require-asset', () => {
  return { requireAsset: jest.fn((path: string) => path) };
});

// Stands in for i18n, echoing the key back so tests can assert on which key was looked up.
const rootGetters = { 'i18n/withFallback': (key: string) => key, 'i18n/t': (key: string) => key };

const makeConfig = (data: Object) => new AuthConfig(data, { rootGetters } as any);

describe('fx: providerKey', () => {
  // Rancher names the same provider two ways, and the casing isn't consistent
  // between them -- `googleOauthConfig` becomes `googleOAuthProvider`.
  const cases: [string | null | undefined, string][] = [
    ['activeDirectoryConfig', 'activedirectory'],
    ['activeDirectoryProvider', 'activedirectory'],
    ['githubConfig', 'github'],
    ['githubProvider', 'github'],
    ['keyCloakOIDCConfig', 'keycloakoidc'],
    ['keyCloakOIDCProvider', 'keycloakoidc'],
    ['googleOauthConfig', 'googleoauth'],
    ['googleOAuthProvider', 'googleoauth'],
    ['localConfig', 'local'],
    ['', ''],
    [undefined, ''],
    [null, ''],
  ];

  it.each(cases)('should normalise %p to %p', (input, expected) => {
    expect(providerKey(input)).toBe(expected);
  });
});

describe('fx: configTypeForProvider', () => {
  const cases: [string | undefined, string | undefined][] = [
    ['activeDirectoryProvider', 'ldap'],
    ['githubProvider', 'oauth'],
    ['githubAppProvider', 'oauth'],
    ['googleOAuthProvider', 'oauth'],
    ['keyCloakProvider', 'saml'],
    ['keyCloakOIDCProvider', 'oidc'],
    ['genericSAMLProvider', 'saml'],
    ['localProvider', ''],
    ['notAProvider', undefined],
    [undefined, undefined],
  ];

  it.each(cases)('should resolve %p to %p', (input, expected) => {
    expect(configTypeForProvider(input)).toBe(expected);
  });

  it('should resolve the config naming as well as the provider naming', () => {
    expect(configTypeForProvider('githubConfig')).toBe('oauth');
    expect(configTypeForProvider('githubProvider')).toBe('oauth');
  });
});

describe('fx: providerIcon', () => {
  // The login page reads raw `/v1-public/authproviders` rows, which use the
  // `...Provider` naming rather than the `...Config` naming of the model.
  it.each([
    ['githubProvider', 'github'],
    ['activeDirectoryProvider', 'activedirectory'],
    ['oktaProvider', 'okta'],
  ])('should derive the asset name from %p', (type: string, expected: string) => {
    expect(providerIcon(type)).toBe(`~shell/assets/images/vendor/${ expected }.svg`);
  });

  it.each([
    ['azureADProvider', 'entraid'],
    ['genericOIDCProvider', 'openid'],
    ['keyCloakOIDCProvider', 'keycloak'],
    ['oidcProvider', 'openid'],
  ])('should apply the override for %p', (type: string, expected: string) => {
    expect(providerIcon(type)).toBe(`~shell/assets/images/vendor/${ expected }.svg`);
  });

  it('should resolve the config naming and the provider naming to one asset', () => {
    expect(providerIcon('githubConfig')).toBe(providerIcon('githubProvider'));
  });

  it('should fall back to an empty string when the vendor has no logo', () => {
    // `local` has no vendor SVG, so `requireAsset` throws for it.
    jest.mocked(requireAsset).mockImplementationOnce(() => {
      throw new Error('Asset not found');
    });

    expect(providerIcon('localProvider')).toBe('');
  });

  it.each([undefined, null, ''])('should not throw for %p', (type) => {
    jest.mocked(requireAsset).mockImplementationOnce(() => {
      throw new Error('Asset not found');
    });

    expect(providerIcon(type as any)).toBe('');
  });
});

describe('class AuthConfig', () => {
  describe('configType', () => {
    // Steve renames the stored `type` field to `_type`, because its own `type` is
    // always `management.cattle.io.authconfig` for every one of these resources.
    it('should derive the category from _type, not the Steve type', () => {
      const config = makeConfig({
        id: 'github', _type: 'githubConfig', type: 'management.cattle.io.authconfig'
      });

      expect(config.configType).toBe('oauth');
    });

    it.each([
      ['activeDirectoryConfig', 'ldap'],
      ['azureADConfig', 'oauth'],
      ['oidcConfig', 'oidc'],
      ['genericSAMLConfig', 'saml'],
    ])('should map _type %p to %p', (_type: string, expected: string) => {
      expect(makeConfig({ _type }).configType).toBe(expected);
    });

    it('should be undefined for an unrecognised _type', () => {
      expect(makeConfig({ _type: 'somethingElseConfig' }).configType).toBeUndefined();
    });
  });

  describe('provider', () => {
    // Multi-IDP: several configs of one provider, each with its own arbitrary name.
    it('should resolve every config of a provider to the same label', () => {
      const first = makeConfig({ id: 'github', _type: 'githubConfig' });
      const second = makeConfig({ id: 'github-two', _type: 'githubConfig' });

      expect(second.provider).toBe(first.provider);
      expect(second.provider).toContain('provider."github"');
    });

    it('should not key the label off the instance name', () => {
      const config = makeConfig({ id: 'github-two', _type: 'githubConfig' });

      expect(config.provider).not.toContain('github-two');
    });
  });

  describe('icon', () => {
    it.each([
      ['githubConfig', 'github'],
      ['activeDirectoryConfig', 'activedirectory'],
      ['freeIpaConfig', 'freeipa'],
    ])('should derive the asset name from _type %p', (_type: string, expected: string) => {
      expect(makeConfig({ _type }).icon).toBe(`~shell/assets/images/vendor/${ expected }.svg`);
    });

    it.each([
      ['azureADConfig', 'entraid'],
      ['genericOIDCConfig', 'openid'],
      ['keyCloakOIDCConfig', 'keycloak'],
    ])('should apply the override for _type %p', (_type: string, expected: string) => {
      expect(makeConfig({ _type }).icon).toBe(`~shell/assets/images/vendor/${ expected }.svg`);
    });

    it('should use the same asset for every config of a provider', () => {
      const first = makeConfig({ id: 'github', _type: 'githubConfig' });
      const second = makeConfig({ id: 'github-two', _type: 'githubConfig' });

      expect(second.icon).toBe(first.icon);
    });
  });

  // The action menu resolves an action to a method of the same name on the model.
  // Without one, picking Disable silently does nothing.
  describe('disable', () => {
    const makeDisableable = (norman: any, clone?: any) => {
      const dispatch = jest.fn((action: string) => {
        if (action === 'rancher/find') {
          return Promise.resolve(norman);
        }

        return action === 'rancher/clone' ? Promise.resolve(clone) : Promise.resolve();
      });

      const config = new AuthConfig(
        { id: 'github-two', _type: 'githubConfig' },
        { rootGetters, dispatch } as any
      );

      return { config, dispatch };
    };

    it('should be a method the action menu can actually call', () => {
      expect(typeof makeConfig({ id: 'github-two' }).disable).toBe('function');
    });

    it('should run the norman action for the matching config', async() => {
      const norman = { hasAction: () => true, doAction: jest.fn() };
      const { config, dispatch } = makeDisableable(norman);

      await config.disable();

      expect(dispatch).toHaveBeenCalledWith('rancher/find', {
        type: 'authconfig',
        id:   'github-two',
        opt:  { url: '/v3/authconfig/github-two', force: true },
      }, { root: true });
      expect(norman.doAction).toHaveBeenCalledWith('disable');
    });

    // Not every provider advertises the action, so the flag is written directly.
    it('should fall back to saving the flag when there is no action', async() => {
      const clone = { enabled: true, save: jest.fn() };
      const { config } = makeDisableable({ hasAction: () => false }, clone);

      await config.disable();

      expect(clone.enabled).toBe(false);
      expect(clone.save).toHaveBeenCalledWith();
    });

    // A named multi-IdP config advertises `actions.disable` and then 404s on it,
    // so the advertised action can only be treated as a hint.
    it('should fall back when the advertised action is not honoured', async() => {
      const clone = { enabled: true, save: jest.fn() };
      const norman = {
        hasAction: () => true,
        doAction:  jest.fn().mockRejectedValue({ code: 'ActionNotAvailable', status: 404 }),
      };
      const { config } = makeDisableable(norman, clone);

      await config.disable();

      expect(norman.doAction).toHaveBeenCalledWith('disable');
      expect(clone.enabled).toBe(false);
      expect(clone.save).toHaveBeenCalledWith();
    });

    it('should report a genuine failure rather than leaving it uncaught', async() => {
      const norman = {
        hasAction: () => true,
        doAction:  jest.fn().mockRejectedValue({ code: 'PermissionDenied', status: 403 }),
      };
      const { config, dispatch } = makeDisableable(norman);

      await expect(config.disable()).resolves.toBeUndefined();

      expect(dispatch).toHaveBeenCalledWith('growl/fromError', {
        title: 'generic.notification.title.error',
        err:   { code: 'PermissionDenied', status: 403 },
      }, { root: true });
    });

    // The list reads `enabled` off the cached resource, so it has to be re-fetched.
    it('should refresh the config so the list reflects the change', async() => {
      const { config, dispatch } = makeDisableable({ hasAction: () => true, doAction: jest.fn() });

      await config.disable();

      expect(dispatch).toHaveBeenCalledWith('find', {
        type: 'management.cattle.io.authconfig',
        id:   'github-two',
        opt:  { force: true },
      });
    });
  });
});
