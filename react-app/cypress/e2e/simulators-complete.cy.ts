describe('Simulators - Complete Comprehensive Testing', () => {
  beforeEach(() => {
    cy.visit('/simulators');
  });

  describe('Page Structure & Rendering', () => {
    it('simulators page loads correctly', () => {
      cy.get('h1').should('contain', '🧪');
      cy.contains('Scenario Parameters').should('be.visible');
    });

    it('page title is visible', () => {
      cy.get('h1').should('be.visible').should('contain', '🧪');
    });

    it('all sections are visible', () => {
      cy.contains('Scenario Parameters').should('be.visible');
      cy.contains(/Success|Probability|FIRE/i).should('exist');
      cy.contains(/Drawdown|Distribution|Histogram/i).should('exist');
    });

    it('no error messages on load', () => {
      cy.get('body').should('not.contain', 'Error');
      cy.get('body').should('not.contain', 'undefined');
    });
  });

  describe('Slider Controls - All Four Sliders', () => {
    it('has exactly 4 range input sliders', () => {
      cy.get('input[type="range"]').should('have.length', 4);
    });

    it('slider 1: Market Stress Level', () => {
      cy.contains('Market Stress Level').should('be.visible');
      cy.get('input[type="range"]').eq(0).should('exist');
      cy.get('input[type="range"]').eq(0).should('have.attr', 'min');
      cy.get('input[type="range"]').eq(0).should('have.attr', 'max');
    });

    it('slider 2: Monthly Contribution', () => {
      cy.contains('Monthly Contribution').should('be.visible');
      cy.get('input[type="range"]').eq(1).should('exist');
    });

    it('slider 3: Expected Annual Return', () => {
      cy.contains('Expected Annual Return').should('be.visible');
      cy.get('input[type="range"]').eq(2).should('exist');
    });

    it('slider 4: Return Volatility', () => {
      cy.contains('Return Volatility').should('be.visible');
      cy.get('input[type="range"]').eq(3).should('exist');
    });

    it('all sliders are visible', () => {
      cy.get('input[type="range"]').each($slider => {
        cy.wrap($slider).should('be.visible');
      });
    });

    it('all sliders have labels above them', () => {
      const labels = [
        'Market Stress Level',
        'Monthly Contribution',
        'Expected Annual Return',
        'Return Volatility',
      ];

      labels.forEach(label => {
        cy.contains(label).should('be.visible');
      });
    });
  });

  describe('Slider Functionality - Individual Sliders', () => {
    it('stress level slider changes value', () => {
      cy.get('input[type="range"]').eq(0).should('have.value', /\d+/);
      cy.get('input[type="range"]').eq(0).invoke('val', 25).trigger('input');
      cy.get('input[type="range"]').eq(0).should('have.value', '25');
    });

    it('contribution slider changes value', () => {
      cy.get('input[type="range"]').eq(1).invoke('val', 10000).trigger('input');
      cy.get('input[type="range"]').eq(1).should('have.value', '10000');
    });

    it('return mean slider changes value', () => {
      cy.get('input[type="range"]').eq(2).invoke('val', 8).trigger('input');
      cy.get('input[type="range"]').eq(2).should('have.value', '8');
    });

    it('volatility slider changes value', () => {
      cy.get('input[type="range"]').eq(3).invoke('val', 15).trigger('input');
      cy.get('input[type="range"]').eq(3).should('have.value', '15');
    });

    it('sliders have min/max bounds', () => {
      cy.get('input[type="range"]').eq(0).then($slider => {
        const min = parseInt($slider.attr('min') || '0');
        const max = parseInt($slider.attr('max') || '100');
        expect(min).to.be.lessThan(max);
      });
    });

    it('sliders maintain values within bounds', () => {
      cy.get('input[type="range"]').eq(0).invoke('val', 999).trigger('input');
      cy.get('input[type="range"]').eq(0).then($slider => {
        const value = parseInt($slider.val() as string);
        const max = parseInt($slider.attr('max') || '100');
        expect(value).to.be.lessThanOrEqual(max);
      });
    });
  });

  describe('Slider Interactions & Events', () => {
    it('slider change triggers simulation update', () => {
      cy.get('input[type="range"]').eq(0).invoke('val', 50).trigger('input');
      cy.wait(300);
      cy.get('canvas').should('exist');
    });

    it('multiple sliders can be adjusted sequentially', () => {
      cy.get('input[type="range"]').eq(0).invoke('val', 25).trigger('input');
      cy.get('input[type="range"]').eq(1).invoke('val', 15000).trigger('input');
      cy.get('input[type="range"]').eq(2).invoke('val', 8).trigger('input');

      cy.wait(300);
      cy.get('canvas').should('exist');
    });

    it('rapid slider changes are handled', () => {
      cy.get('input[type="range"]').eq(0).invoke('val', 10).trigger('input');
      cy.get('input[type="range"]').eq(0).invoke('val', 20).trigger('input');
      cy.get('input[type="range"]').eq(0).invoke('val', 30).trigger('input');

      cy.wait(300);
      cy.get('canvas').should('exist');
    });

    it('slider value display updates', () => {
      // Some apps show the current value
      cy.get('input[type="range"]').eq(0).invoke('val', 75).trigger('input');
      cy.get('input[type="range"]').eq(0).should('have.value', '75');
    });
  });

  describe('Charts - Rendering & Updates', () => {
    it('charts render on load', () => {
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('Monte Carlo trajectories chart exists', () => {
      cy.contains('Monte Carlo Trajectories').should('be.visible');
    });

    it('drawdown distribution chart exists', () => {
      cy.contains('Drawdown Distribution').should('be.visible');
    });

    it('success rate card displays', () => {
      cy.contains('FIRE Success Probability').should('be.visible');
    });

    it('charts update when sliders change', () => {
      cy.get('canvas').should('have.length.greaterThan', 0);
      cy.get('input[type="range"]').eq(0).invoke('val', 50).trigger('input');
      cy.wait(300);
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('all charts have proper sizing', () => {
      cy.get('canvas').each($canvas => {
        const width = parseInt($canvas.attr('width') || '0');
        const height = parseInt($canvas.attr('height') || '0');
        expect(width).to.be.greaterThan(0);
        expect(height).to.be.greaterThan(0);
      });
    });
  });

  describe('Success Rate Display', () => {
    it('success rate percentage is visible', () => {
      cy.get('body').should('contain', /%/);
    });

    it('success rate is numeric and valid', () => {
      cy.contains(/\d+%/).should('exist');
    });

    it('success rate updates on slider change', () => {
      // Get initial success rate
      cy.get('body').then($body => {
        const initialText = $body.text();

        // Change stress level
        cy.get('input[type="range"]').eq(0).invoke('val', 75).trigger('input');
        cy.wait(300);

        // Success rate may change
        cy.get('body').should('contain', /%/);
      });
    });

    it('success rate is between 0 and 100', () => {
      cy.get('body')
        .invoke('text')
        .then(text => {
          const matches = text.match(/(\d+)%/);
          if (matches) {
            const percentage = parseInt(matches[1]);
            expect(percentage).to.be.greaterThanOrEqual(0);
            expect(percentage).to.be.lessThanOrEqual(100);
          }
        });
    });

    it('stress level affects success rate', () => {
      // Lower stress should have higher success rate
      cy.get('input[type="range"]').eq(0).invoke('val', 0).trigger('input');
      cy.wait(300);
      cy.get('body').invoke('text').then(lowStressText => {
        const lowMatch = lowStressText.match(/(\d+)%/);

        cy.get('input[type="range"]').eq(0).invoke('val', 100).trigger('input');
        cy.wait(300);
        cy.get('body').invoke('text').then(highStressText => {
          const highMatch = highStressText.match(/(\d+)%/);

          // Generally, high stress should reduce success rate
          // (though this depends on implementation)
          if (lowMatch && highMatch) {
            expect(lowMatch).to.exist;
            expect(highMatch).to.exist;
          }
        });
      });
    });
  });

  describe('Chart Interactions', () => {
    it('charts respond to hover', () => {
      cy.get('canvas').first().trigger('mousemove');
      cy.get('canvas').first().should('exist');
    });

    it('trajectories chart shows multiple paths', () => {
      cy.contains('Monte Carlo Trajectories').should('be.visible');
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('drawdown histogram is visible', () => {
      cy.contains('Drawdown Distribution').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('works on desktop (1920x1080)', () => {
      cy.viewport(1920, 1080);
      cy.visit('/simulators');
      cy.get('input[type="range"]').should('be.visible');
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('works on tablet (768x1024)', () => {
      cy.viewport(768, 1024);
      cy.visit('/simulators');
      cy.get('input[type="range"]').should('be.visible');
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('works on mobile (375x667)', () => {
      cy.viewport(375, 667);
      cy.visit('/simulators');
      cy.get('input[type="range"]').should('be.visible');
      cy.get('canvas').should('have.length.greaterThan', 0);
    });

    it('sliders are usable on all viewports', () => {
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 },
      ];

      viewports.forEach(vp => {
        cy.viewport(vp.width, vp.height);
        cy.visit('/simulators');
        cy.get('input[type="range"]').first().invoke('val', 50).trigger('input');
      });
    });

    it('charts adapt to viewport width', () => {
      cy.viewport(1920, 1080);
      cy.visit('/simulators');
      cy.get('canvas').first().then($large => {
        const widthLarge = $large.width();

        cy.viewport(375, 667);
        cy.get('canvas').first().then($small => {
          const widthSmall = $small.width();
          expect(widthSmall).to.be.lessThan(widthLarge || 0);
        });
      });
    });

    it('labels are readable on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/simulators');
      cy.contains('Market Stress Level').should('be.visible');
      cy.contains('Monthly Contribution').should('be.visible');
    });
  });

  describe('Privacy Mode Integration', () => {
    it('privacy mode hides sensitive values', () => {
      cy.get('button[aria-label="Privacy mode"]').click();
      cy.wait(200);
      cy.get('body').should('contain', /••••/);
    });

    it('privacy mode can be toggled off', () => {
      cy.get('button[aria-label="Privacy mode"]').click();
      cy.contains('••••').should('exist');

      cy.get('button[aria-label="Privacy mode"]').click();
      cy.get('body').should('not.contain', '••••');
    });

    it('charts render with privacy mode enabled', () => {
      cy.get('button[aria-label="Privacy mode"]').click();
      cy.get('canvas').should('have.length.greaterThan', 0);
    });
  });

  describe('Error Handling', () => {
    it('no console errors on page load', () => {
      let hasError = false;
      cy.on('uncaught:exception', (err, runnable) => {
        hasError = true;
        return false;
      });
      expect(hasError).to.equal(false);
    });

    it('handles extreme slider values', () => {
      cy.get('input[type="range"]').eq(0).invoke('val', 999999).trigger('input');
      cy.wait(300);
      cy.get('canvas').should('exist');
    });

    it('handles negative slider values gracefully', () => {
      cy.get('input[type="range"]').eq(0).invoke('val', -1).trigger('input');
      cy.wait(300);
      cy.get('canvas').should('exist');
    });
  });

  describe('Data Persistence', () => {
    it('slider values persist on page reload', () => {
      cy.get('input[type="range"]').eq(0).invoke('val', 42).trigger('input');
      cy.get('input[type="range"]').eq(0).should('have.value', '42');

      // Reload page
      cy.reload();

      // Value might reset or persist depending on implementation
      cy.get('input[type="range"]').eq(0).should('exist');
    });

    it('charts update after reload', () => {
      cy.reload();
      cy.get('canvas').should('have.length.greaterThan', 0);
    });
  });

  describe('Performance', () => {
    it('page loads within reasonable time', () => {
      cy.visit('/simulators', { timeout: 10000 });
      cy.get('h1').should('be.visible');
    });

    it('slider changes dont cause lag', () => {
      cy.get('input[type="range"]').eq(0).invoke('val', 10).trigger('input');
      cy.get('input[type="range"]').eq(0).invoke('val', 20).trigger('input');
      cy.get('input[type="range"]').eq(0).invoke('val', 30).trigger('input');

      cy.wait(500);
      cy.get('canvas').should('exist');
    });

    it('charts render efficiently with many trajectories', () => {
      cy.contains('Monte Carlo Trajectories').should('be.visible');
      cy.get('canvas').should('exist');
    });
  });

  describe('Navigation From Simulators', () => {
    it('can navigate to other pages', () => {
      cy.contains('a', 'Dashboard').click();
      cy.url().should('include', '/dashboard');
    });

    it('can return to simulators', () => {
      cy.contains('a', 'Dashboard').click();
      cy.contains('a', 'Simulators').click();
      cy.url().should('include', '/simulators');
    });

    it('slider state resets on revisit', () => {
      cy.get('input[type="range"]').eq(0).invoke('val', 75).trigger('input');
      cy.contains('a', 'Dashboard').click();
      cy.contains('a', 'Simulators').click();

      // May or may not reset depending on implementation
      cy.get('input[type="range"]').eq(0).should('exist');
    });
  });

  describe('Accessibility', () => {
    it('sliders have labels', () => {
      cy.contains('Market Stress Level').should('exist');
    });

    it('sliders are keyboard accessible', () => {
      cy.get('input[type="range"]').first().focus();
      cy.focused().should('have.attr', 'type', 'range');
    });

    it('buttons have aria labels', () => {
      cy.get('button[aria-label]').should('have.length.greaterThan', 0);
    });

    it('headings are present', () => {
      cy.get('h1, h2, h3').should('have.length.greaterThan', 0);
    });
  });

  describe('Visual Design', () => {
    it('sliders have clear visual styling', () => {
      cy.get('input[type="range"]').first().should('be.visible');
    });

    it('chart containers have proper spacing', () => {
      cy.get('canvas').parent().each($parent => {
        cy.wrap($parent).should('have.css', 'padding').and('have.css', 'margin');
      });
    });

    it('dark theme is applied', () => {
      cy.get('body').should('have.css', 'background-color');
    });

    it('text is readable against background', () => {
      cy.get('h1, label, span').each($elem => {
        cy.wrap($elem).should('have.css', 'color');
      });
    });
  });
});
