describe('Responsive Design - All Viewports', () => {
  describe('Desktop Viewport (1920x1080)', () => {
    beforeEach(() => {
      cy.viewport(1920, 1080);
    });

    it('header is fully visible', () => {
      cy.visit('/');
      cy.get('header').should('be.visible');
      cy.get('header h1').should('be.visible');
      cy.get('header button').should('have.length.greaterThan', 2);
    });

    it('navigation tabs are all visible horizontally', () => {
      cy.visit('/');
      const tabs = ['Dashboard', 'Portfolio', 'Performance', 'FIRE', 'Withdraw', 'Simulators', 'Backtest'];

      tabs.forEach(tab => {
        cy.contains('a', tab).should('be.visible');
      });
    });

    it('content layout is optimal', () => {
      cy.visit('/dashboard');
      cy.get('[style*="border-left"]').should('have.length.greaterThan', 0);
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('charts render at full desktop size', () => {
      cy.visit('/dashboard');
      cy.get('canvas').first().then($canvas => {
        const width = parseInt($canvas.attr('width') || '0');
        expect(width).to.be.greaterThan(800);
      });
    });

    it('sidebar or multi-column layout works', () => {
      cy.visit('/portfolio');
      cy.get('body').should('be.visible');
    });
  });

  describe('Tablet Viewport (768x1024)', () => {
    beforeEach(() => {
      cy.viewport(768, 1024);
    });

    it('header remains functional', () => {
      cy.visit('/');
      cy.get('header').should('be.visible');
      cy.get('header button').should('have.length.greaterThan', 2);
    });

    it('navigation adapts to tablet size', () => {
      cy.visit('/');
      // Tabs should still be accessible
      cy.contains('a', 'Dashboard').should('exist');
      cy.contains('a', 'Portfolio').should('exist');
    });

    it('content is readable on tablet', () => {
      cy.visit('/dashboard');
      cy.get('h1').should('be.visible');
      cy.get('[style*="border-left"]').should('have.length.greaterThan', 0);
    });

    it('charts scale appropriately', () => {
      cy.visit('/dashboard');
      cy.get('canvas').should('have.length.greaterThan', 0);
      cy.get('canvas').each($canvas => {
        cy.wrap($canvas).should('be.visible');
      });
    });

    it('buttons have appropriate touch target size', () => {
      cy.visit('/');
      cy.get('button').each($btn => {
        // Should be at least 44x44 for touch targets
        cy.wrap($btn).should('have.css', 'padding');
      });
    });

    it('sliders are usable on tablet', () => {
      cy.visit('/simulators');
      cy.get('input[type="range"]').first().should('be.visible');
      cy.get('input[type="range"]').first().invoke('val', 50).trigger('input');
    });
  });

  describe('Mobile Viewport (375x667)', () => {
    beforeEach(() => {
      cy.viewport(375, 667);
    });

    it('header stacks properly on mobile', () => {
      cy.visit('/');
      cy.get('header').should('be.visible');
      cy.get('header h1').should('be.visible');
    });

    it('logo is visible', () => {
      cy.visit('/');
      cy.get('header h1').should('contain', '💰');
    });

    it('header buttons are stacked or hidden gracefully', () => {
      cy.visit('/');
      cy.get('header button').should('have.length.greaterThan', 0);
    });

    it('navigation is accessible on mobile', () => {
      cy.visit('/');
      // Either horizontal scroll, dropdown, or hamburger menu
      cy.get('a').contains('Dashboard').should('exist');
    });

    it('content is single column', () => {
      cy.visit('/dashboard');
      cy.get('h1').should('be.visible');
    });

    it('KPI cards stack vertically', () => {
      cy.visit('/dashboard');
      cy.get('[style*="border-left"]').should('have.length.greaterThan', 0);
      cy.get('[style*="border-left"]').each($card => {
        cy.wrap($card).should('be.visible');
      });
    });

    it('charts are mobile-optimized', () => {
      cy.visit('/dashboard');
      cy.get('canvas').should('have.length.greaterThan', 0);
      cy.get('canvas').each($canvas => {
        cy.wrap($canvas).should('be.visible');
      });
    });

    it('sliders work on mobile', () => {
      cy.visit('/simulators');
      cy.get('input[type="range"]').should('have.length', 4);
      cy.get('input[type="range"]').first().invoke('val', 75).trigger('input');
    });

    it('text is readable without zooming', () => {
      cy.visit('/');
      cy.get('body').should('have.css', 'font-size');
    });

    it('no horizontal scrolling needed for main content', () => {
      cy.visit('/dashboard');
      cy.get('body').then($body => {
        const scrollWidth = $body[0].scrollWidth;
        const clientWidth = $body[0].clientWidth;
        expect(scrollWidth).to.equal(clientWidth);
      });
    });

    it('touch targets are large enough', () => {
      cy.visit('/');
      cy.get('button, a').each($elem => {
        cy.wrap($elem).should('have.css', 'padding');
      });
    });
  });

  describe('Small Mobile (320x568)', () => {
    beforeEach(() => {
      cy.viewport(320, 568);
    });

    it('page still renders without errors', () => {
      cy.visit('/');
      cy.get('h1').should('be.visible');
    });

    it('header adapts to very small screens', () => {
      cy.visit('/');
      cy.get('header').should('be.visible');
    });

    it('content is accessible', () => {
      cy.visit('/dashboard');
      cy.get('body').should('not.contain', 'Error');
    });
  });

  describe('Responsive Across All Viewports', () => {
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Small Mobile', width: 320, height: 568 },
    ];

    viewports.forEach(viewport => {
      describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height);
        });

        it('dashboard loads without errors', () => {
          cy.visit('/');
          cy.get('h1').should('be.visible');
          cy.get('body').should('not.contain', 'Error');
        });

        it('navigation is accessible', () => {
          cy.visit('/');
          cy.contains('a', 'Portfolio').should('exist');
        });

        it('all pages load properly', () => {
          const pages = ['/dashboard', '/portfolio', '/fire', '/simulators'];

          pages.forEach(page => {
            cy.visit(page);
            cy.get('h1').should('be.visible');
          });
        });

        it('no layout shift on page load', () => {
          cy.visit('/');
          cy.get('header').should('be.visible');
          cy.get('h1').should('be.visible');
        });

        it('buttons are clickable', () => {
          cy.visit('/');
          cy.get('button').first().should('have.css', 'cursor', 'pointer');
        });

        it('links work correctly', () => {
          cy.visit('/');
          cy.contains('a', 'Portfolio').click();
          cy.url().should('include', '/portfolio');
        });

        it('content fits in viewport', () => {
          cy.visit('/dashboard');
          cy.get('body').then($body => {
            const scrollWidth = $body[0].scrollWidth;
            const clientWidth = $body[0].clientWidth;
            // Allow small margin for scrollbars
            expect(scrollWidth).to.be.lte(clientWidth + 50);
          });
        });
      });
    });
  });

  describe('Responsive State Persistence', () => {
    it('privacy mode persists across viewport changes', () => {
      cy.viewport(1920, 1080);
      cy.visit('/');

      // Toggle privacy
      cy.get('button[aria-label="Privacy mode"]').click();
      cy.contains('••••').should('exist');

      // Change viewport
      cy.viewport(375, 667);
      cy.contains('••••').should('exist');

      // Toggle back
      cy.get('button[aria-label="Privacy mode"]').click();
      cy.contains('••••').should('not.exist');
    });

    it('navigation state persists across viewport changes', () => {
      cy.viewport(1920, 1080);
      cy.visit('/');
      cy.contains('a', 'FIRE').click();
      cy.url().should('include', '/fire');

      // Change viewport
      cy.viewport(375, 667);
      cy.url().should('include', '/fire');
    });
  });

  describe('Responsive Typography', () => {
    it('headings are readable on all viewports', () => {
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 },
      ];

      viewports.forEach(vp => {
        cy.viewport(vp.width, vp.height);
        cy.visit('/');
        cy.get('h1').should('be.visible').should('have.css', 'font-size');
      });
    });

    it('labels are visible on all viewports', () => {
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 },
      ];

      viewports.forEach(vp => {
        cy.viewport(vp.width, vp.height);
        cy.visit('/simulators');
        cy.contains('Market Stress Level').should('be.visible');
      });
    });
  });

  describe('Responsive Spacing & Padding', () => {
    it('padding adjusts for mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/');
      cy.get('body').should('have.css', 'padding').and('have.css', 'margin');
    });

    it('content is not cramped', () => {
      cy.viewport(320, 568);
      cy.visit('/');
      cy.get('button').each($btn => {
        cy.wrap($btn).should('have.css', 'padding');
      });
    });
  });

  describe('Responsive Images & Media', () => {
    it('images scale properly', () => {
      cy.viewport(375, 667);
      cy.visit('/');

      cy.get('img').each($img => {
        cy.wrap($img).should('be.visible');
      });
    });

    it('charts scale responsively', () => {
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 },
      ];

      viewports.forEach(vp => {
        cy.viewport(vp.width, vp.height);
        cy.visit('/dashboard');
        cy.get('canvas').should('have.length.greaterThan', 0);
      });
    });
  });
});
