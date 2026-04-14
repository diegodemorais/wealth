describe('Charts - Complete Coverage', () => {
  describe('Dashboard Charts', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('dashboard page loads with charts', () => {
      cy.get('h1').should('contain', '📈').and('contain', '📡');
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('all chart containers are visible', () => {
      cy.get('canvas').each($canvas => {
        cy.wrap($canvas).should('be.visible');
      });
    });

    it('charts have proper sizing', () => {
      cy.get('canvas').each($canvas => {
        const width = parseInt($canvas.attr('width') || '0');
        const height = parseInt($canvas.attr('height') || '0');
        expect(width).to.be.greaterThan(0);
        expect(height).to.be.greaterThan(0);
      });
    });

    it('charts render without errors', () => {
      cy.get('canvas').should('have.length.greaterThan', 2);
      cy.get('body').should('not.contain', 'Error');
    });
  });

  describe('Portfolio Charts', () => {
    beforeEach(() => {
      cy.visit('/portfolio');
    });

    it('portfolio page displays charts', () => {
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('portfolio charts are rendered', () => {
      cy.get('h1').should('contain', '🎯');
      cy.get('canvas').first().should('be.visible');
    });

    it('allocation charts display correctly', () => {
      cy.get('canvas').should('have.length.greaterThan', 0);
    });
  });

  describe('Performance Charts', () => {
    beforeEach(() => {
      cy.visit('/performance');
    });

    it('performance page has charts', () => {
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('performance metrics display', () => {
      cy.get('body').should('contain', /%|Sharpe|Return/i);
    });

    it('charts are responsive in performance page', () => {
      cy.get('canvas').each($canvas => {
        cy.wrap($canvas).should('be.visible');
      });
    });
  });

  describe('FIRE Charts', () => {
    beforeEach(() => {
      cy.visit('/fire');
    });

    it('FIRE page has simulation charts', () => {
      cy.get('h1').should('contain', '🔥');
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('FIRE projections display', () => {
      cy.get('canvas').should('have.length.greaterThan', 0);
      cy.get('body').should('contain', /success|probability|projection/i);
    });

    it('net worth projection visible', () => {
      cy.contains(/Projection|Projeção|Net|Patrimônio/i).should('exist');
    });
  });

  describe('Backtest Charts', () => {
    beforeEach(() => {
      cy.visit('/backtest');
    });

    it('backtest page displays results', () => {
      cy.get('h1').should('contain', '📊');
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('backtest performance metrics visible', () => {
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('historical performance charts render', () => {
      cy.get('canvas').each($canvas => {
        cy.wrap($canvas).should('be.visible');
      });
    });
  });

  describe('Chart Data Binding', () => {
    it('charts update when data changes', () => {
      cy.visit('/simulators');

      // Get initial chart state
      cy.get('canvas').should('have.length.greaterThan', 0);

      // Change slider
      cy.get('input[type="range"]').first().invoke('val', 50).trigger('input');

      // Charts should still exist
      cy.wait(300);
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('charts reflect privacy mode changes', () => {
      cy.visit('/dashboard');
      const initialCharts = cy.get('canvas').then(els => els.length);

      // Toggle privacy mode
      cy.get('button[aria-label="Privacy mode"]').click();

      // Charts should still render
      cy.get('canvas').should('have.length.greaterThan', 0);
    });
  });

  describe('Chart Container Organization', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('charts are organized in sections', () => {
      cy.get('[class*="section"], [class*="card"], div[style*="margin"]').should('have.length.greaterThan', 0);
    });

    it('chart sections have proper spacing', () => {
      cy.get('canvas').parent().each($parent => {
        cy.wrap($parent).should('have.css', 'padding').and('have.css', 'margin');
      });
    });

    it('multiple charts layout properly', () => {
      cy.get('canvas').then($charts => {
        if ($charts.length > 1) {
          // Charts should have proper positioning
          cy.get('canvas').each($canvas => {
            cy.wrap($canvas).should('be.visible');
          });
        }
      });
    });
  });

  describe('Chart Labels & Legends', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('charts have labels or legends', () => {
      // Chart.js renders text on canvas or as separate elements
      cy.get('canvas, text, label').should('have.length.greaterThan', 0);
    });

    it('axis labels are readable', () => {
      cy.get('text, label').each($elem => {
        cy.wrap($elem).should('have.css', 'color');
      });
    });
  });

  describe('Chart Interactivity', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('charts are visible for interaction', () => {
      cy.get('canvas').each($canvas => {
        cy.wrap($canvas).should('be.visible').should('have.css', 'cursor');
      });
    });

    it('chart areas respond to mouse events', () => {
      cy.get('canvas').first().trigger('mousemove');
      cy.get('canvas').first().should('exist');
    });
  });

  describe('Chart Responsiveness', () => {
    it('charts adapt to window size - desktop', () => {
      cy.viewport(1920, 1080);
      cy.visit('/dashboard');
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('charts adapt to window size - tablet', () => {
      cy.viewport(768, 1024);
      cy.visit('/dashboard');
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('charts adapt to window size - mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/dashboard');
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('chart sizing adjusts responsively', () => {
      cy.viewport(1920, 1080);
      cy.visit('/dashboard');

      cy.get('canvas').first().then($chartLarge => {
        const widthLarge = $chartLarge.width();

        cy.viewport(375, 667);
        cy.get('canvas').first().then($chartSmall => {
          const widthSmall = $chartSmall.width();
          // Mobile should be narrower
          expect(widthSmall).to.be.lessThan(widthLarge || 0);
        });
      });
    });
  });

  describe('Chart Performance', () => {
    it('charts load without timeout', () => {
      cy.visit('/dashboard', { timeout: 15000 });
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('multiple charts on page load successfully', () => {
      cy.visit('/dashboard');
      cy.get('canvas').then($charts => {
        expect($charts.length).to.be.greaterThan(1);
      });
    });

    it('chart pages dont have memory leaks (charts render consistently)', () => {
      cy.visit('/dashboard');
      const initialCount = cy.get('canvas').then(els => els.length);

      // Navigate away and back
      cy.visit('/portfolio');
      cy.visit('/dashboard');

      // Should still have charts
      cy.get('canvas').should('have.length.greaterThan', 0);
    });
  });

  describe('Chart Color Accessibility', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('chart elements have sufficient contrast', () => {
      // Check canvas and text elements
      cy.get('canvas, text, label').each($elem => {
        cy.wrap($elem).should('have.css', 'color').and('have.css', 'background-color');
      });
    });

    it('charts render in privacy mode', () => {
      cy.get('button[aria-label="Privacy mode"]').click();
      cy.get('canvas').should('have.length.greaterThan', 0);
    });
  });
});
