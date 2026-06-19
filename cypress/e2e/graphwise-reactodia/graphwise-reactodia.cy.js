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

  it('Should keep the workspace mounted when currentRepository changes', () => {
    // Given a mounted workspace
    GraphwiseReactodiaSteps.provideRequiredProps();
    GraphwiseReactodiaSteps.getWorkspace().should('exist');

    // When the host re-points the wrapper at another repository at runtime
    GraphwiseReactodiaSteps.switchRepository();

    // Then the @Watch handler re-renders in place - the workspace is rebuilt, not torn down
    GraphwiseReactodiaSteps.getWorkspace().should('exist');
  });
});
