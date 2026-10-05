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

  static getLinks() {
    return this.getCanvas().find('.reactodia-link');
  }

  static setQueryFunction() {
    cy.getByTestId('set-query-function').click();
  }

  static setProviderSettings() {
    cy.getByTestId('set-provider-settings').click();
  }

  static setRepository() {
    cy.getByTestId('set-repository').click();
  }

  static provideRequiredProps() {
    this.setQueryFunction();
    this.setProviderSettings();
    this.setRepository();
  }

  static switchRepository() {
    cy.getByTestId('switch-repository').click();
  }

  static setSeed() {
    cy.getByTestId('set-seed').click();
  }

  static setSeedGraph() {
    cy.getByTestId('set-seed-graph').click();
  }

  static switchToFrench() {
    cy.getByTestId('set-language-fr').click();
  }

  static switchToEnglish() {
    cy.getByTestId('set-language-en').click();
  }

  static switchToLightTheme() {
    cy.getByTestId('set-theme-light').click();
  }

  static switchToDarkTheme() {
    cy.getByTestId('set-theme-dark').click();
  }

  static clearDiagramStorage() {
    cy.getByTestId('clear-diagram-storage').click();
  }

  static getStoredDiagram() {
    return cy.window().its('localStorage').invoke('getItem', 'diagram.state');
  }

  /**
   * Retries until the diagram persisted to local storage has the given number of elements (the save is debounced).
   */
  static storedDiagramShouldHaveElements(count) {
    return this.getStoredDiagram().should((raw) => {
      expect(raw).to.not.be.null;
      expect(JSON.parse(raw).layoutData.elements).to.have.length(count);
    });
  }

  static openMainMenu() {
    this.getComponent().find('.reactodia-toolbar__menu .reactodia-dropdown-menu__toggle').click();
  }

  static getDownloadDiagramAction() {
    return this.getComponent().find('.reactodia-toolbar__menu .reactodia-toolbar-action__save');
  }

  static getUploadDiagramAction() {
    return this.getComponent().find('.reactodia-toolbar__menu .reactodia-toolbar-action__open');
  }

  static downloadDiagram() {
    this.openMainMenu();
    this.getDownloadDiagramAction().click();
  }

  /**
   * Uploads a file from `cypress/fixtures` through the hidden file input of the upload action.
   */
  static uploadDiagram(fixture) {
    this.openMainMenu();
    this.getComponent().find('.reactodia-toolbar__menu .reactodia-toolbar-action__open-input')
      .selectFile(`cypress/fixtures/${fixture}`, {force: true});
  }

  static readDownloadedDiagram(fileName) {
    return cy.readFile(`${Cypress.config('downloadsFolder')}/${fileName}`);
  }
}
