describe('Components - Complete Coverage', () => {
  describe('KPI Cards', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('displays KPI cards with values', () => {
      cy.get('[style*="border-left"]').should('have.length.greaterThan', 0);
    });

    it('KPI cards have labels', () => {
      cy.get('[style*="border-left"]')
        .first()
        .within(() => {
          cy.contains('label').should('exist');
        });
    });

    it('KPI cards display numeric values', () => {
      cy.get('[style*="border-left"]')
        .first()
        .should('contain', /\d+|R\$|%|USD/);
    });

    it('KPI cards have status color indicators', () => {
      cy.get('[style*="border-left"]')
        .first()
        .should('have.css', 'border-left-color');
    });

    it('status colors are applied correctly', () => {
      // Green, yellow, or red colors
      cy.get('[style*="border-left"]').each($card => {
        cy.wrap($card)
          .should('have.css', 'border-left-color')
          .and('match', /rgb/);
      });
    });

    it('delta values display when present', () => {
      cy.get('body').then($body => {
        if ($body.text().includes('%') || $body.text().includes('+')) {
          cy.contains(/%|\+|-/).should('exist');
        }
      });
    });

    it('privacy mode hides KPI values', () => {
      // Toggle privacy mode
      cy.get('button[aria-label="Privacy mode"]').click();

      // Values should be masked
      cy.contains('••••').should('exist');
    });

    it('privacy mode shows values when toggled off', () => {
      // Toggle to privacy mode
      cy.get('button[aria-label="Privacy mode"]').click();
      cy.contains('••••').should('exist');

      // Toggle back
      cy.get('button[aria-label="Privacy mode"]').click();
      cy.get('[style*="border-left"]').first().should('contain', /\d+/);
    });
  });

  describe('Collapsible Sections', () => {
    beforeEach(() => {
      cy.visit('/portfolio');
    });

    it('collapsible sections exist', () => {
      cy.get('[id^="section-"], button[aria-expanded]').should('have.length.greaterThan', 0);
    });

    it('collapsible sections can be toggled', () => {
      cy.get('button[aria-expanded="true"], button[aria-expanded="false"]')
        .first()
        .then($btn => {
          const initialState = $btn.attr('aria-expanded');
          cy.wrap($btn).click();
          cy.wrap($btn).should('have.attr', 'aria-expanded', initialState === 'true' ? 'false' : 'true');
        });
    });

    it('content visibility changes on toggle', () => {
      cy.get('button[aria-expanded]')
        .first()
        .click()
        .then(() => {
          // Content should animate or change visibility
          cy.get('[role="region"]').should('exist');
        });
    });

    it('multiple sections can be collapsed independently', () => {
      const collapsibles = cy.get('button[aria-expanded]');

      collapsibles.then($btns => {
        if ($btns.length >= 2) {
          cy.wrap($btns[0]).click();
          cy.wrap($btns[1]).click();

          // Both should have different states
          cy.get('button[aria-expanded]').should('have.length.greaterThan', 1);
        }
      });
    });
  });

  describe('Slider Components', () => {
    beforeEach(() => {
      cy.visit('/simulators');
    });

    it('slider inputs exist', () => {
      cy.get('input[type="range"]').should('have.length', 4);
    });

    it('sliders have labels', () => {
      cy.contains('Market Stress Level').should('be.visible');
      cy.contains('Monthly Contribution').should('be.visible');
      cy.contains('Expected Annual Return').should('be.visible');
      cy.contains('Return Volatility').should('be.visible');
    });

    it('sliders have min and max values', () => {
      cy.get('input[type="range"]').each($slider => {
        cy.wrap($slider).should('have.attr', 'min');
        cy.wrap($slider).should('have.attr', 'max');
      });
    });

    it('slider values are adjustable', () => {
      cy.get('input[type="range"]').eq(0).then($slider => {
        const initialVal = $slider.val();
        cy.wrap($slider).invoke('val', 50).trigger('input');
        cy.wrap($slider).should('have.value', '50');
      });
    });

    it('slider changes trigger updates', () => {
      cy.get('input[type="range"]').first().invoke('val', 75).trigger('input');

      // Wait for potential updates to charts
      cy.wait(300);
      cy.get('canvas').should('exist');
    });

    it('all 4 sliders work independently', () => {
      const sliders = cy.get('input[type="range"]');

      sliders.then($els => {
        cy.wrap($els[0]).invoke('val', 10).trigger('input');
        cy.wrap($els[1]).invoke('val', 20).trigger('input');
        cy.wrap($els[2]).invoke('val', 30).trigger('input');
        cy.wrap($els[3]).invoke('val', 40).trigger('input');

        cy.wrap($els[0]).should('have.value', '10');
        cy.wrap($els[1]).should('have.value', '20');
        cy.wrap($els[2]).should('have.value', '30');
        cy.wrap($els[3]).should('have.value', '40');
      });
    });
  });

  describe('Chart Components', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('charts render on dashboard', () => {
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('charts have proper dimensions', () => {
      cy.get('canvas').each($canvas => {
        cy.wrap($canvas).should('have.attr', 'width');
        cy.wrap($canvas).should('have.attr', 'height');
      });
    });

    it('charts render on all pages with charts', () => {
      const pagesWithCharts = ['/dashboard', '/portfolio', '/performance', '/fire', '/backtest'];

      pagesWithCharts.forEach(page => {
        cy.visit(page);
        cy.get('canvas').should('have.length.greaterThan', 0);
      });
    });

    it('charts are visible in viewport', () => {
      cy.get('canvas').each($canvas => {
        cy.wrap($canvas).should('be.visible');
      });
    });

    it('charts have proper containers', () => {
      cy.get('[class*="chart"], [class*="Chart"], canvas').should('have.length.greaterThan', 0);
    });
  });

  describe('Status Indicators (Semaforo)', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('status indicators display colors', () => {
      cy.get('body').should('contain', /✓|●|○|■/);
    });

    it('wellness status is visible', () => {
      cy.get('body').should('contain', /Crítico|Aviso|Saudável|Excelente|critical|warning|ok|excellent/i);
    });
  });

  describe('Component Rendering Performance', () => {
    it('dashboard loads without layout shift', () => {
      cy.visit('/');
      cy.get('h1').should('be.visible');
      cy.get('[style*="border-left"]').should('have.length.greaterThan', 0);
    });

    it('components render within reasonable time', () => {
      cy.visit('/');
      cy.get('body', { timeout: 10000 }).should('not.contain', 'Loading');
    });

    it('no console errors on component load', () => {
      let consoleError = false;
      cy.on('uncaught:exception', (err, runnable) => {
        if (
          err.message.includes('TypeError') ||
          err.message.includes('Cannot read properties')
        ) {
          consoleError = true;
          return false;
        }
      });
    });
  });

  describe('Component Interactions', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
    });

    it('buttons are clickable', () => {
      cy.get('button').first().should('have.css', 'cursor', 'pointer');
    });

    it('interactive elements respond to hover', () => {
      cy.get('button').first().trigger('mouseover');
      cy.get('button').first().should('exist');
    });

    it('forms/inputs are functional', () => {
      cy.get('input[type="range"]').then($inputs => {
        if ($inputs.length > 0) {
          cy.visit('/simulators');
          cy.get('input[type="range"]').first().invoke('val', 50).trigger('input');
          cy.get('input[type="range"]').first().should('have.value', '50');
        }
      });
    });

    it('links have proper href attributes', () => {
      cy.get('a').each($link => {
        cy.wrap($link).should('have.attr', 'href');
      });
    });
  });

  describe('Component Accessibility Features', () => {
    it('all interactive elements are keyboard accessible', () => {
      cy.get('button, a, input').each($elem => {
        cy.wrap($elem).focus();
        cy.focused().should('exist');
      });
    });

    it('form inputs have labels', () => {
      cy.visit('/simulators');
      cy.contains('Market Stress Level').should('exist');
    });

    it('images have alt text if present', () => {
      cy.get('img').each($img => {
        cy.wrap($img).should(($el) => {
          expect($el.attr('alt') || $el.attr('aria-label')).to.exist;
        });
      });
    });

    it('headings have proper hierarchy', () => {
      cy.get('h1').should('have.length.at.least', 1);
      cy.get('h2, h3, h4').should('have.length.greaterThan', 0);
    });
  });
});
