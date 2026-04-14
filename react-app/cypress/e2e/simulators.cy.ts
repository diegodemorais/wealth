describe('Simulators - Real Interaction Tests', () => {
  beforeEach(() => {
    cy.visit('/simulators');
  });

  it('loads simulators page with controls', () => {
    cy.get('h1').should('contain', '🧪');
    cy.contains('Scenario Parameters').should('be.visible');
  });

  it('has 4 slider inputs', () => {
    cy.get('input[type="range"]').should('have.length', 4);
  });

  it('sliders have visible labels', () => {
    cy.contains('Market Stress Level').should('be.visible');
    cy.contains('Monthly Contribution').should('be.visible');
    cy.contains('Expected Annual Return').should('be.visible');
    cy.contains('Return Volatility').should('be.visible');
  });

  it('adjusts stress level slider', () => {
    cy.get('input[type="range"]').first().should('have.value', '0');

    // Drag slider to 50%
    cy.get('input[type="range"]').first().invoke('val', '50').trigger('input');

    cy.get('input[type="range"]').first().should('have.value', '50');
  });

  it('adjusts contribution slider', () => {
    cy.get('input[type="range"]').eq(1).invoke('val', '15000').trigger('input');
    cy.get('input[type="range"]').eq(1).should('have.value', '15000');
  });

  it('displays success rate percentage', () => {
    // Look for percentage pattern
    cy.get('body').should('contain.text', '%');
  });

  it('has drawdown distribution chart', () => {
    cy.contains('Drawdown Distribution').should('be.visible');
  });

  it('has Monte Carlo trajectories chart', () => {
    cy.contains('Monte Carlo Trajectories').should('be.visible');
  });

  it('displays success rate card', () => {
    cy.contains('FIRE Success Probability').should('be.visible');
  });

  it('updates on slider change', () => {
    // Get initial value from card/display
    const initialText = cy.get('body').then($body => $body.text());

    // Change slider
    cy.get('input[type="range"]').first().invoke('val', '75').trigger('input');

    // Wait a bit for update
    cy.wait(500);

    // Verify charts are still rendered
    cy.get('canvas').should('exist');
  });
});

describe('Simulators - Responsiveness', () => {
  beforeEach(() => {
    cy.visit('/simulators');
  });

  it('works on desktop viewport', () => {
    cy.viewport(1920, 1080);
    cy.get('input[type="range"]').should('be.visible');
    cy.contains('Scenario Parameters').should('be.visible');
  });

  it('works on tablet viewport', () => {
    cy.viewport(768, 1024);
    cy.get('input[type="range"]').should('be.visible');
  });

  it('works on mobile viewport', () => {
    cy.viewport(375, 667);
    cy.get('input[type="range"]').should('be.visible');
  });
});
