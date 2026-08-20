import PagePo from '@/cypress/e2e/po/pages/page.po';
import ProductNavPo from '@/cypress/e2e/po/side-bars/product-side-nav.po';
import BurgerMenuPo from '@/cypress/e2e/po/side-bars/burger-side-menu.po';
import SelectIconGridPo from '@/cypress/e2e/po/components/select-icon-grid.po';

export enum AuthProvider {
  AMAZON_COGNITO = 'Amazon Cognito', // eslint-disable-line no-unused-vars
  AZURE = 'Microsoft Entra ID', // eslint-disable-line no-unused-vars
  GITHUB_APP = 'GitHub App', // eslint-disable-line no-unused-vars
  GENERIC_SAML = 'Generic SAML', // eslint-disable-line no-unused-vars
}

export class AuthProviderPo extends PagePo {
  private static createPath(clusterId: string, id?: string ) {
    return `/c/${ clusterId }/auth/config`;
  }

  static goTo(clusterId: string): Cypress.Chainable<Cypress.AUTWindow> {
    return super.goTo(AuthProviderPo.createPath(clusterId));
  }

  constructor(clusterId: string) {
    super(AuthProviderPo.createPath(clusterId));
  }

  static navTo() {
    const sideNav = new ProductNavPo();

    BurgerMenuPo.burgerMenuNavToMenubyLabel('Users & Authentication');
    sideNav.navToSideMenuEntryByLabel('Auth Provider');
  }

  selectionGrid() {
    return new SelectIconGridPo(this.selector);
  }

  createButton() {
    return cy.getId('auth-config-create');
  }

  /**
   * The provider catalogue lives on the create page, which the list page links to
   * from either the page header or its empty state.
   */
  clickCreate() {
    return this.createButton().click();
  }

  goToAzureADCreation(clusterId = '_'): Cypress.Chainable<Cypress.AUTWindow> {
    return PagePo.goTo(`/c/${ clusterId }/auth/config/azuread?mode=edit`);
  }

  goToAmazonCongitoCreation(clusterId = '_'): Cypress.Chainable<Cypress.AUTWindow> {
    return PagePo.goTo(`/c/${ clusterId }/auth/config/cognito?mode=edit`);
  }

  selectProvider(provider: AuthProvider) {
    this.clickCreate();

    return this.selectionGrid().select(provider);
  }
}

export default AuthProviderPo;
