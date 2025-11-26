/**
 * ViewManager - Manages view state and switching
 */
class ViewManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.currentView = 'TOP'; // TOP, FRONT, LEFT, RIGHT
        this.setupEventListeners();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // View button clicks
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                this.setView(view);
            });
        });

        // Hotkey switching
        document.addEventListener('keydown', (e) => {
            // Only trigger if not in an input field
            if (document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }

            switch(e.key) {
                case '1':
                    this.setView('TOP');
                    break;
                case '2':
                    this.setView('FRONT');
                    break;
                case '3':
                    this.setView('LEFT');
                    break;
                case '4':
                    this.setView('RIGHT');
                    break;
            }
        });
    }

    /**
     * Set the current view
     * @param {string} view - View name (TOP, FRONT, LEFT, RIGHT)
     */
    setView(view) {
        if (!['TOP', 'FRONT', 'LEFT', 'RIGHT'].includes(view)) {
            console.error('Invalid view:', view);
            return;
        }

        this.currentView = view;
        this.updateViewButtons();
        this.eventBus.emit('view:changed', { view: this.currentView });
    }

    /**
     * Get the current view
     * @returns {string} Current view name
     */
    getCurrentView() {
        return this.currentView;
    }

    /**
     * Update view button states
     */
    updateViewButtons() {
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            const btnView = btn.getAttribute('data-view');
            if (btnView === this.currentView) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update view name indicator
        this.updateViewIndicator();
    }

    /**
     * Update view name indicator in footer
     */
    updateViewIndicator() {
        const indicator = document.getElementById('viewIndicator');
        if (!indicator) return;

        const viewNames = {
            'TOP': 'Top View',
            'FRONT': 'Front View',
            'LEFT': 'Left View',
            'RIGHT': 'Right View'
        };

        indicator.textContent = viewNames[this.currentView] || this.currentView;
    }
}
