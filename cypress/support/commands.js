// Custom Cypress commands.
// https://on.cypress.io/custom-commands

/**
 * Get element by testId. Can be chained to another cypress command, or used directly.
 *
 * @Example
 * MySteps.getSomething().getByTestId('my-test-id');
 * Or
 * cy.getByTestId('my-test-id');
 */
Cypress.Commands.add('getByTestId', {prevSubject: 'optional'}, (subject, testId) => {
    return subject
        ? cy.wrap(subject).find(buildTestIdAttr(testId))
        : cy.get(buildTestIdAttr(testId));
});

function buildTestIdAttr(testId) {
    return `[data-test="${testId}"]`;
}
