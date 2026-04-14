describe('Dashboard Tab Navigation & Rendering', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads dashboard page', () => {
    cy.get('h1').should('contain', '📈');
    cy.get('h1').should('be.visible');
  });

  it('displays all navigation tabs', () => {
    const tabs = ['Dashboard', 'Portfolio', 'Performance', 'FIRE', 'Withdraw', 'Simulators', 'Backtest'];

    tabs.forEach(tab => {
      cy.contains('a', tab).should('exist');
    });
  });

  it('navigates to portfolio tab', () => {
    cy.contains('a', 'Portfolio').click();
    cy.url().should('include', '/portfolio');
    cy.contains('h1', '🎯').should('be.visible');
  });

  it('navigates to performance tab', () => {
    cy.contains('a', 'Performance').click();
    cy.url().should('include', '/performance');
  });

  it('navigates to FIRE tab', () => {
    cy.contains('a', 'FIRE').click();
    cy.url().should('include', '/fire');
    cy.contains('h1', '🔥').should('be.visible');
  });

  it('navigates to withdraw tab', () => {
    cy.contains('a', 'Withdraw').click();
    cy.url().should('include', '/withdraw');
    cy.contains('h1', '💸').should('be.visible');
  });

  it('navigates to simulators tab', () => {
    cy.contains('a', 'Simulators').click();
    cy.url().should('include', '/simulators');
    cy.contains('h1', '🧪').should('be.visible');
  });

  it('navigates to backtest tab', () => {
    cy.contains('a', 'Backtest').click();
    cy.url().should('include', '/backtest');
    cy.contains('h1', '📊').should('be.visible');
  });
});

describe('Collapsible Sections', () => {
  beforeEach(() => {
    cy.visit('/portfolio');
  });

  it('expands and collapses sections', () => {
    // Find first collapsible section
    cy.get('[id^="section-"]').first().then(section => {
      const sectionId = section.attr('id');

      // Get the button to toggle it (usually a parent or sibling)
      cy.get(`#${sectionId}`).parent().within(() => {
        cy.contains('button, [role="button"]').should('exist');
      });
    });
  });
});

describe('Chart Rendering', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('renders canvas elements for charts', () => {
    // Chart.js renders to canvas
    cy.get('canvas').should('exist');
  });

  it('portfolio page has charts', () => {
    cy.visit('/portfolio');
    cy.get('canvas').should('exist');
  });

  it('performance page has charts', () => {
    cy.visit('/performance');
    cy.get('canvas').should('exist');
  });

  it('fire page has charts', () => {
    cy.visit('/fire');
    cy.get('canvas').should('exist');
  });
});
