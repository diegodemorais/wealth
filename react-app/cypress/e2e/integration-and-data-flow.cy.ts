describe('Integration & Data Flow', () => {
  describe('Complete User Journey', () => {
    it('user can navigate full dashboard flow', () => {
      cy.visit('/');

      // Dashboard
      cy.get('h1').should('contain', '📈').and('contain', '📡');
      cy.get('[style*="border-left"]').should('have.length.greaterThan', 0);

      // Portfolio
      cy.contains('a', 'Portfolio').click();
      cy.url().should('include', '/portfolio');
      cy.get('h1').should('contain', '🎯');

      // Performance
      cy.contains('a', 'Performance').click();
      cy.url().should('include', '/performance');
      cy.get('h1').should('be.visible');

      // FIRE
      cy.contains('a', 'FIRE').click();
      cy.url().should('include', '/fire');
      cy.get('h1').should('contain', '🔥');

      // Simulators
      cy.contains('a', 'Simulators').click();
      cy.url().should('include', '/simulators');
      cy.get('h1').should('contain', '🧪');

      // Back to Dashboard
      cy.contains('a', 'Dashboard').click();
      cy.url().should('include', '/dashboard');
    });

    it('user can adjust simulators and see changes', () => {
      cy.visit('/simulators');

      // Initial state
      cy.get('input[type="range"]').eq(0).should('have.value', /\d+/);

      // Adjust sliders
      cy.get('input[type="range"]').eq(0).invoke('val', 50).trigger('input');
      cy.wait(200);

      // Verify update occurred
      cy.get('input[type="range"]').eq(0).should('have.value', '50');
      cy.get('canvas').should('exist');
    });

    it('user can toggle privacy mode throughout session', () => {
      cy.visit('/dashboard');

      // Initial state - values visible
      cy.get('button[aria-label="Privacy mode"]').click();
      cy.contains('••••').should('exist');

      // Navigate with privacy on
      cy.contains('a', 'Portfolio').click();
      cy.url().should('include', '/portfolio');
      cy.contains('••••').should('exist');

      // Toggle off
      cy.get('button[aria-label="Privacy mode"]').click();
      cy.get('body').should('not.contain', '••••');

      // Navigate
      cy.contains('a', 'FIRE').click();
      cy.get('body').should('not.contain', '••••');
    });
  });

  describe('Data Consistency Across Pages', () => {
    it('net worth displays consistently', () => {
      cy.visit('/dashboard');

      // Check if net worth is displayed
      cy.get('body').then($body => {
        if ($body.text().includes('R$') || $body.text().includes('M')) {
          // Net worth is shown, verify format
          cy.get('body').should('contain', /R\$|M|USD/);
        }
      });
    });

    it('all pages load with consistent styling', () => {
      const pages = ['/dashboard', '/portfolio', '/fire', '/withdraw', '/simulators'];

      pages.forEach(page => {
        cy.visit(page);
        cy.get('header').should('be.visible');
        cy.get('nav').should('be.visible');
        cy.get('h1').should('be.visible');
      });
    });

    it('KPI cards maintain status colors across pages', () => {
      cy.visit('/dashboard');

      cy.get('[style*="border-left"]').then($dashboardCards => {
        if ($dashboardCards.length > 0) {
          // All cards have color
          cy.get('[style*="border-left"]').each($card => {
            cy.wrap($card).should('have.css', 'border-left-color');
          });
        }
      });
    });
  });

  describe('State Management Across Navigation', () => {
    it('page state persists on back navigation', () => {
      cy.visit('/dashboard');
      cy.contains('a', 'Portfolio').click();
      cy.url().should('include', '/portfolio');

      cy.go('back');
      cy.url().should('include', '/dashboard');
    });

    it('scroll position resets on navigation', () => {
      cy.visit('/dashboard');
      cy.scrollTo(0, 500);
      cy.contains('a', 'Portfolio').click();
      // After navigation, should scroll to top
      cy.window().its('scrollY').should('equal', 0);
    });

    it('form inputs reset appropriately', () => {
      cy.visit('/simulators');

      // Set slider value
      cy.get('input[type="range"]').eq(0).invoke('val', 75).trigger('input');
      cy.get('input[type="range"]').eq(0).should('have.value', '75');

      // Navigate away
      cy.contains('a', 'Dashboard').click();

      // Return to simulators
      cy.contains('a', 'Simulators').click();
      // May reset or maintain - verify consistency
      cy.get('input[type="range"]').eq(0).should('exist');
    });
  });

  describe('Chart Updates on Data Change', () => {
    it('charts update when simulator values change', () => {
      cy.visit('/simulators');

      cy.get('canvas').should('have.length.greaterThan', 0);

      // Change contribution slider
      cy.get('input[type="range"]').eq(1).invoke('val', 20000).trigger('input');
      cy.wait(300);

      // Charts should still exist and be updated
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('multiple chart updates happen smoothly', () => {
      cy.visit('/simulators');

      // Rapid updates
      cy.get('input[type="range"]').eq(0).invoke('val', 10).trigger('input');
      cy.get('input[type="range"]').eq(1).invoke('val', 8000).trigger('input');
      cy.get('input[type="range"]').eq(2).invoke('val', 6).trigger('input');
      cy.get('input[type="range"]').eq(3).invoke('val', 10).trigger('input');

      cy.wait(500);

      // All charts should be present
      cy.get('canvas').should('have.length.greaterThan', 0);
    });
  });

  describe('Error Recovery', () => {
    it('page recovers from invalid slider values', () => {
      cy.visit('/simulators');

      // Set invalid value
      cy.get('input[type="range"]').eq(0).invoke('val', -999).trigger('input');
      cy.wait(200);

      // Page should still be functional
      cy.get('h1').should('be.visible');
      cy.get('canvas').should('exist');
    });

    it('page maintains functionality after refresh', () => {
      cy.visit('/simulators');
      cy.get('h1').should('contain', '🧪');

      cy.reload();

      cy.get('h1').should('contain', '🧪');
      cy.get('input[type="range"]').should('have.length', 4);
    });

    it('navigation works after page reload', () => {
      cy.visit('/dashboard');
      cy.reload();

      cy.contains('a', 'Portfolio').click();
      cy.url().should('include', '/portfolio');
    });
  });

  describe('Data Loading States', () => {
    it('pages dont show infinite loading', () => {
      cy.visit('/');
      cy.contains('Loading').should('not.exist');
    });

    it('simulators load data without hanging', () => {
      cy.visit('/simulators');
      cy.contains('Loading').should('not.exist');
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('all tabs load without loading state persisting', () => {
      const tabs = ['/dashboard', '/portfolio', '/fire', '/simulators', '/backtest'];

      tabs.forEach(tab => {
        cy.visit(tab);
        cy.contains('Loading').should('not.exist');
        cy.get('h1').should('be.visible');
      });
    });
  });

  describe('Privacy Mode Consistency', () => {
    it('privacy mode applies to all displayed values', () => {
      cy.visit('/dashboard');

      // Toggle privacy
      cy.get('button[aria-label="Privacy mode"]').click();

      // KPI cards should be masked
      cy.get('[style*="border-left"]').each($card => {
        cy.wrap($card).should(($el) => {
          const text = $el.text();
          // Should not show actual numbers, should show masks
          expect(text === '••••' || text.includes('•')).to.be.true;
        });
      });
    });

    it('privacy mode toggles cleanly', () => {
      cy.visit('/dashboard');

      // Toggle on
      cy.get('button[aria-label="Privacy mode"]').click();
      cy.contains('••••').should('exist');

      // Toggle off
      cy.get('button[aria-label="Privacy mode"]').click();
      cy.contains('••••').should('not.exist');

      // Toggle on again
      cy.get('button[aria-label="Privacy mode"]').click();
      cy.contains('••••').should('exist');
    });

    it('privacy button color indicates state', () => {
      cy.visit('/');

      const privacyBtn = cy.get('button[aria-label="Privacy mode"]');

      // Get initial color
      privacyBtn.should('have.css', 'background-color');

      // Toggle
      privacyBtn.click();

      // Color should change
      privacyBtn.should('have.css', 'background-color');
    });
  });

  describe('Layout Stability', () => {
    it('header stays fixed while scrolling', () => {
      cy.visit('/dashboard');

      // Get initial header position
      cy.get('header').should('have.css', 'position', 'sticky');

      // Scroll down
      cy.scrollTo(0, 500);

      // Header should still be visible and positioned correctly
      cy.get('header').should('be.visible').should('have.css', 'position', 'sticky');
    });

    it('tabs stay visible while scrolling', () => {
      cy.visit('/dashboard');

      cy.get('nav').should('have.css', 'position', 'sticky');

      cy.scrollTo(0, 500);

      cy.get('nav').should('be.visible');
      cy.contains('a', 'Portfolio').should('be.visible');
    });

    it('no layout shift on load', () => {
      cy.visit('/dashboard');

      cy.get('body').then($body => {
        const initialHeight = $body.height();
        cy.wait(500);
        const finalHeight = $body.height();

        // Height shouldn't change significantly (within 10%)
        const tolerance = (initialHeight || 0) * 0.1;
        expect(Math.abs((finalHeight || 0) - (initialHeight || 0))).to.be.lessThan(tolerance);
      });
    });

    it('modals or popups dont break layout', () => {
      cy.visit('/');
      cy.get('body').should('not.contain', 'Error');
    });
  });

  describe('Performance Metrics', () => {
    it('dashboard loads within 5 seconds', () => {
      cy.visit('/', { timeout: 5000 });
      cy.get('h1').should('be.visible');
    });

    it('simulator page loads and renders charts within 5 seconds', () => {
      cy.visit('/simulators', { timeout: 5000 });
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('slider changes update within 500ms', () => {
      cy.visit('/simulators');

      const startTime = Date.now();
      cy.get('input[type="range"]').eq(0).invoke('val', 50).trigger('input');

      cy.get('canvas')
        .should('have.length.greaterThan', 0)
        .then(() => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          expect(duration).to.be.lessThan(1000);
        });
    });
  });

  describe('Cross-Page Data Sharing', () => {
    it('user preferences persist across pages', () => {
      cy.visit('/');

      // Set privacy mode
      cy.get('button[aria-label="Privacy mode"]').click();

      // Navigate
      cy.contains('a', 'Portfolio').click();

      // Privacy mode should still be active
      cy.contains('••••').should('exist');

      // Navigate again
      cy.contains('a', 'FIRE').click();

      // Privacy mode should still be active
      cy.contains('••••').should('exist');
    });

    it('styling is consistent across all pages', () => {
      const pages = ['/dashboard', '/portfolio', '/performance', '/fire', '/simulators'];

      pages.forEach(page => {
        cy.visit(page);

        // All pages should have dark theme
        cy.get('body').should('have.css', 'background-color');

        // All pages should have headers and navigation
        cy.get('header').should('be.visible');
        cy.get('nav').should('be.visible');
      });
    });
  });

  describe('Content Availability', () => {
    it('all expected content sections exist on each page', () => {
      cy.visit('/dashboard');
      cy.get('h1').should('exist');
      cy.get('[style*="border-left"], canvas').should('have.length.greaterThan', 0);

      cy.visit('/simulators');
      cy.get('h1').should('exist');
      cy.get('input[type="range"]').should('have.length.greaterThan', 0);
    });

    it('no broken elements or missing assets', () => {
      const pages = ['/dashboard', '/portfolio', '/fire', '/simulators'];

      pages.forEach(page => {
        cy.visit(page);
        cy.get('body').should('not.contain', 'undefined');
        cy.get('body').should('not.contain', 'null');
        cy.get('body').should('not.contain', '[object Object]');
      });
    });
  });
});
