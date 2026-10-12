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

  static openEntitiesSearch() {
    this.getComponent().find('.reactodia-unified-search__section-tab').contains('Entities').click();
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

  static setFailingQueryFunction() {
    cy.getByTestId('set-failing-query-function').click();
  }

  static setHangingQueryFunction() {
    cy.getByTestId('set-hanging-query-function').click();
  }

  static getPendingQueries() {
    return cy.window().its('pendingQueries');
  }

  static getCancelledQueries() {
    return cy.window().its('cancelledQueries');
  }

  static setProviderSettings() {
    cy.getByTestId('set-provider-settings').click();
  }

  static changeProviderSettings() {
    cy.getByTestId('change-provider-settings').click();
  }

  static waitForComponentToLoad() {
    this.getComponent().should('have.class', 'hydrated');
  }

  static attachThenSetProps(order) {
    cy.window().invoke('attachThenSetProps', order);
  }

  static spyOnConsoleError() {
    cy.window().then((win) => cy.spy(win.console, 'error').as('consoleError'));
  }

  static getConsoleError() {
    return cy.get('@consoleError');
  }

  static getSparqlQueries() {
    return cy.window().its('sparqlQueries');
  }

  static getReportedErrors() {
    return cy.window().its('reportedErrors');
  }

  /**
   * Retries until an error with the given code, and message when given, is reported to the host.
   */
  static shouldReportError(code, message) {
    return this.getReportedErrors().should((errors) => {
      const messages = errors.filter((error) => error.code === code).map((error) => error.message);
      expect(messages, `reported "${code}" errors`).to.not.be.empty;
      if (message) {
        expect(messages).to.include(message);
      }
    });
  }

  static shouldNotReportError(code) {
    return this.getReportedErrors().should((errors) => {
      expect(errors.map((error) => error.code), 'reported error codes').to.not.include(code);
    });
  }

  static getLoadingError() {
    return this.getComponent().find('.reactodia-spinner[data-error="true"]');
  }

  /**
   * Stores a diagram from `cypress/fixtures` as the persisted one.
   */
  static storeDiagram(fixture) {
    cy.fixture(fixture).then((diagram) => this.setStoredDiagram(JSON.stringify(diagram)));
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

  static setStoredDiagram(raw) {
    cy.window().its('localStorage').invoke('setItem', 'diagram.state', raw);
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
