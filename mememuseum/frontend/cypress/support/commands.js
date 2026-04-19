Cypress.Commands.add('login', (email, password) => {
  cy.visit('/auth');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('.btn-auth').click();
  
  // Aspetta che il token sia salvato e il reindirizzamento avvenga
  cy.window().its('localStorage').invoke('getItem', 'token').should('exist');
  cy.get('.btn-logout').should('be.visible');
});