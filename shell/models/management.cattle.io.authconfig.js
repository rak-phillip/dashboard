import { insertAt } from '@shell/utils/array';
import SteveModel from '@shell/plugins/steve/steve-class';
import { requireAsset } from '@shell/utils/require-asset';
import { MANAGEMENT, NORMAN } from '@shell/config/types';

/**
 * Normalises a provider identifier to a stable key.
 *
 * The same provider is named differently depending on where it is read from - an
 * authconfig is `github`, the public provider list calls it `githubProvider` and
 * the schema calls it `githubConfig`.
 */
export const providerKey = (type) => `${ type || '' }`.toLowerCase().replace(/(config|provider)$/, '');

/**
 * Auth provider categories, keyed by `providerKey()` so that either naming works.
 */
export const configType = {
  activedirectory: 'ldap',
  openldap:        'ldap',
  freeipa:         'ldap',
  azuread:         'oauth',
  googleoauth:     'oauth',
  github:          'oauth',
  githubapp:       'oauth',
  adfs:            'saml',
  keycloak:        'saml',
  okta:            'saml',
  ping:            'saml',
  shibboleth:      'saml',
  genericsaml:     'saml',
  cognito:         'oidc',
  genericoidc:     'oidc',
  keycloakoidc:    'oidc',
  oidc:            'oidc',
  local:           '',
};

/**
 * Look up a category from any provider identifier, e.g. `keyCloakOIDCProvider`.
 */
export const configTypeForProvider = (type) => configType[providerKey(type)];

const imageOverrides = {
  azuread:      'entraid',
  genericoidc:  'openid',
  genericsaml:  'custom',
  keycloakoidc: 'keycloak',
  oidc:         'openid',
};

/**
 * Resolve a provider's vendor logo from any provider identifier.
 *
 * @returns the asset URL, or an empty string when the vendor has no logo.
 */
export const providerIcon = (type) => {
  try {
    const key = providerKey(type);

    return requireAsset(`~shell/assets/images/vendor/${ imageOverrides[key] || key }.svg`);
  } catch (e) {
    return '';
  }
};

export default class AuthConfig extends SteveModel {
  get _availableActions() {
    const out = super._availableActions;

    insertAt(out, 0, {
      action:  'promptDisable',
      label:   this.t('authConfig.disable.action'),
      icon:    'icon icon-close',
      enabled: this.enabled === true,
    });

    insertAt(out, 1, { divider: true });

    return out;
  }

  /**
   * Disabling deletes everything Rancher stores for the provider, so the action
   * menu confirms before {@link disable} is allowed to run.
   */
  promptDisable() {
    this.$dispatch('promptModal', {
      component:      'DisableAuthProviderDialog',
      customClass:    'remove-modal',
      modalWidth:     '600',
      height:         'auto',
      styles:         'max-height: 100vh;',
      componentProps: {
        name:      this.nameDisplay,
        disableCb: () => this.disable(),
      },
    });
  }

  /**
   * Turning a provider off is a Norman action - the Steve resource has no `disable`
   * of its own, so the action menu's entry would otherwise resolve to nothing.
   *
   * Mirrors the edit page's `disable()` in `@shell/mixins/auth-config`, but cannot
   * trust `hasAction` alone. See {@link runDisableAction}.
   */
  async disable() {
    try {
      const norman = await this.$dispatch('rancher/find', {
        type: NORMAN.AUTH_CONFIG,
        id:   this.id,
        opt:  { url: `/v3/${ NORMAN.AUTH_CONFIG }/${ this.id }`, force: true },
      }, { root: true });

      if (!await this.runDisableAction(norman)) {
        const clone = await this.$dispatch('rancher/clone', { resource: norman }, { root: true });

        clone.enabled = false;
        await clone.save();
      }

      await this.$dispatch('find', {
        type: MANAGEMENT.AUTH_CONFIG, id: this.id, opt: { force: true }
      });
    } catch (e) {
      this.$dispatch('growl/fromError', {
        title: this.$rootGetters['i18n/t']('generic.notification.title.error'),
        err:   e.data || e,
      }, { root: true });
    }
  }

  /**
   * Runs the server's `disable` action, if it will actually accept it.
   *
   * Norman only offers the link on an enabled config, but its presence is still
   * not proof the server will honour it - a named config has been seen to
   * advertise it and then answer `ActionNotAvailable`. The advertised action is
   * treated as a hint, and the caller writes `enabled` directly when it turns
   * out not to be honoured.
   *
   * @returns whether the action ran.
   */
  async runDisableAction(norman) {
    if (!norman.hasAction('disable')) {
      return false;
    }

    try {
      await norman.doAction('disable');

      return true;
    } catch (e) {
      if ((e?.code || e?.data?.code) === 'ActionNotAvailable') {
        return false;
      }

      throw e;
    }
  }

  /**
   * Auth configs are edited through their own route rather than the generic
   * resource detail page, so the inherited action menu (`goToEdit`, `goToViewConfig`)
   * and any detail links need pointing at it.
   */
  get detailLocation() {
    return {
      name:   'c-cluster-auth-config-id',
      params: {
        cluster: this.$rootGetters['clusterId'],
        id:      this.id,
      },
    };
  }

  get nameDisplay() {
    return this.$rootGetters['i18n/withFallback'](`model.authConfig.name."${ this.id }"`, null, this.provider);
  }

  get provider() {
    return this.$rootGetters['i18n/withFallback'](`model.authConfig.provider."${ this.id }"`, null, this.id);
  }

  get configType() {
    return configTypeForProvider(this.id);
  }

  get sideLabel() {
    return this.$rootGetters['i18n/withFallback'](`model.authConfig.description."${ this.configType }"`, null, this.configType);
  }

  get icon() {
    return providerIcon(this._type);
  }

  get state() {
    if ( this.enabled ) {
      return 'active';
    }

    return 'inactive';
  }
}
