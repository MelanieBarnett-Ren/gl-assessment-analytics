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
    container.innerHTML = `
      <div class="pdf-fab-wrapper">
        <button id="pdf-fab-btn" class="pdf-fab" title="Export to PDF">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span class="pdf-fab-text">PDF</span>
        </button>
        <div id="pdf-menu" class="pdf-menu" style="display: none;">
          <div class="pdf-menu-header">
            <h4>Export to PDF</h4>
            <button id="pdf-menu-close" class="pdf-menu-close">&times;</button>
          </div>
          <div class="pdf-menu-content">
            <button id="export-current" class="pdf-menu-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <div>
                <div class="pdf-menu-item-title">Current Page</div>
                <div class="pdf-menu-item-desc">Export this page only</div>
              </div>
            </button>
            <button id="export-all" class="pdf-menu-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              </svg>
              <div>
                <div class="pdf-menu-item-title">All Pages</div>
                <div class="pdf-menu-item-desc">Export all dashboard pages</div>
              </div>
            </button>
            <button id="export-selected" class="pdf-menu-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

    // Toggle menu
    fabBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = menu.style.display === 'block';
      menu.style.display = isVisible ? 'none' : 'block';
    });

    // Close menu
    closeBtn.addEventListener('click', () => {
      menu.style.display = 'none';
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.pdf-fab-wrapper')) {
        menu.style.display = 'none';
      }
    });

    // Export current page
    exportCurrent.addEventListener('click', () => {
      menu.style.display = 'none';
      this.exportCurrentPage();
    });

    // Export all pages
    exportAll.addEventListener('click', () => {
      menu.style.display = 'none';
      this.exportAllPages();
    });

    // Export selected pages
    exportSelected.addEventListener('click', () => {
      menu.style.display = 'none';
      this.showPageSelector();
    });
  }

  exportCurrentPage() {
    // Add print-specific class for styling
    document.body.classList.add('printing');

    // Hide the PDF export button before printing
    const fabWrapper = document.querySelector('.pdf-fab-wrapper');
    if (fabWrapper) fabWrapper.style.display = 'none';

    // Use browser's native print dialog
    window.print();

    // Restore after print
    setTimeout(() => {
      document.body.classList.remove('printing');
      if (fabWrapper) fabWrapper.style.display = 'block';
    }, 100);
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

    let checkboxes = this.pages.map((page, index) => `
      <label class="pdf-checkbox-item">
        <input type="checkbox" value="${index}" checked>
        <span>${page.name}</span>
      </label>
    `).join('');

    modal.innerHTML = `
      <div class="pdf-modal-content">
        <div class="pdf-modal-header">
          <h3>Select Pages to Export</h3>
          <button class="pdf-modal-close">&times;</button>
        </div>
        <div class="pdf-modal-body">
          <div class="pdf-checkbox-actions">
            <button id="select-all-btn" class="pdf-text-btn">Select All</button>
            <button id="deselect-all-btn" class="pdf-text-btn">Deselect All</button>
          </div>
          <div class="pdf-checkbox-list">
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

    // Event listeners
    modal.querySelector('.pdf-modal-close').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('#cancel-export-btn').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('#select-all-btn').addEventListener('click', () => {
      modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
    });

    modal.querySelector('#deselect-all-btn').addEventListener('click', () => {
      modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    });

    modal.querySelector('#confirm-export-btn').addEventListener('click', () => {
      const selected = Array.from(modal.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => parseInt(cb.value));

      modal.remove();
      this.exportSelectedPages(selected);
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
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
      modal.innerHTML = `
        <div class="pdf-modal-content pdf-progress-content">
          <div class="pdf-spinner"></div>
          <p id="pdf-progress-message">${message}</p>
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
