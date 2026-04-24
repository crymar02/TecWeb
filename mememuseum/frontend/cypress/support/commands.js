Cypress.Commands.add('login', (email, password) => {
  cy.visit('/auth');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('.btn-auth').click();
  cy.window().its('localStorage').invoke('getItem', 'userId').should('exist');
  cy.get('.btn-logout').should('be.visible');
});