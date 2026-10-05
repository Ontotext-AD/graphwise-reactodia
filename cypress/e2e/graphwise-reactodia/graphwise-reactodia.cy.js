import {GraphwiseReactodiaSteps} from '../../steps/graphwise-reactodia-steps';

describe('graphwise-reactodia', () => {
  beforeEach(() => {
    // Given the test page with the wrapper present but no props set yet
    GraphwiseReactodiaSteps.visit();
  });

  it('Should mount the Reactodia workspace once the required props are set', () => {
    // When the host sets a query function and a repository on the wrapper
    GraphwiseReactodiaSteps.provideRequiredProps();

    // Then the wrapper mounts the Reactodia React app and the workspace appears
    GraphwiseReactodiaSteps.getWorkspace().should('exist');
    // And the (initially empty) canvas is rendered
    GraphwiseReactodiaSteps.getCanvas().should('exist');
  });

  it('Should not mount the workspace when currentRepository is never set', () => {
    // When only the query function is set, leaving currentRepository unset
    GraphwiseReactodiaSteps.setQueryFunction();

    // Then the wrapper's guard keeps it from mounting anything
    GraphwiseReactodiaSteps.getWorkspace().should('not.exist');
  });

  it('Should not mount the workspace when queryFunction is never set', () => {
    // When only the repository is set (which triggers a render), leaving queryFunction unset
    GraphwiseReactodiaSteps.setRepository();

    // Then the wrapper's guard keeps it from mounting anything
    GraphwiseReactodiaSteps.getWorkspace().should('not.exist');
  });

  it('Should apply the matching translation bundle for the language prop', () => {
    // Given a mounted workspace, which defaults to the English UI
    GraphwiseReactodiaSteps.provideRequiredProps();
    GraphwiseReactodiaSteps.getSearchInput().should('have.attr', 'placeholder', 'Search for...');

    // When the language is switched to French (which remounts the workspace with the fr bundle)
    GraphwiseReactodiaSteps.switchToFrench();

    // Then the wrapper feeds the French bundle to Reactodia and the UI is re-translated
    GraphwiseReactodiaSteps.getSearchInput().should('have.attr', 'placeholder', 'Rechercher...');
  });

  it('Should apply the color scheme from the theme prop', () => {
    // Given a mounted workspace
    GraphwiseReactodiaSteps.provideRequiredProps();
    GraphwiseReactodiaSteps.getWorkspace().should('exist');

    // When the theme is switched to dark
    GraphwiseReactodiaSteps.switchToDarkTheme();

    // Then the workspace uses the dark color scheme
    GraphwiseReactodiaSteps.getWorkspace().should('have.attr', 'data-theme', 'dark');

    // When the theme is switched to light
    GraphwiseReactodiaSteps.switchToLightTheme();

    // Then the workspace uses the light color scheme
    GraphwiseReactodiaSteps.getWorkspace().should('have.attr', 'data-theme', 'light');
  });

  it('Should keep the workspace mounted when currentRepository changes', () => {
    // Given a mounted workspace
    GraphwiseReactodiaSteps.provideRequiredProps();
    GraphwiseReactodiaSteps.getWorkspace().should('exist');

    // When the host re-points the wrapper at another repository at runtime
    GraphwiseReactodiaSteps.switchRepository();

    // Then the @Watch handler re-renders in place - the workspace is rebuilt, not torn down
    GraphwiseReactodiaSteps.getWorkspace().should('exist');
  });

  it('Should seed the canvas only from the seed present when the workspace mounts', () => {
    // Given a workspace mounted without a seed
    GraphwiseReactodiaSteps.provideRequiredProps();
    GraphwiseReactodiaSteps.getCanvas().should('exist');
    // Then nothing should be placed on the canvas
    GraphwiseReactodiaSteps.getElements().should('not.exist');

    // When, I re-visit the page with a seed
    GraphwiseReactodiaSteps.visit();
    GraphwiseReactodiaSteps.setSeed();
    GraphwiseReactodiaSteps.provideRequiredProps();

    // Then each seeded IRI should be placed on the canvas as an element
    GraphwiseReactodiaSteps.getElements().should('have.length', 2);

    // When, I switch the language to French (effectively reloading the workspace)
    GraphwiseReactodiaSteps.switchToFrench();

    // Then, the language should be switched, and the number of nodes should be the same, because the layout should be
    // preserved before switching
    GraphwiseReactodiaSteps.getElements().should('have.length', 2);
  });

  it('Should restore the persisted diagram on refresh, until the host clears it', () => {
    // Given a workspace seeded with two nodes, which persists the layout to local storage
    GraphwiseReactodiaSteps.setSeed();
    GraphwiseReactodiaSteps.provideRequiredProps();
    GraphwiseReactodiaSteps.getElements().should('have.length', 2);
    // And the layout has actually reached local storage (the save is debounced)
    GraphwiseReactodiaSteps.getStoredDiagram().should('not.be.null');

    // When the page is refreshed and mounted again *without* a seed, so nothing can re-seed the canvas
    GraphwiseReactodiaSteps.visit();
    GraphwiseReactodiaSteps.provideRequiredProps();

    // Then the diagram is restored from local storage rather than starting empty
    GraphwiseReactodiaSteps.getElements().should('have.length', 2);

    // When the host clears the persisted diagram and the page is refreshed again
    GraphwiseReactodiaSteps.clearDiagramStorage();
    GraphwiseReactodiaSteps.getStoredDiagram().should('be.null');
    GraphwiseReactodiaSteps.visit();
    GraphwiseReactodiaSteps.provideRequiredProps();

    // Then there is nothing left to restore and the canvas starts empty
    GraphwiseReactodiaSteps.getCanvas().should('exist');
    GraphwiseReactodiaSteps.getElements().should('not.exist');
  });

  it('Should seed the canvas with the pre-resolved graph, drawing its edges directly', () => {
    // Given a pre-resolved graph seed (e.g. a CONSTRUCT result) staged before the workspace mounts
    GraphwiseReactodiaSteps.setSeedGraph();

    // When the workspace mounts with the required props
    GraphwiseReactodiaSteps.provideRequiredProps();

    // Then both endpoints of the seed link are placed on the canvas as elements
    GraphwiseReactodiaSteps.getElements().should('have.length', 2);
    // And the pre-resolved edge is drawn directly, without querying the SPARQL endpoint
    GraphwiseReactodiaSteps.getLinks().should('have.length', 1);
  });

  it('Should preserve the seeded graph when the workspace reloads', () => {
    // Given a workspace mounted from a pre-resolved graph seed
    GraphwiseReactodiaSteps.setSeedGraph();
    GraphwiseReactodiaSteps.provideRequiredProps();
    GraphwiseReactodiaSteps.getElements().should('have.length', 2);
    GraphwiseReactodiaSteps.getLinks().should('have.length', 1);

    // When the language is switched to French (effectively reloading the workspace)
    GraphwiseReactodiaSteps.switchToFrench();

    // Then the seeded graph is preserved: the same elements and edge remain on the canvas
    GraphwiseReactodiaSteps.getElements().should('have.length', 2);
    GraphwiseReactodiaSteps.getLinks().should('have.length', 1);
  });

  it('Should download the current diagram, even right after it is restored', () => {
    // Given a seeded diagram, which is persisted to local storage
    GraphwiseReactodiaSteps.setSeed();
    GraphwiseReactodiaSteps.provideRequiredProps();
    GraphwiseReactodiaSteps.storedDiagramShouldHaveElements(2);
    // And the page is refreshed, so the diagram is restored and there is nothing to undo
    GraphwiseReactodiaSteps.visit();
    GraphwiseReactodiaSteps.provideRequiredProps();
    GraphwiseReactodiaSteps.getElements().should('have.length', 2);
    // And the time is fixed, so the downloaded file name is known
    cy.clock(Date.UTC(2026, 8, 17, 10, 15, 30), ['Date']);

    // When the main menu is opened
    GraphwiseReactodiaSteps.openMainMenu();

    // Then the download is enabled
    GraphwiseReactodiaSteps.getDownloadDiagramAction().should('be.visible').and('not.be.disabled');

    // When the diagram is downloaded
    GraphwiseReactodiaSteps.getDownloadDiagramAction().click();

    // Then the file holds the serialized diagram with both elements
    GraphwiseReactodiaSteps.readDownloadedDiagram('diagram-20260917T101530.json').then((diagram) => {
      expect(diagram['@type']).to.equal('Diagram');
      expect(diagram.layoutData.elements.map((element) => element.iri)).to.have.members([
        'http://example.com/alice',
        'http://example.com/bob'
      ]);
    });
  });

  it('Should replace the diagram with an uploaded one and persist it', () => {
    // Given an empty workspace
    GraphwiseReactodiaSteps.provideRequiredProps();
    GraphwiseReactodiaSteps.getCanvas().should('exist');
    GraphwiseReactodiaSteps.getElements().should('not.exist');

    // When a diagram file with two elements is uploaded
    GraphwiseReactodiaSteps.uploadDiagram('valid-diagram.json');

    // Then both elements are placed on the canvas
    GraphwiseReactodiaSteps.getElements().should('have.length', 2);
    // And the uploaded diagram is persisted to local storage
    GraphwiseReactodiaSteps.storedDiagramShouldHaveElements(2);

    // When the page is refreshed
    GraphwiseReactodiaSteps.visit();
    GraphwiseReactodiaSteps.provideRequiredProps();

    // Then the uploaded diagram is restored
    GraphwiseReactodiaSteps.getElements().should('have.length', 2);
  });

  it('Should keep the current diagram when the uploaded file is not a diagram', () => {
    // Given a seeded diagram, which is persisted to local storage
    GraphwiseReactodiaSteps.setSeed();
    GraphwiseReactodiaSteps.provideRequiredProps();
    GraphwiseReactodiaSteps.storedDiagramShouldHaveElements(2);

    // When a JSON file, which is not a diagram, is uploaded
    GraphwiseReactodiaSteps.uploadDiagram('invalid-diagram.json');

    // Then the canvas keeps its elements
    GraphwiseReactodiaSteps.getElements().should('have.length', 2);
    // And the persisted diagram is unchanged
    GraphwiseReactodiaSteps.storedDiagramShouldHaveElements(2);
  });
});
