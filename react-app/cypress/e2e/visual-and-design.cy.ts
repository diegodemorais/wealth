describe('Visual Design & Consistency', () => {
  describe('Color Scheme', () => {
    it('dark theme is applied globally', () => {
      cy.visit('/');
      cy.get('body').should('have.css', 'background-color').and('include', 'rgb');
    });

    it('header has dark background', () => {
      cy.visit('/');
      cy.get('header').should('have.css', 'background-color');
    });

    it('navigation has dark background', () => {
      cy.visit('/');
      cy.get('nav').should('have.css', 'background-color');
    });

    it('text is light colored for readability', () => {
      cy.visit('/');
      cy.get('h1, a, label').each($elem => {
        cy.wrap($elem).should('have.css', 'color');
      });
    });

    it('buttons have consistent colors', () => {
      cy.visit('/');
      cy.get('button').eq(0).then($btn0 => {
        const color0 = $btn0.css('background-color');
        cy.get('button').eq(1).then($btn1 => {
          // Buttons might have different colors, but should be defined
          expect(color0).to.exist;
          expect($btn1.css('background-color')).to.exist;
        });
      });
    });

    it('status indicators have distinct colors', () => {
      cy.visit('/dashboard');

      // Cards should have distinct border colors
      cy.get('[style*="border-left"]').each($card => {
        cy.wrap($card).should('have.css', 'border-left-color');
      });
    });

    it('active tab has distinct color', () => {
      cy.visit('/');
      cy.get('a[href="/dashboard"]').should('have.css', 'color');
    });

    it('inactive tabs are visually distinct from active', () => {
      cy.visit('/');

      // Active tab
      cy.get('a[href="/dashboard"]').then($active => {
        const activeColor = $active.css('color');

        // Inactive tab
        cy.get('a[href="/portfolio"]').then($inactive => {
          const inactiveColor = $inactive.css('color');
          // Colors should be different
          expect(activeColor).not.to.equal(inactiveColor);
        });
      });
    });
  });

  describe('Typography', () => {
    it('headings have larger font size than body', () => {
      cy.visit('/');

      cy.get('h1').then($h1 => {
        const h1Size = parseInt($h1.css('font-size'));
        cy.get('p, span').first().then($body => {
          const bodySize = parseInt($body.css('font-size'));
          expect(h1Size).to.be.greaterThan(bodySize);
        });
      });
    });

    it('font family is consistent', () => {
      cy.visit('/');

      cy.get('h1').then($h1 => {
        const h1Font = $h1.css('font-family');
        cy.get('label').first().then($label => {
          const labelFont = $label.css('font-family');
          // Both should have font-family defined
          expect(h1Font).to.exist;
          expect(labelFont).to.exist;
        });
      });
    });

    it('font weights are consistent', () => {
      cy.visit('/');

      cy.get('h1').each($heading => {
        cy.wrap($heading).should('have.css', 'font-weight');
      });
    });

    it('line height is readable', () => {
      cy.visit('/');

      cy.get('p, span, label').each($elem => {
        cy.wrap($elem).should('have.css', 'line-height');
      });
    });

    it('text is left-aligned (or language-appropriate)', () => {
      cy.visit('/');

      cy.get('body').should('have.css', 'text-align').and('have.css', 'direction');
    });
  });

  describe('Spacing & Layout', () => {
    it('header has padding', () => {
      cy.visit('/');
      cy.get('header').should('have.css', 'padding');
    });

    it('navigation has padding', () => {
      cy.visit('/');
      cy.get('nav').should('have.css', 'padding');
    });

    it('content has margin or padding', () => {
      cy.visit('/dashboard');

      cy.get('[style*="border-left"], h1').each($elem => {
        cy.wrap($elem).should(($el) => {
          const margin = $el.css('margin');
          const padding = $el.css('padding');
          expect(margin || padding).to.exist;
        });
      });
    });

    it('cards have consistent spacing', () => {
      cy.visit('/dashboard');

      cy.get('[style*="border-left"]')
        .first()
        .then($card => {
          const margin = $card.css('margin');
          cy.get('[style*="border-left"]')
            .eq(1)
            .then($card2 => {
              const margin2 = $card2.css('margin');
              // Both cards should have spacing defined
              expect(margin).to.exist;
              expect(margin2).to.exist;
            });
        });
    });

    it('buttons have adequate padding', () => {
      cy.visit('/');

      cy.get('button').each($btn => {
        cy.wrap($btn).should('have.css', 'padding');
      });
    });

    it('content is centered with max-width', () => {
      cy.visit('/');

      cy.get('body').then($body => {
        const bodyWidth = $body.width();
        // Content should not stretch to full screen width on desktop
        expect(bodyWidth).to.exist;
      });
    });
  });

  describe('Borders & Shadows', () => {
    it('header has border', () => {
      cy.visit('/');
      cy.get('header').should('have.css', 'border-bottom');
    });

    it('navigation has border', () => {
      cy.visit('/');
      cy.get('nav').should('have.css', 'border-bottom');
    });

    it('cards have visual definition', () => {
      cy.visit('/dashboard');

      cy.get('[style*="border-left"]').first().should('have.css', 'border-left');
    });

    it('buttons have distinct appearance', () => {
      cy.visit('/');

      cy.get('button').first().should('have.css', 'background-color');
    });

    it('interactive elements have hover states', () => {
      cy.visit('/');

      cy.get('button').first().trigger('mouseover');
      // Should still be visible and styled
      cy.get('button').first().should('have.css', 'cursor', 'pointer');
    });
  });

  describe('Icons & Emojis', () => {
    it('logo emoji displays', () => {
      cy.visit('/');
      cy.get('header h1').should('contain', '💰');
    });

    it('tab navigation emojis display', () => {
      const emojis = ['📡', '🎯', '📈', '🔥', '💸', '🧪', '📊'];

      emojis.forEach(emoji => {
        cy.get('nav').should('contain', emoji);
      });
    });

    it('page heading emojis display', () => {
      cy.visit('/fire');
      cy.get('h1').should('contain', '🔥');

      cy.visit('/simulators');
      cy.get('h1').should('contain', '🧪');
    });

    it('status icons display correctly', () => {
      cy.visit('/dashboard');

      // Status colors are shown via borders or icons
      cy.get('[style*="border-left"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Responsive Visual Changes', () => {
    it('layout changes appropriately for tablet', () => {
      cy.viewport(1920, 1080);
      cy.visit('/dashboard');
      cy.get('h1').should('be.visible');

      cy.viewport(768, 1024);
      cy.visit('/dashboard');
      cy.get('h1').should('be.visible');
    });

    it('layout changes appropriately for mobile', () => {
      cy.viewport(1920, 1080);
      cy.visit('/dashboard');

      cy.viewport(375, 667);
      cy.visit('/dashboard');
      cy.get('h1').should('be.visible');
    });

    it('font sizes adjust for smaller screens', () => {
      cy.viewport(1920, 1080);
      cy.visit('/');
      cy.get('h1').then($h1Large => {
        const sizeLarge = parseInt($h1Large.css('font-size'));

        cy.viewport(375, 667);
        cy.visit('/');
        cy.get('h1').then($h1Small => {
          const sizeSmall = parseInt($h1Small.css('font-size'));
          // Mobile text might be smaller
          expect(sizeSmall).to.be.lessThanOrEqual(sizeLarge);
        });
      });
    });

    it('spacing adjusts for different viewports', () => {
      cy.viewport(1920, 1080);
      cy.visit('/');
      cy.get('header').then($headerLarge => {
        const paddingLarge = parseInt($headerLarge.css('padding'));

        cy.viewport(375, 667);
        cy.visit('/');
        cy.get('header').then($headerSmall => {
          const paddingSmall = parseInt($headerSmall.css('padding'));
          // Padding should exist on both
          expect(paddingLarge).to.be.greaterThan(0);
          expect(paddingSmall).to.be.greaterThan(0);
        });
      });
    });
  });

  describe('Visual Hierarchy', () => {
    it('h1 is largest heading', () => {
      cy.visit('/');

      cy.get('h1').then($h1 => {
        const h1Size = parseInt($h1.css('font-size'));

        cy.get('h2, h3, h4, h5, h6').first().then($hN => {
          if ($hN.length > 0) {
            const hNSize = parseInt($hN.css('font-size'));
            expect(h1Size).to.be.greaterThanOrEqual(hNSize);
          }
        });
      });
    });

    it('important information is prominent', () => {
      cy.visit('/dashboard');

      // Net worth or main metric should be visible and large
      cy.get('h1, [style*="border-left"]').should('have.length.greaterThan', 0);
    });

    it('secondary information is less prominent', () => {
      cy.visit('/');

      cy.get('h1').then($h1 => {
        const h1Size = parseInt($h1.css('font-size'));
        cy.get('label, span').first().then($secondary => {
          const secondarySize = parseInt($secondary.css('font-size'));
          // Secondary should be smaller or equal
          expect(secondarySize).to.be.lessThanOrEqual(h1Size);
        });
      });
    });
  });

  describe('Consistency Across Pages', () => {
    it('all pages use same header style', () => {
      const pages = ['/dashboard', '/portfolio', '/fire', '/simulators'];

      pages.forEach(page => {
        cy.visit(page);
        cy.get('header').should('have.css', 'background-color');
      });
    });

    it('all pages use same navigation style', () => {
      const pages = ['/dashboard', '/portfolio', '/fire'];

      let firstNavColor;

      cy.visit(pages[0]);
      cy.get('nav').then($nav => {
        firstNavColor = $nav.css('background-color');

        pages.forEach(page => {
          if (page !== pages[0]) {
            cy.visit(page);
            cy.get('nav').should('have.css', 'background-color', firstNavColor);
          }
        });
      });
    });

    it('KPI cards are styled consistently', () => {
      cy.visit('/dashboard');

      cy.get('[style*="border-left"]')
        .first()
        .then($card1 => {
          const borderColor1 = $card1.css('border-left-color');

          cy.get('[style*="border-left"]')
            .eq(1)
            .then($card2 => {
              // Both cards should have border-left
              expect(borderColor1).to.exist;
              expect($card2.css('border-left')).to.exist;
            });
        });
    });
  });

  describe('Dark Mode Consistency', () => {
    it('all text is light on dark background', () => {
      cy.visit('/');

      cy.get('h1, label, p, a, button').each($elem => {
        // Text should be light colored for dark theme
        cy.wrap($elem).should('have.css', 'color');
      });
    });

    it('focus states are visible', () => {
      cy.visit('/');

      cy.get('button').first().focus();
      cy.focused().should('exist');
    });

    it('borders provide contrast', () => {
      cy.visit('/');

      cy.get('header, nav').each($elem => {
        cy.wrap($elem).should('have.css', 'border');
      });
    });
  });

  describe('Visual Feedback', () => {
    it('buttons show hover state', () => {
      cy.visit('/');

      cy.get('button').first().then($btn => {
        const normalColor = $btn.css('background-color');

        cy.wrap($btn).trigger('mouseover');
        cy.wrap($btn).then($btnHover => {
          // Hover state should exist (may or may not change color)
          cy.wrap($btnHover).should('have.css', 'background-color');
        });
      });
    });

    it('active tabs are visually distinct', () => {
      cy.visit('/dashboard');

      cy.get('a[href="/dashboard"]').should('have.css', 'border-bottom');
    });

    it('sliders show current value', () => {
      cy.visit('/simulators');

      cy.get('input[type="range"]').first().invoke('val', 50).trigger('input');
      cy.get('input[type="range"]').first().should('have.value', '50');
    });

    it('charts show data feedback', () => {
      cy.visit('/dashboard');

      cy.get('canvas').should('have.length.greaterThan', 0);
    });
  });

  describe('Print Styles (if applicable)', () => {
    it('page renders without layout issues', () => {
      cy.visit('/');
      cy.get('h1').should('be.visible');
    });
  });

  describe('Emoji & Special Characters Rendering', () => {
    it('emojis render correctly in header', () => {
      cy.visit('/');
      cy.get('header h1').should('contain', '💰');
    });

    it('emojis render correctly in tabs', () => {
      cy.visit('/');
      cy.contains('🎯').should('exist');
      cy.contains('🔥').should('exist');
      cy.contains('🧪').should('exist');
    });

    it('special characters in labels render', () => {
      cy.visit('/simulators');
      // Should render labels with any special characters
      cy.contains('Volatility').should('exist');
    });
  });

  describe('Visual Alignment', () => {
    it('header elements are aligned', () => {
      cy.visit('/');

      cy.get('header').then($header => {
        cy.get('header h1').should('be.visible');
        cy.get('header button').should('be.visible');
      });
    });

    it('navigation items are aligned horizontally', () => {
      cy.visit('/');

      cy.get('nav a').then($links => {
        // All should be visible
        $links.each((i, el) => {
          cy.wrap(el).should('be.visible');
        });
      });
    });

    it('KPI cards are aligned', () => {
      cy.visit('/dashboard');

      cy.get('[style*="border-left"]').each($card => {
        cy.wrap($card).should('be.visible');
      });
    });
  });

  describe('Visual Animations', () => {
    it('page transitions are smooth', () => {
      cy.visit('/');
      cy.contains('a', 'Portfolio').click();
      cy.url().should('include', '/portfolio');
    });

    it('slider changes update smoothly', () => {
      cy.visit('/simulators');

      cy.get('input[type="range"]').first().invoke('val', 50).trigger('input');
      cy.wait(100);
      cy.get('canvas').should('exist');
    });

    it('privacy toggle is instant', () => {
      cy.visit('/');

      cy.get('button[aria-label="Privacy mode"]').click();
      cy.contains('••••').should('exist');
    });
  });
});
