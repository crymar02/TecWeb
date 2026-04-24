describe('MEMEMUSEUM - Test Suite Finale', () => {

  describe('Guest Access', () => {
    it('1. Carica la home e mostra i meme', () => {
      cy.visit('/');
      cy.get('.meme-card').should('exist');
    });

    it('2. Verifica Paginazione (pulsante Successiva)', () => {
      cy.visit('/');
      cy.get('.nav-btn').contains('Successiva').should('exist');
    });

    it('3. Filtro per Tag', () => {
      cy.visit('/');
      cy.get('input[placeholder="Cerca per tag o titolo..."]')
      .type('test');
      cy.wait(500); 
      cy.get('.gallery-grid').should('be.visible'); 
   });
 });

  describe('Auth & Actions', () => {
    beforeEach(() => {
      cy.login('crimar@gmail.com', 'pass123');
    });

    it('4. Apertura form di Upload', () => {
      cy.visit('/');
      cy.get('.plus-icon').click();
      cy.get('input[placeholder="Titolo..."]').should('be.visible');
      cy.get('textarea[placeholder="Descrizione..."]').should('be.visible');
  
      cy.get('.btn-publish').contains('Pubblica').should('be.visible');
   });

    it('5. Logout', () => {
      cy.visit('/');
      cy.get('.btn-logout').click();
      cy.get('a').contains('Accedi').should('be.visible');
    });
  });

  describe('Contenuti Speciali', () => {
    it('6. Meme del Giorno', () => {
      cy.visit('/meme-del-giorno');
      cy.get('.museum-header').should('contain', "L'Opera del Giorno");
      cy.get('.meme-card').should('be.visible');
    });

   it('7. Dettaglio Meme (da Meme del Giorno)', () => {
  cy.visit('/meme-del-giorno');
  cy.get('.meme-card-day', { timeout: 10000 }).should('be.visible');
  cy.get('.btn-details').click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
  cy.get('.highlight-red').should('exist');
});
  });

  describe('Security', () => {
    it('8. Protezione rotta Auth', () => {
      cy.visit('/auth');
      cy.get('.auth-container').should('be.visible');
    });

    it('9. Redirect mancato (Test negativo)', () => {
      cy.visit('/');
      cy.get('.btn-logout').should('not.exist');
    });

    it('10. Verifica elementi UI per Guest', () => {
      cy.visit('/');
      cy.get('input[placeholder="Titolo"]').should('not.exist');
    });
  });
});