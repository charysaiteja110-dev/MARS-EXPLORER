/**
 * ============================================================================
 * MARS EXPLORER PRO — User Interface & Mission Control HUD
 * Module: controls.js
 * ============================================================================
 */

(function (window) {
  'use strict';

  const UIControls = {
    dom: {},

    /**
     * Cache all DOM elements
     */
    cacheElements: function () {
      this.dom = {
        // Loading Overlay
        loadingOverlay: document.getElementById('loading-overlay'),
        loadingProgressFill: document.getElementById('loading-progress-fill'),
        loadingSubtitle: document.getElementById('loading-subtitle'),
        loadingTelemetryLog: document.getElementById('loading-telemetry-log'),
        loadingErrorBox: document.getElementById('loading-error-box'),
        loadingErrorMsg: document.getElementById('loading-error-msg'),
        retryInitBtn: document.getElementById('retry-init-btn'),

        // Top Navigation
        liveDot: document.getElementById('live-dot'),
        liveStatusText: document.getElementById('live-status-text'),
        activeLayerBadge: document.getElementById('active-layer-badge'),
        activeSourceBadge: document.getElementById('active-source-badge'),
        msdClock: document.getElementById('msd-clock'),
        mtcClock: document.getElementById('mtc-clock'),
        landmarkSelect: document.getElementById('landmark-select'),
        toggleMarkersBtn: document.getElementById('toggle-markers-btn'),
        toggleMeasureBtn: document.getElementById('toggle-measure-btn'),
        toggleLayersBtn: document.getElementById('toggle-layers-btn'),
        openSettingsBtn: document.getElementById('open-settings-btn'),
        topFullscreenBtn: document.getElementById('top-fullscreen-btn'),

        // Map HUD Controls
        btnZoomIn: document.getElementById('btn-zoom-in'),
        btnZoomOut: document.getElementById('btn-zoom-out'),
        btnResetView: document.getElementById('btn-reset-view'),
        btnFullscreen: document.getElementById('btn-fullscreen'),
        zoomLevelBadge: document.getElementById('zoom-level-badge'),
        compassBox: document.getElementById('compass-box'),

        // Layer Switcher Panel
        layerSwitcherPanel: document.getElementById('layer-switcher-panel'),
        layerSwitcherCloseBtn: document.getElementById('layer-switcher-close-btn'),
        layerCardsContainer: document.getElementById('layer-cards-container'),
        opacitySlider: document.getElementById('opacity-slider'),
        opacityValueDisplay: document.getElementById('opacity-value-display'),
        opacityPresetButtons: document.querySelectorAll('.opacity-preset-btn'),

        // Telemetry Information Panel
        telemetryPanel: document.getElementById('telemetry-panel'),
        telemetryHeader: document.getElementById('telemetry-header'),
        telemetryLayerVal: document.getElementById('telemetry-layer-val'),
        telemetrySourceVal: document.getElementById('telemetry-source-val'),
        cursorCoords: document.getElementById('cursor-coords'),
        centerCoords: document.getElementById('center-coords'),
        zoomReadout: document.getElementById('zoom-readout'),
        tileStatusBadge: document.getElementById('tile-status-badge'),
        retryTileLink: document.getElementById('retry-tile-link'),

        // Landmark Drawer
        landmarkDrawer: document.getElementById('landmark-drawer'),
        drawerCloseBtn: document.getElementById('drawer-close-btn'),
        drawerCategory: document.getElementById('drawer-category'),
        drawerTitle: document.getElementById('drawer-title'),
        drawerStatsGrid: document.getElementById('drawer-stats-grid'),
        drawerSummary: document.getElementById('drawer-summary'),
        drawerMission: document.getElementById('drawer-mission'),
        drawerFlyBtn: document.getElementById('drawer-fly-btn'),
        drawerCopyBtn: document.getElementById('drawer-copy-btn'),

        // Measure HUD
        measureHud: document.getElementById('measure-hud'),
        measureDistanceVal: document.getElementById('measure-distance-val'),
        measurePointsHint: document.getElementById('measure-points-hint'),
        measureClearBtn: document.getElementById('measure-clear-btn'),
        measureCloseBtn: document.getElementById('measure-close-btn'),

        // Settings Modal
        settingsModal: document.getElementById('settings-modal'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        settingToggleMarkers: document.getElementById('setting-toggle-markers'),
        settingToggleGraticule: document.getElementById('setting-toggle-graticule')
      };
    },

    /**
     * Initialize UI Controls
     */
    init: function () {
      this.cacheElements();
      this.renderLayerCards();
      this.bindEvents();
      this.startSolClocks();
    },

    /**
     * Render the selectable planetary layer cards
     */
    renderLayerCards: function () {
      const container = this.dom.layerCardsContainer;
      if (!container || !window.MarsLayers) return;

      container.innerHTML = '';
      const defs = window.MarsLayers.definitions;
      const activeId = window.MarsLayers.activeLayerId;

      Object.values(defs).forEach((layer) => {
        const card = document.createElement('div');
        card.className = `layer-card ${layer.id === activeId ? 'active' : ''}`;
        card.setAttribute('data-layer-id', layer.id);

        card.innerHTML = `
          <div class="layer-card-header">
            <span class="layer-card-title">${layer.name}</span>
            <span class="layer-card-badge">${layer.badge}</span>
          </div>
          <div class="layer-card-desc">${layer.description}</div>
          <div class="layer-card-meta">
            <span><strong>Res:</strong> ${layer.resolution}</span>
            <span><strong>Source:</strong> ${layer.dataset}</span>
          </div>
        `;

        card.addEventListener('click', () => {
          this.selectLayer(layer.id);
        });

        container.appendChild(card);
      });
    },

    /**
     * Select a base layer
     */
    selectLayer: function (layerId) {
      if (!window.MarsLayers) return;
      const success = window.MarsLayers.setBaseLayer(layerId);
      if (!success) return;

      const def = window.MarsLayers.getActiveDefinition();

      // Update Active Card UI
      const cards = this.dom.layerCardsContainer.querySelectorAll('.layer-card');
      cards.forEach((c) => {
        c.classList.toggle('active', c.getAttribute('data-layer-id') === layerId);
      });

      // Update Navigation & Telemetry Badges
      if (this.dom.activeLayerBadge) {
        this.dom.activeLayerBadge.textContent = def.name.toUpperCase();
      }
      if (this.dom.activeSourceBadge) {
        this.dom.activeSourceBadge.textContent = def.badge;
      }
      if (this.dom.telemetryLayerVal) {
        this.dom.telemetryLayerVal.textContent = def.name;
      }
      if (this.dom.telemetrySourceVal) {
        this.dom.telemetrySourceVal.textContent = def.dataset;
      }

      // If satellite imagery is active, highlight opacity control
      const isSatellite = (layerId === 'satellite-imagery');
      const opacitySection = document.getElementById('opacity-control-section');
      if (opacitySection) {
        opacitySection.style.display = 'block';
      }
    },

    /**
     * Bind all DOM UI event listeners
     */
    bindEvents: function () {
      // Zoom Controls
      if (this.dom.btnZoomIn) {
        this.dom.btnZoomIn.addEventListener('click', () => {
          if (window.MarsMapEngine.map) window.MarsMapEngine.map.zoomIn();
        });
      }
      if (this.dom.btnZoomOut) {
        this.dom.btnZoomOut.addEventListener('click', () => {
          if (window.MarsMapEngine.map) window.MarsMapEngine.map.zoomOut();
        });
      }

      // Global Reset View Button
      if (this.dom.btnResetView) {
        this.dom.btnResetView.addEventListener('click', () => {
          window.MarsMapEngine.resetGlobalView(true);
        });
      }

      // Compass Button
      if (this.dom.compassBox) {
        this.dom.compassBox.addEventListener('click', () => {
          window.MarsMapEngine.resetGlobalView(true);
        });
      }

      // Fullscreen Toggles
      const toggleFs = () => this.toggleFullscreen();
      if (this.dom.btnFullscreen) this.dom.btnFullscreen.addEventListener('click', toggleFs);
      if (this.dom.topFullscreenBtn) this.dom.topFullscreenBtn.addEventListener('click', toggleFs);

      // Layer Switcher Toggle
      if (this.dom.toggleLayersBtn) {
        this.dom.toggleLayersBtn.addEventListener('click', () => {
          this.toggleLayerSwitcher();
        });
      }
      if (this.dom.layerSwitcherCloseBtn) {
        this.dom.layerSwitcherCloseBtn.addEventListener('click', () => {
          this.toggleLayerSwitcher(false);
        });
      }

      // Opacity Slider Input
      if (this.dom.opacitySlider) {
        this.dom.opacitySlider.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          this.setOpacity(val);
        });
      }

      // Opacity Preset Buttons (0%, 25%, 50%, 75%, 100%)
      if (this.dom.opacityPresetButtons) {
        this.dom.opacityPresetButtons.forEach((btn) => {
          btn.addEventListener('click', () => {
            const val = parseFloat(btn.getAttribute('data-opacity'));
            this.setOpacity(val);
            if (this.dom.opacitySlider) {
              this.dom.opacitySlider.value = val;
            }
          });
        });
      }

      // Landmark Dropdown
      if (this.dom.landmarkSelect) {
        this.dom.landmarkSelect.addEventListener('change', (e) => {
          const id = e.target.value;
          const target = window.MarsLocations.getById(id);
          if (target) {
            window.MarsLocations.flyTo(target);
          }
        });
      }

      // Toggle Markers Button
      if (this.dom.toggleMarkersBtn) {
        this.dom.toggleMarkersBtn.addEventListener('click', () => {
          const isVisible = window.MarsLocations.toggle();
          this.dom.toggleMarkersBtn.classList.toggle('active', isVisible);
          if (this.dom.settingToggleMarkers) {
            this.dom.settingToggleMarkers.checked = isVisible;
          }
        });
      }

      // Toggle Measure Tool
      if (this.dom.toggleMeasureBtn) {
        this.dom.toggleMeasureBtn.addEventListener('click', () => {
          if (window.MarsApp && window.MarsApp.toggleMeasure) {
            window.MarsApp.toggleMeasure();
          }
        });
      }
      if (this.dom.measureCloseBtn) {
        this.dom.measureCloseBtn.addEventListener('click', () => {
          if (window.MarsApp && window.MarsApp.toggleMeasure) {
            window.MarsApp.toggleMeasure();
          }
        });
      }
      if (this.dom.measureClearBtn) {
        this.dom.measureClearBtn.addEventListener('click', () => {
          if (window.MarsApp && window.MarsApp.clearMeasure) {
            window.MarsApp.clearMeasure();
          }
        });
      }

      // Telemetry Header Collapse
      if (this.dom.telemetryHeader) {
        this.dom.telemetryHeader.addEventListener('click', () => {
          this.dom.telemetryPanel.classList.toggle('collapsed');
        });
      }

      // Refresh Tile Link & Initialization Retry Button
      if (this.dom.retryTileLink) {
        this.dom.retryTileLink.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.MarsLayers) {
            window.MarsLayers.setBaseLayer(window.MarsLayers.activeLayerId);
          }
        });
      }
      if (this.dom.retryInitBtn) {
        this.dom.retryInitBtn.addEventListener('click', () => {
          if (window.MarsLayers) {
            window.MarsLayers.setBaseLayer(window.MarsLayers.activeLayerId);
          }
        });
      }

      // Landmark Drawer Close & Actions
      if (this.dom.drawerCloseBtn) {
        this.dom.drawerCloseBtn.addEventListener('click', () => {
          this.closeLandmarkDrawer();
        });
      }
      if (this.dom.drawerFlyBtn) {
        this.dom.drawerFlyBtn.addEventListener('click', () => {
          if (this.currentLandmark) {
            window.MarsLocations.flyTo(this.currentLandmark);
          }
        });
      }
      if (this.dom.drawerCopyBtn) {
        this.dom.drawerCopyBtn.addEventListener('click', () => {
          if (this.currentLandmark) {
            const coordsStr = window.MarsMapEngine.formatCoords(this.currentLandmark.lat, this.currentLandmark.lng);
            const text = `${this.currentLandmark.name}: ${coordsStr}`;
            const handleSuccess = () => {
              const orig = this.dom.drawerCopyBtn.textContent;
              this.dom.drawerCopyBtn.textContent = 'COPIED!';
              setTimeout(() => {
                this.dom.drawerCopyBtn.textContent = orig;
              }, 1800);
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(text).then(handleSuccess).catch(() => prompt('Martian Landmark Coordinates:', text));
            } else {
              prompt('Martian Landmark Coordinates:', text);
            }
          }
        });
      }

      // Settings Modal
      if (this.dom.openSettingsBtn) {
        this.dom.openSettingsBtn.addEventListener('click', () => {
          this.dom.settingsModal.classList.add('open');
        });
      }
      if (this.dom.modalCloseBtn) {
        this.dom.modalCloseBtn.addEventListener('click', () => {
          this.dom.settingsModal.classList.remove('open');
        });
      }
      if (this.dom.settingsModal) {
        this.dom.settingsModal.addEventListener('click', (e) => {
          if (e.target === this.dom.settingsModal) {
            this.dom.settingsModal.classList.remove('open');
          }
        });
      }
      if (this.dom.settingToggleMarkers) {
        this.dom.settingToggleMarkers.addEventListener('change', (e) => {
          window.MarsLocations.setVisible(e.target.checked);
          if (this.dom.toggleMarkersBtn) {
            this.dom.toggleMarkersBtn.classList.toggle('active', e.target.checked);
          }
        });
      }
      if (this.dom.settingToggleGraticule) {
        this.dom.settingToggleGraticule.addEventListener('change', (e) => {
          if (window.MarsApp && window.MarsApp.toggleGraticule) {
            window.MarsApp.toggleGraticule(e.target.checked);
          }
        });
      }

      // Keyboard Shortcuts
      document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    },

    /**
     * Set Opacity and update slider & presets
     */
    setOpacity: function (val) {
      if (window.MarsLayers) {
        window.MarsLayers.setSatelliteOpacity(val);
      }
      const pct = Math.round(val * 100);
      if (this.dom.opacityValueDisplay) {
        this.dom.opacityValueDisplay.textContent = `${pct}%`;
      }
      if (this.dom.opacitySlider) {
        this.dom.opacitySlider.value = val;
      }
      if (this.dom.opacityPresetButtons) {
        this.dom.opacityPresetButtons.forEach((btn) => {
          const btnVal = parseFloat(btn.getAttribute('data-opacity'));
          btn.classList.toggle('active', Math.abs(btnVal - val) < 0.05);
        });
      }
    },

    /**
     * Toggle Layer Switcher Panel
     */
    toggleLayerSwitcher: function (forceState) {
      const panel = this.dom.layerSwitcherPanel;
      if (!panel) return;
      const isOpen = (typeof forceState === 'boolean') ? forceState : !panel.classList.contains('open');
      panel.classList.toggle('open', isOpen);
      if (this.dom.toggleLayersBtn) {
        this.dom.toggleLayersBtn.classList.toggle('active', isOpen);
      }
    },

    /**
     * Fullscreen Toggle
     */
    toggleFullscreen: function () {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('Fullscreen request failed:', err);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    },

    /**
     * Populate Landmark Select Dropdown
     */
    populateLandmarkDropdown: function (locations) {
      const select = this.dom.landmarkSelect;
      if (!select) return;

      select.innerHTML = '<option value="" disabled selected>EXPLORE LANDMARK...</option>';
      locations.forEach((lm) => {
        const opt = document.createElement('option');
        opt.value = lm.id;
        opt.textContent = `${lm.name} (${lm.category})`;
        select.appendChild(opt);
      });
    },

    /**
     * Open Landmark Telemetry Drawer
     */
    openLandmarkDrawer: function (landmark) {
      this.currentLandmark = landmark;
      const d = this.dom;

      if (d.drawerCategory) d.drawerCategory.textContent = landmark.category;
      if (d.drawerTitle) d.drawerTitle.textContent = landmark.name;

      if (d.drawerStatsGrid) {
        d.drawerStatsGrid.innerHTML = '';
        for (const [key, val] of Object.entries(landmark.stats)) {
          const formattedKey = key.replace(/([A-Z])/g, ' $1').toUpperCase();
          const card = document.createElement('div');
          card.className = 'stat-card';
          card.innerHTML = `
            <div class="stat-label">${formattedKey}</div>
            <div class="stat-val">${val}</div>
          `;
          d.drawerStatsGrid.appendChild(card);
        }
      }

      if (d.drawerSummary) d.drawerSummary.textContent = landmark.summary;
      if (d.drawerMission) d.drawerMission.textContent = `${landmark.mission} (Quad: ${landmark.quadrangle || 'Mars'})`;

      if (d.landmarkSelect) d.landmarkSelect.value = landmark.id;
      if (d.landmarkDrawer) d.landmarkDrawer.classList.add('open');
    },

    closeLandmarkDrawer: function () {
      this.currentLandmark = null;
      if (this.dom.landmarkDrawer) this.dom.landmarkDrawer.classList.remove('open');
      if (this.dom.landmarkSelect) this.dom.landmarkSelect.value = '';
    },

    /**
     * Update Telemetry Panel Status
     */
    setTileStatus: function (status, text) {
      if (this.dom.tileStatusBadge) {
        this.dom.tileStatusBadge.className = `status-badge ${status}`;
        this.dom.tileStatusBadge.textContent = text;
      }
      if (this.dom.liveDot) {
        this.dom.liveDot.className = `pulse-dot ${status === 'error' ? 'error' : status === 'loading' ? 'warning' : ''}`;
      }
      if (this.dom.liveStatusText) {
        this.dom.liveStatusText.textContent = (status === 'error') ? 'NETWORK DEGRADED' : (status === 'loading') ? 'BUFFERING' : 'LIVE TILE FEED';
      }
    },

    /**
     * Update Loading Screen
     */
    updateLoadingProgress: function (percentage, subtitle, stepLog) {
      if (this.dom.loadingProgressFill) {
        this.dom.loadingProgressFill.style.width = `${percentage}%`;
      }
      if (this.dom.loadingSubtitle && subtitle) {
        this.dom.loadingSubtitle.textContent = subtitle;
      }
      if (this.dom.loadingTelemetryLog && stepLog) {
        this.dom.loadingTelemetryLog.innerHTML += `<div>&gt; ${stepLog}</div>`;
      }
    },

    finishLoading: function () {
      this.updateLoadingProgress(100, 'SYSTEM READY — EXPLORATION INITIALIZED', 'Planetary surface rendered. Dismissing initialization HUD.');
      setTimeout(() => {
        if (this.dom.loadingOverlay) {
          this.dom.loadingOverlay.classList.add('hidden');
        }
      }, 600);
    },

    /**
     * Mars Solar Date & Coordinated Mars Time
     */
    startSolClocks: function () {
      const updateClocks = () => {
        const now = Date.now();
        const jdUtc = now / 86400000 + 2440587.5;
        const jdTT = jdUtc + 69.184 / 86400;
        const deltaJ2000 = jdTT - 2451545.0;

        const msd = (deltaJ2000 - 4.5) / 1.027491252 + 44796.0 - 0.00096;
        const mtcTotalHours = (msd * 24) % 24;
        const hours = Math.floor(mtcTotalHours);
        const minutes = Math.floor((mtcTotalHours - hours) * 60);
        const seconds = Math.floor(((mtcTotalHours - hours) * 60 - minutes) * 60);

        const pad = n => String(n).padStart(2, '0');

        if (this.dom.msdClock) this.dom.msdClock.textContent = `MSD ${msd.toFixed(1)}`;
        if (this.dom.mtcClock) this.dom.mtcClock.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)} MTC`;
      };

      updateClocks();
      setInterval(updateClocks, 1000);
    },

    /**
     * Keyboard navigation handler
     */
    handleKeyboardShortcuts: function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      switch (e.key.toLowerCase()) {
        case '+':
        case '=':
          if (window.MarsMapEngine.map) window.MarsMapEngine.map.zoomIn();
          break;
        case '-':
        case '_':
          if (window.MarsMapEngine.map) window.MarsMapEngine.map.zoomOut();
          break;
        case 'h':
        case 'r':
          window.MarsMapEngine.resetGlobalView(true);
          break;
        case 'f':
          this.toggleFullscreen();
          break;
        case 'l':
          this.toggleLayerSwitcher();
          break;
        case 'm':
          if (this.dom.toggleMarkersBtn) this.dom.toggleMarkersBtn.click();
          break;
        case 'd':
          if (this.dom.toggleMeasureBtn) this.dom.toggleMeasureBtn.click();
          break;
        case 'escape':
          this.closeLandmarkDrawer();
          this.toggleLayerSwitcher(false);
          if (this.dom.settingsModal) this.dom.settingsModal.classList.remove('open');
          break;
      }
    }
  };

  // Expose to window
  window.MarsUIControls = UIControls;

})(window);

