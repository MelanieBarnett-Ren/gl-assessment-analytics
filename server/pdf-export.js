/**
 * PDF Export Functionality
 * Provides options to export current page or all pages to PDF
 */

class PDFExporter {
  constructor() {
    this.pages = [
      { name: 'Landing Page', url: '/', title: 'Dashboard Home' },
      { name: 'MAT Overview', url: '/mat', title: 'Multi-Academy Trust Overview' },
      { name: 'GL Assessment', url: '/gl', title: 'GL Assessment Analysis' },
      { name: 'Visual Dashboard', url: '/dashboard', title: 'Visual Analytics Dashboard' },
      { name: 'Skills Analysis (School A)', url: '/school/school6/skills', title: 'School A Skills Analysis' },
      { name: 'Skills Analysis (School B)', url: '/school/school7/skills', title: 'School B Skills Analysis' },
      { name: 'Skills Analysis (School C)', url: '/school/school8/skills', title: 'School C Skills Analysis' },
      { name: 'Class 5A', url: '/class/class6a', title: 'Class 5A Details' },
      { name: 'Class 5B', url: '/class/class7a', title: 'Class 5B Details' },
      { name: 'Class 5C', url: '/class/class8a', title: 'Class 5C Details' },
      { name: 'Strand Analysis', url: '/school/school6/strand/number-fractions', title: 'Strand Drill-Down' },
      { name: 'Reports', url: '/reports', title: 'Reports & Exports' },
      { name: 'AI Insights', url: '/demo-dashboard', title: 'AI Insights Dashboard' },
      { name: 'Hackathon Demo', url: '/hackathon', title: 'Original Demo' }
    ];
    this.init();
  }

  init() {
    this.createButton();
    this.attachEventListeners();
  }

