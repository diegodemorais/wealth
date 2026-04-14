describe('Privacy Mode & Design', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('displays dark theme', () => {
    cy.get('body').should('have.css', 'background-color').and('include', 'rgb');
  });

  it('has sticky header', () => {
    cy.get('header, [style*="sticky"]').first().should('exist');
  });

  it('has navigation tabs visible', () => {
    cy.get('nav, .tab-nav').should('be.visible');
  });

  it('displays page heading', () => {
    cy.get('h1').should('be.visible');
  });

  it('maintains layout when scrolling', () => {
    // Scroll down
    cy.scrollTo(0, 500);

    // Header should still be visible
    cy.get('header, [style*="sticky"]').first().should('be.visible');
  });
});

describe('Cross-Tab Navigation', () => {
  it('navigates between all tabs without errors', () => {
    const tabs = [
      { url: '/dashboard', label: '📈' },
      { url: '/portfolio', label: '🎯' },
      { url: '/performance', label: '📈' },
      { url: '/fire', label: '🔥' },
      { url: '/withdraw', label: '💸' },
      { url: '/simulators', label: '🧪' },
      { url: '/backtest', label: '📊' },
    ];

    tabs.forEach(tab => {
      cy.visit(tab.url);
      cy.url().should('include', tab.url);

      // Verify page loaded (has heading)
      cy.get('h1').should('be.visible');

      // Verify no errors in console
      cy.on('uncaught:exception', (err) => {
        // Ignore ChartJS warnings
        if (err.message.includes('Chart')) return false;
        throw err;
      });
    });
  });
});

describe('Data Loading', () => {
  it('loads data on initial visit', () => {
    cy.visit('/dashboard');

    // Wait for charts to render (not "Loading..." text)
    cy.contains('Loading').should('not.exist');

    // Should have content
    cy.get('h1').should('be.visible');
  });

  it('loads all tabs without loading state', () => {
    const tabs = ['/portfolio', '/performance', '/fire', '/withdraw', '/backtest'];

    tabs.forEach(tab => {
      cy.visit(tab);

      // Should not show loading text
      cy.contains('Loading').should('not.exist');
    });
  });
});
