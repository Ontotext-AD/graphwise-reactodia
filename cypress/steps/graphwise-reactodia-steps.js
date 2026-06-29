export class GraphwiseReactodiaSteps {
  static visit() {
    cy.visit('/pages/graphwise-reactodia/index.html');
  }

  static getComponent() {
    return cy.getByTestId('reactodia');
  }

  static getWorkspace() {
    return this.getComponent().find('.reactodia-workspace');
  }

  static getCanvas() {
    return this.getComponent().find('.reactodia-canvas');
  }

  static getSearchInput() {
    return this.getComponent().find('.reactodia-unified-search__search-input');
  }

  static getElements() {
    return this.getCanvas().find('[data-element-id]');
  }

  static setQueryFunction() {
    cy.getByTestId('set-query-function').click();
  }

  static setRepository() {
    cy.getByTestId('set-repository').click();
  }

  static provideRequiredProps() {
    this.setQueryFunction();
    this.setRepository();
  }

  static switchRepository() {
    cy.getByTestId('switch-repository').click();
  }

  static setSeed() {
    cy.getByTestId('set-seed').click();
  }

  static switchToFrench() {
    cy.getByTestId('set-language-fr').click();
  }

  static switchToEnglish() {
    cy.getByTestId('set-language-en').click();
  }
}