  createButton() {
    const container = document.createElement('div');
    container.id = 'pdf-export-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'PDF Export Tools');
    container.innerHTML = `
      <div class="pdf-fab-wrapper">
        <button id="pdf-fab-btn" class="pdf-fab"
                aria-label="Export to PDF"
                aria-haspopup="menu"
                aria-expanded="false"
                aria-controls="pdf-menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span class="pdf-fab-text">PDF</span>
        </button>
        <div id="pdf-menu"
             class="pdf-menu"
             role="menu"
             aria-labelledby="pdf-fab-btn"
             aria-hidden="true"
             style="display: none;">
          <div class="pdf-menu-header">
            <h4 id="pdf-menu-title">Export to PDF</h4>
            <button id="pdf-menu-close"
                    class="pdf-menu-close"
                    aria-label="Close export menu">&times;</button>
          </div>
          <div class="pdf-menu-content">
            <button id="export-current"
                    class="pdf-menu-item"
                    role="menuitem"
                    aria-label="Export current page only">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <div>
                <div class="pdf-menu-item-title">Current Page</div>
                <div class="pdf-menu-item-desc">Export this page only</div>
              </div>
            </button>
            <button id="export-all"
                    class="pdf-menu-item"
                    role="menuitem"
                    aria-label="Export all dashboard pages">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              </svg>
              <div>
                <div class="pdf-menu-item-title">All Pages</div>
                <div class="pdf-menu-item-desc">Export all dashboard pages</div>
              </div>
            </button>
            <button id="export-selected"
                    class="pdf-menu-item"
                    role="menuitem"
                    aria-label="Choose which pages to export">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              <div>
                <div class="pdf-menu-item-title">Select Pages</div>
                <div class="pdf-menu-item-desc">Choose which pages to export</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
  }

  attachEventListeners() {
    const fabBtn = document.getElementById('pdf-fab-btn');
    const menu = document.getElementById('pdf-menu');
    const closeBtn = document.getElementById('pdf-menu-close');
    const exportCurrent = document.getElementById('export-current');
    const exportAll = document.getElementById('export-all');
    const exportSelected = document.getElementById('export-selected');
    const menuItems = [exportCurrent, exportAll, exportSelected];

    // Toggle menu
    fabBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = menu.style.display === 'block';
      this.toggleMenu(!isVisible);
    });

    // Close menu
    closeBtn.addEventListener('click', () => {
      this.toggleMenu(false);
      fabBtn.focus(); // Return focus to button
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.pdf-fab-wrapper')) {
        this.toggleMenu(false);
      }
    });

    // Keyboard navigation
    fabBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleMenu(false);
      }
    });

    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleMenu(false);
        fabBtn.focus();
        return;
      }

      // Arrow key navigation within menu
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = menuItems.indexOf(document.activeElement);
        let nextIndex;

        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        }

        menuItems[nextIndex].focus();
      }

      // Home/End keys
      if (e.key === 'Home') {
        e.preventDefault();
        menuItems[0].focus();
      }
      if (e.key === 'End') {
        e.preventDefault();
        menuItems[menuItems.length - 1].focus();
      }
    });

    // Export current page
    exportCurrent.addEventListener('click', () => {
      this.toggleMenu(false);
      this.exportCurrentPage();
    });

    // Export all pages
    exportAll.addEventListener('click', () => {
      this.toggleMenu(false);
      this.exportAllPages();
    });

    // Export selected pages
    exportSelected.addEventListener('click', () => {
      this.toggleMenu(false);
      this.showPageSelector();
    });
  }

  toggleMenu(show) {
    const fabBtn = document.getElementById('pdf-fab-btn');
    const menu = document.getElementById('pdf-menu');
    const exportCurrent = document.getElementById('export-current');

    if (show) {
      menu.style.display = 'block';
      menu.setAttribute('aria-hidden', 'false');
      fabBtn.setAttribute('aria-expanded', 'true');
      // Focus first menu item
      setTimeout(() => exportCurrent.focus(), 100);
    } else {
      menu.style.display = 'none';
      menu.setAttribute('aria-hidden', 'true');
      fabBtn.setAttribute('aria-expanded', 'false');
    }
  }

  exportCurrentPage() {
    // Show instructions for better PDF output
    const instructions =
      '📄 PDF Export Instructions - IMPORTANT:\n\n' +
      '1. Destination: Select "Save as PDF"\n' +
      '2. Layout: Choose "Landscape" (NOT Portrait)\n' +
      '3. Margins: Set to "None" or "Minimum"\n' +
      '4. Scale: Set to "100%" or "Default" (NOT "Fit to page")\n' +
      '5. Options: Enable "Background graphics" to show charts\n' +
      '6. Paper size: A4 or Letter\n\n' +
      '⚠️ CRITICAL: Use Landscape + Minimum Margins for full width!\n\n' +
      'Click OK to open print dialog';

    if (!confirm(instructions)) {
      return;
    }

    // Add print-specific class for styling
    document.body.classList.add('printing');

    // Hide the PDF export button and other UI elements before printing
    const fabWrapper = document.querySelector('.pdf-fab-wrapper');
    const sidebar = document.querySelector('.sidebar');
    const hamburger = document.querySelector('.hamburger-menu');
    const container = document.querySelector('.container');
    const treeNav = document.querySelector('.tree-nav');

    if (fabWrapper) fabWrapper.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';
    if (hamburger) hamburger.style.display = 'none';
    if (treeNav) treeNav.style.display = 'none';

    // Inject temporary print styles
    const printStyleSheet = document.createElement('style');
    printStyleSheet.id = 'temp-print-styles';
    printStyleSheet.textContent = `
      @media print {
        html, body {
          width: 297mm !important;
          min-width: 297mm !important;
          max-width: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .container {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 1cm !important;
        }
        * {
          max-width: none !important;
        }
      }
    `;
    document.head.appendChild(printStyleSheet);

    // Force full width on body and container
    const originalBodyStyle = document.body.style.cssText;
    const originalContainerStyle = container ? container.style.cssText : '';

    document.body.style.cssText += 'width: 100% !important; max-width: none !important; padding: 0 !important; margin: 0 !important;';
    if (container) {
      container.style.cssText += 'width: 100% !important; max-width: none !important; margin: 0 !important; padding: 1cm !important;';
    }

    // Hide all buttons
    const buttons = document.querySelectorAll('button:not(.no-print)');
    buttons.forEach(btn => {
      if (!btn.classList.contains('no-print')) {
        btn.style.display = 'none';
      }
    });

    // Small delay to ensure styles are applied
    setTimeout(() => {
      // Use browser's native print dialog
      window.print();

      // Restore after print
      setTimeout(() => {
        document.body.classList.remove('printing');
        if (fabWrapper) fabWrapper.style.display = 'block';
        if (sidebar) sidebar.style.display = '';
        if (hamburger) hamburger.style.display = '';
        if (treeNav) treeNav.style.display = '';

        // Restore original styles
        document.body.style.cssText = originalBodyStyle;
        if (container) container.style.cssText = originalContainerStyle;

        // Remove temporary print stylesheet
        const tempStyle = document.getElementById('temp-print-styles');
        if (tempStyle) tempStyle.remove();

        // Restore buttons
        buttons.forEach(btn => {
          if (!btn.classList.contains('no-print')) {
            btn.style.display = '';
          }
        });
      }, 100);
    }, 200);
  }

  async exportAllPages() {
    const confirmed = confirm(
      `This will open ${this.pages.length} pages sequentially for printing.\n\n` +
      `Each page will open in a new tab with the print dialog.\n\n` +
      `Click OK to continue, or Cancel to choose specific pages.`
    );

    if (!confirmed) {
      this.showPageSelector();
      return;
    }

    this.showProgressModal('Preparing all pages for export...');

    // Sequential export with delay
    for (let i = 0; i < this.pages.length; i++) {
      const page = this.pages[i];
      this.updateProgressModal(`Opening ${page.name} (${i + 1}/${this.pages.length})...`);

      // Open page in new tab
      const printWindow = window.open(page.url, '_blank');

      // Wait for page to load before continuing
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    this.updateProgressModal('All pages opened! Use your browser to save/print each tab.');
    setTimeout(() => {
      this.hideProgressModal();
    }, 3000);
  }

  showPageSelector() {
    const modal = document.createElement('div');
    modal.id = 'page-selector-modal';
    modal.className = 'pdf-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'page-selector-title');

    let checkboxes = this.pages.map((page, index) => `
      <label class="pdf-checkbox-item">
        <input type="checkbox" value="${index}" checked id="page-${index}" aria-label="Select ${page.name}">
        <span>${page.name}</span>
      </label>
    `).join('');

    modal.innerHTML = `
      <div class="pdf-modal-content" role="document">
        <div class="pdf-modal-header">
          <h3 id="page-selector-title">Select Pages to Export</h3>
          <button class="pdf-modal-close" aria-label="Close dialog">&times;</button>
        </div>
        <div class="pdf-modal-body">
          <div class="pdf-checkbox-actions" role="group" aria-label="Selection actions">
            <button id="select-all-btn" class="pdf-text-btn" aria-label="Select all pages">Select All</button>
            <button id="deselect-all-btn" class="pdf-text-btn" aria-label="Deselect all pages">Deselect All</button>
          </div>
          <div class="pdf-checkbox-list" role="group" aria-label="Page selection">
            ${checkboxes}
          </div>
        </div>
        <div class="pdf-modal-footer">
          <button id="cancel-export-btn" class="pdf-btn pdf-btn-secondary">Cancel</button>
          <button id="confirm-export-btn" class="pdf-btn pdf-btn-primary">Export Selected</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Trap focus within modal
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Store previously focused element
    const previouslyFocused = document.activeElement;

    // Focus first element
    setTimeout(() => firstFocusable.focus(), 100);

    // Keyboard navigation
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        previouslyFocused.focus();
        return;
      }

      // Tab trap
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    });

    // Event listeners
    const closeModal = () => {
      modal.remove();
      previouslyFocused.focus();
    };

    modal.querySelector('.pdf-modal-close').addEventListener('click', closeModal);
    modal.querySelector('#cancel-export-btn').addEventListener('click', closeModal);

    modal.querySelector('#select-all-btn').addEventListener('click', () => {
      modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
      // Announce to screen readers
      this.announceToScreenReader('All pages selected');
    });

    modal.querySelector('#deselect-all-btn').addEventListener('click', () => {
      modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      // Announce to screen readers
      this.announceToScreenReader('All pages deselected');
    });

    modal.querySelector('#confirm-export-btn').addEventListener('click', () => {
      const selected = Array.from(modal.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => parseInt(cb.value));

      modal.remove();
      previouslyFocused.focus();
      this.exportSelectedPages(selected);
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Screen reader announcement helper
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  async exportSelectedPages(selectedIndices) {
    const selectedPages = selectedIndices.map(i => this.pages[i]);

    if (selectedPages.length === 0) {
      alert('No pages selected!');
      return;
    }

    this.showProgressModal(`Preparing ${selectedPages.length} page(s) for export...`);

    for (let i = 0; i < selectedPages.length; i++) {
      const page = selectedPages[i];
      this.updateProgressModal(`Opening ${page.name} (${i + 1}/${selectedPages.length})...`);

      window.open(page.url, '_blank');
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    this.updateProgressModal('All selected pages opened!');
    setTimeout(() => {
      this.hideProgressModal();
    }, 2000);
  }

  showProgressModal(message) {
    let modal = document.getElementById('pdf-progress-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pdf-progress-modal';
      modal.className = 'pdf-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-busy', 'true');
      modal.setAttribute('aria-labelledby', 'pdf-progress-message');
      modal.innerHTML = `
        <div class="pdf-modal-content pdf-progress-content" role="document">
          <div class="pdf-spinner" role="status" aria-label="Loading"></div>
          <p id="pdf-progress-message" role="status" aria-live="polite">${message}</p>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      document.getElementById('pdf-progress-message').textContent = message;
    }
  }

  updateProgressModal(message) {
    const messageEl = document.getElementById('pdf-progress-message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  hideProgressModal() {
    const modal = document.getElementById('pdf-progress-modal');
    if (modal) {
      modal.remove();
    }
  }
}

// Initialize PDF Exporter when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PDFExporter();
  });
} else {
  new PDFExporter();
}
