import { insertAt } from '@shell/utils/array';
import SteveModel from '@shell/plugins/steve/steve-class';

/**
 * MISSING:
 *             "_type": "oidcConfig",
 */
export const configType = {
  activeDirectoryConfig: 'ldap',
  azureADConfig:         'oauth',
  openLdapConfig:        'ldap',
  freeIpaConfig:         'ldap',
  pingConfig:            'saml',
  adfsConfig:            'saml',
  keyCloakConfig:        'saml',
  oktaConfig:            'saml',
  shibbolethConfig:      'saml',
  googleOauthConfig:     'oauth',
  localConfig:           '',
  githubConfig:          'oauth',
  githubAppConfig:       'oauth',
  keyCloakOIDCConfig:    'oidc',
  genericOIDCConfig:     'oidc',
  cognitoConfig:         'oidc',
};

const imageOverrides = { keyCloakOIDCConfig: 'keycloak', genericOIDCConfig: 'openid' };

export default class AuthConfig extends SteveModel {
  get _availableActions() {
    const out = super._availableActions;

    insertAt(out, 0, {
      action:  'disable',
      label:   'Disable',
      icon:    'icon icon-spinner',
      enabled: this.enabled === true,
    });

    insertAt(out, 1, { divider: true });

    return out;
  }

  get nameDisplay() {
    return this.$rootGetters['i18n/withFallback'](`model.authConfig.name."${ this.id }"`, null, this.provider);
  }

  get provider() {
    return this.$rootGetters['i18n/withFallback'](`model.authConfig.provider."${ this.id }"`, null, this.id);
  }

  get configType() {
    return configType[this.type];
  }

  get sideLabel() {
    return this.$rootGetters['i18n/withFallback'](`model.authConfig.description."${ this.configType }"`, null, this.configType);
  }

  get icon() {
    try {
      return require(`~shell/assets/images/vendor/${ imageOverrides[this.id] || this.id }.svg`);
    } catch (e) {
      return '';
    }
  }

  get state() {
    if ( this.enabled ) {
      return 'active';
    }

    return 'inactive';
  }
}
