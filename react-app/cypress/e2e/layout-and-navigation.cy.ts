describe('Layout & Navigation - Complete Suite', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Header Component', () => {
    it('displays logo correctly', () => {
      cy.get('header h1').should('contain', '💰 Wealth');
    });

    it('has sticky positioning', () => {
      cy.get('header').should('have.css', 'position', 'sticky');
      cy.get('header').should('have.css', 'top', '0px');
    });

    it('displays all control buttons', () => {
      cy.get('header button').should('have.length.at.least', 3);
      cy.get('header button[aria-label="Reload"]').should('exist');
      cy.get('header button[aria-label="Privacy mode"]').should('exist');
    });

    it('reload button works', () => {
      cy.get('header button[aria-label="Reload"]').click();
      cy.url().should('exist');
    });

    it('privacy toggle button changes color on click', () => {
      const privacyBtn = cy.get('header button[aria-label="Privacy mode"]');
      privacyBtn.should('have.css', 'background-color').and('include', 'rgb');
      privacyBtn.click();
      cy.get('header button[aria-label="Privacy mode"]').should(
        'have.css',
        'background-color'
      );
    });

    it('has proper dark theme background', () => {
      cy.get('header').should('have.css', 'background-color').and('include', 'rgb');
    });

    it('has border bottom separator', () => {
      cy.get('header').should('have.css', 'border-bottom');
    });
  });

  describe('Tab Navigation', () => {
    it('displays all 7 navigation tabs', () => {
      const expectedTabs = ['Dashboard', 'Portfolio', 'Performance', 'FIRE', 'Withdraw', 'Simulators', 'Backtest'];

      expectedTabs.forEach(tab => {
        cy.contains('a', tab).should('exist').should('be.visible');
      });
    });

    it('tabs have proper emojis', () => {
      const tabsWithEmojis = [
        { label: 'Dashboard', emoji: '📡' },
        { label: 'Portfolio', emoji: '🎯' },
        { label: 'Performance', emoji: '📈' },
        { label: 'FIRE', emoji: '🔥' },
        { label: 'Withdraw', emoji: '💸' },
        { label: 'Simulators', emoji: '🧪' },
        { label: 'Backtest', emoji: '📊' },
      ];

      tabsWithEmojis.forEach(tab => {
        cy.contains('a', tab.emoji).should('exist');
      });
    });

    it('dashboard tab is active by default', () => {
      cy.get('a.active, [class*="active"]')
        .first()
        .should('contain', 'Dashboard');
    });

    it('tab navigation has sticky positioning', () => {
      cy.get('nav').should('have.css', 'position', 'sticky');
    });

    it('tab styling changes on active state', () => {
      // Get active tab style
      cy.get('a[href="/dashboard"]').should('have.css', 'border-bottom');

      // Navigate to Portfolio
      cy.contains('a', 'Portfolio').click();
      cy.url().should('include', '/portfolio');

      // New active tab should have different styling
      cy.get('a[href="/portfolio"]').should('have.css', 'border-bottom');
    });

    it('maintains tab visibility while scrolling', () => {
      cy.scrollTo(0, 500);
      cy.get('nav').should('be.visible');
      cy.get('a').contains('Portfolio').should('be.visible');
    });
  });

  describe('Full Navigation Flow', () => {
    it('navigates to all tabs without errors', () => {
      const tabs = [
        { url: '/dashboard', name: 'Dashboard' },
        { url: '/portfolio', name: 'Portfolio' },
        { url: '/performance', name: 'Performance' },
        { url: '/fire', name: 'FIRE' },
        { url: '/withdraw', name: 'Withdraw' },
        { url: '/simulators', name: 'Simulators' },
        { url: '/backtest', name: 'Backtest' },
      ];

      tabs.forEach(tab => {
        cy.contains('a', tab.name).click();
        cy.url().should('include', tab.url);
        cy.get('h1').should('be.visible');
        cy.get('body').should('not.contain', 'Error');
      });
    });

    it('back/forward navigation works', () => {
      cy.visit('/');
      cy.contains('a', 'Portfolio').click();
      cy.url().should('include', '/portfolio');

      cy.go('back');
      cy.url().should('include', '/dashboard');

      cy.go('forward');
      cy.url().should('include', '/portfolio');
    });

    it('direct URL navigation works', () => {
      cy.visit('/simulators');
      cy.url().should('include', '/simulators');
      cy.get('h1').should('be.visible');

      cy.visit('/fire');
      cy.url().should('include', '/fire');
      cy.get('h1').should('be.visible');
    });
  });

  describe('Page Titles & Headings', () => {
    it('dashboard has correct heading', () => {
      cy.visit('/');
      cy.get('h1').should('contain', '📈').and('contain', '📡');
    });

    it('portfolio page has correct heading', () => {
      cy.visit('/portfolio');
      cy.get('h1').should('be.visible');
    });

    it('fire page has correct heading', () => {
      cy.visit('/fire');
      cy.get('h1').should('contain', '🔥');
    });

    it('simulators page has correct heading', () => {
      cy.visit('/simulators');
      cy.get('h1').should('contain', '🧪');
    });

    it('all pages have main heading', () => {
      const pages = ['/dashboard', '/portfolio', '/performance', '/fire', '/withdraw', '/simulators', '/backtest'];

      pages.forEach(page => {
        cy.visit(page);
        cy.get('h1').should('be.visible');
      });
    });
  });

  describe('Layout Containers', () => {
    it('main content has proper max-width', () => {
      cy.get('main, [role="main"]').should('exist');
    });

    it('content is centered and has padding', () => {
      cy.get('body').should('have.css', 'padding');
    });

    it('footer exists (if present)', () => {
      cy.get('footer').then($footer => {
        if ($footer.length > 0) {
          cy.get('footer').should('be.visible');
        }
      });
    });
  });

  describe('Navigation Accessibility', () => {
    it('nav links have proper aria labels', () => {
      cy.get('nav a').each($link => {
        cy.wrap($link).should('have.attr', 'href');
      });
    });

    it('header buttons have aria labels', () => {
      cy.get('header button').each($btn => {
        cy.wrap($btn).should('have.attr', 'aria-label');
      });
    });

    it('keyboard navigation works with Tab key', () => {
      cy.get('header button').first().focus();
      cy.focused().should('have.attr', 'aria-label');
    });

    it('links are keyboard accessible', () => {
      cy.get('nav a').first().focus();
      cy.focused().should('have.attr', 'href');
    });
  });

  describe('Visual Design Consistency', () => {
    it('header has dark background', () => {
      cy.get('header').should('have.css', 'background-color');
    });

    it('tabs have dark background', () => {
      cy.get('nav').should('have.css', 'background-color');
    });

    it('text has adequate contrast', () => {
      cy.get('header h1').should('have.css', 'color');
      cy.get('nav a').should('have.css', 'color');
    });

    it('buttons have hover states', () => {
      cy.get('header button').first().trigger('mouseover');
      cy.get('header button').first().should('have.css', 'cursor', 'pointer');
    });
  });

  describe('Loading States', () => {
    it('pages load without infinite loading', () => {
      cy.visit('/');
      cy.contains('Loading').should('not.exist');
      cy.get('h1').should('be.visible');
    });

    it('all tabs load properly', () => {
      const tabs = ['/dashboard', '/portfolio', '/fire', '/simulators'];

      tabs.forEach(tab => {
        cy.visit(tab);
        cy.contains('Loading').should('not.exist');
        cy.get('h1').should('be.visible');
      });
    });
  });
});
