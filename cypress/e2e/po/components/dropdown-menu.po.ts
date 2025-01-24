import ComponentPo from '@/cypress/e2e/po/components/component.po';
import { CypressChainable } from '@/cypress/e2e/po/po.types';

export default class DropdownMenuPo extends ComponentPo {
  /**
   * Open dropdown menu
   * @returns {CypressChainable}
   */
  public open(): CypressChainable {
    return this.self().should('be.visible').click();
  }

  /**
   * Gets the dropdown menu container
   * @returns {CypressChainable}
   */
  public getContainer(): CypressChainable {
    cy.get('[dropdown-menu-collection]', { timeout: 15000 }).as('dropdownMenuCollection');

    return cy.get('@dropdownMenuCollection').should('be.visible');
  }

  /**
   * Gets dropdown menu items from within the container
   * @returns {CypressChainable}
   */
  public getItems(): CypressChainable {
    return this.open().then(() => {
      this.getContainer().as('dropdownContainer');
      cy.get('@dropdownContainer').find('[dropdown-menu-item]').should('be.visible');
    });
  }
}
