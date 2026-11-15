/**
 * ============================================================================
 * MARS EXPLORER COMMAND CENTER — User Interface & Scientific Control Engine
 * Module: controls.js
 * ============================================================================
 */

(function (window) {
  'use strict';

  const UIControls = {
    dom: {},
    currentLandmark: null,
    activeNavSection: 'overview',
    selectedMatrixTerrain: null,
    selectedMatrixSlope: null,

    /**
     * Cache all DOM elements
     */
    cacheElements: function () {
      this.dom = {
        // Master Sidebar & Navigation
        sidebar: document.getElementById('command-sidebar'),
        sidebarToggleBtn: document.getElementById('sidebar-toggle-btn'),
        navItems: document.querySelectorAll('.nav-item'),

        // Top Navigation Bar
        msdClock: document.getElementById('msd-clock'),
        mtcClock: document.getElementById('mtc-clock'),
        liveDot: document.getElementById('live-dot'),
        liveStatusText: document.getElementById('live-status-text'),
        landmarkSelect: document.getElementById('landmark-select'),
        toggleMeasureBtn: document.getElementById('toggle-measure-btn'),
        btnResetViewTop: document.getElementById('btn-reset-view-top'),
        topFullscreenBtn: document.getElementById('top-fullscreen-btn'),

        // Map HUD Controls
        btnZoomIn: document.getElementById('btn-zoom-in'),
        btnZoomOut: document.getElementById('btn-zoom-out'),
        btnResetView: document.getElementById('btn-reset-view'),
        btnFullscreen: document.getElementById('btn-fullscreen'),
        zoomLevelBadge: document.getElementById('zoom-level-badge'),
        compassBox: document.getElementById('compass-box'),

        // Map Layer Flyout Drawer
        mapLayerDrawer: document.getElementById('map-layer-drawer'),
        closeLayerDrawerBtn: document.getElementById('close-layer-drawer-btn'),
        layerCardsContainer: document.getElementById('layer-cards-container'),
        opacitySlider: document.getElementById('opacity-slider'),
        opacityValueDisplay: document.getElementById('opacity-value-display'),
        opacityPresetButtons: document.querySelectorAll('.opacity-preset-btn'),

        // Contextual Landmark Drawer
        landmarkDrawer: document.getElementById('landmark-drawer'),
        drawerCloseBtn: document.getElementById('drawer-close-btn'),
        drawerCategory: document.getElementById('drawer-category'),
        drawerTitle: document.getElementById('drawer-title'),
        drawerStatsGrid: document.getElementById('drawer-stats-grid'),
        drawerSummary: document.getElementById('drawer-summary'),
        drawerMission: document.getElementById('drawer-mission'),
        drawerFlyBtn: document.getElementById('drawer-fly-btn'),
        drawerCopyBtn: document.getElementById('drawer-copy-btn'),

        // Geodesic Measure HUD
        measureHud: document.getElementById('measure-hud'),
        measureStatusBadge: document.getElementById('measure-status-badge'),
        measureDistanceVal: document.getElementById('measure-distance-val'),
        measureSegmentVal: document.getElementById('measure-segment-val'),
        measureCountVal: document.getElementById('measure-count-val'),
        measurePointsHint: document.getElementById('measure-points-hint'),
        measureUndoBtn: document.getElementById('measure-undo-btn'),
        measureClearBtn: document.getElementById('measure-clear-btn'),
        measureFinishBtn: document.getElementById('measure-finish-btn'),
        measureCloseBtn: document.getElementById('measure-close-btn'),

        // Master Modal Container for Research Sections
        modalContainer: document.getElementById('command-modal-container'),
        modalBox: document.querySelector('.command-modal-box'),
        modalCloseBtn: document.getElementById('modal-close-icon-btn'),
        modalTag: document.getElementById('modal-subtitle-tag'),
        modalTitle: document.getElementById('modal-main-title'),
        modalContent: document.getElementById('modal-dynamic-content'),

        // Status Bar Telemetry
        cursorCoords: document.getElementById('cursor-coords'),
        centerCoords: document.getElementById('center-coords'),
        zoomReadout: document.getElementById('zoom-readout'),
        telemetryLayerVal: document.getElementById('telemetry-layer-val'),
        dynamicLegendBar: document.getElementById('dynamic-legend-bar'),
        tileStatusBadge: document.getElementById('tile-status-badge'),
        retryTileLink: document.getElementById('retry-tile-link'),

        // On-Map NASA Classification HUD
        mapClassificationHud: document.getElementById('map-classification-hud'),
        classHudMinimizeBtn: document.getElementById('class-hud-minimize-btn'),
        classHudTabs: document.querySelectorAll('.class-hud-tab'),
        classQuickList: document.getElementById('class-quick-list'),
        classQuickDetail: document.getElementById('class-quick-detail'),
        btnFocusStudyHud: document.getElementById('btn-focus-study-hud'),
        btnTogglePolygonsHud: document.getElementById('btn-toggle-polygons-hud'),
        btnToggleLabelsHud: document.getElementById('btn-toggle-labels-hud'),

        // Map Buffering Overlay
        mapBufferingOverlay: document.getElementById('map-buffering-overlay'),
        bufferingSubtitle: document.getElementById('buffering-subtitle'),

        // Loading Overlay
        loadingOverlay: document.getElementById('loading-overlay'),
        loadingProgressFill: document.getElementById('loading-progress-fill'),
        loadingSubtitle: document.getElementById('loading-subtitle'),
        loadingTelemetryLog: document.getElementById('loading-telemetry-log'),
        loadingErrorBox: document.getElementById('loading-error-box'),
        loadingErrorMsg: document.getElementById('loading-error-msg'),
        retryInitBtn: document.getElementById('retry-init-btn')
      };
    },

    /**
     * Initialize UI Controls
     */
    init: function () {
      this.cacheElements();
      this.renderLayerCards();
      this.renderClassificationHudTerrains();
      this.bindClassificationHudEvents();
      this.bindEvents();
      this.startSolClocks();
      this.updateDynamicLegend();
    },

    /**
     * Render the 7 NASA Figure 6.2 Terrains in the On-Map HUD
     */
    renderClassificationHudTerrains: function () {
      const container = this.dom.classQuickList;
      if (!container || !window.SpiritMissionData) return;

      const cats = window.SpiritMissionData.terrainClassificationCategories;
      container.innerHTML = '';

      cats.forEach((cat, idx) => {
        const item = document.createElement('div');
        item.className = `class-quick-item ${idx === 0 ? 'active' : ''}`;
        item.setAttribute('data-cat-id', cat.id);

        let riskBadgeClass = 'risk-pill green';
        if (cat.mobilityRisk === 'Red') riskBadgeClass = 'risk-pill red';
        else if (cat.mobilityRisk === 'Yellow') riskBadgeClass = 'risk-pill yellow';

        item.innerHTML = `
          <div class="class-quick-color" style="background-color:${cat.color};"></div>
          <div class="class-quick-info">
            <span class="class-quick-name">${cat.name}</span>
            <span class="${riskBadgeClass}">${cat.riskRating}</span>
          </div>
        `;

        const showDetail = () => {
          container.querySelectorAll('.class-quick-item').forEach(el => el.classList.remove('active'));
          item.classList.add('active');
          if (this.dom.classQuickDetail) {
            this.dom.classQuickDetail.innerHTML = `
              <div class="detail-active-title">
                <span style="color:${cat.color};">${cat.name}</span>
                <span style="font-size:8px;padding:1px 4px;border-radius:2px;background:rgba(255,255,255,0.06);">${cat.slopeHazards}</span>
              </div>
              <div style="font-size:9px;color:var(--text-secondary);line-height:1.4;">${cat.description}</div>
              <div style="margin-top:4px;border-top:1px dashed var(--border-subtle);padding-top:4px;font-size:8.5px;color:var(--terrain-highlight);">
                <strong>Mission Context:</strong> ${cat.spiritExperience}
              </div>
            `;
          }
        };

        item.addEventListener('mouseenter', showDetail);
        item.addEventListener('click', showDetail);

        container.appendChild(item);

        if (idx === 0) {
          showDetail();
        }
      });
    },

    /**
     * Bind On-Map Classification HUD Events
     */
    bindClassificationHudEvents: function () {
      // Toggle minimize / collapse
      if (this.dom.classHudMinimizeBtn && this.dom.mapClassificationHud) {
        this.dom.classHudMinimizeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.dom.mapClassificationHud.classList.toggle('collapsed');
        });
      }

      // Tab switcher
      if (this.dom.classHudTabs) {
        this.dom.classHudTabs.forEach((tab) => {
          tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-class-tab');
            this.dom.classHudTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const panes = {
              'fig62': document.getElementById('pane-fig62'),
              'mobility-risk': document.getElementById('pane-mobility-risk'),
              'slope-scale': document.getElementById('pane-slope-scale')
            };

            Object.entries(panes).forEach(([k, pane]) => {
              if (pane) pane.classList.toggle('active', k === targetTab);
            });
          });
        });
      }

      // Action: Focus Gusev / Home Plate Study Area
      if (this.dom.btnFocusStudyHud) {
        this.dom.btnFocusStudyHud.addEventListener('click', () => {
          if (window.MarsMapEngine && window.MarsMapEngine.map) {
            window.MarsMapEngine.map.flyTo([-14.606, 175.525], 9, {
              duration: 1.8,
              easeLinearity: 0.25
            });
          }
        });
      }

      // Action: Toggle Ground Polygons on Map
      if (this.dom.btnTogglePolygonsHud) {
        this.dom.btnTogglePolygonsHud.addEventListener('click', () => {
          if (window.MarsLayers) {
            const visible = window.MarsLayers.toggleTraversabilityOverlay();
            this.dom.btnTogglePolygonsHud.classList.toggle('active', visible);
          }
        });
      }

      // Action: Toggle Marker Label Badges on Map
      if (this.dom.btnToggleLabelsHud) {
        this.dom.btnToggleLabelsHud.addEventListener('click', () => {
          if (window.MarsLocations) {
            const visible = window.MarsLocations.toggleLabels();
            this.dom.btnToggleLabelsHud.classList.toggle('active', visible);
          }
        });
      }
    },

    /**
     * Render selectable layer cards into the layer flyout
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
            <span><strong>Source:</strong> ${layer.category}</span>
          </div>
        `;

        card.addEventListener('click', () => {
          this.selectLayer(layer.id);
        });

        container.appendChild(card);
      });
    },

    /**
     * Select active base layer
     */
    selectLayer: function (layerId) {
      if (!window.MarsLayers) return;
      const success = window.MarsLayers.setBaseLayer(layerId);
      if (!success) return;

      const def = window.MarsLayers.getActiveDefinition();

      // Update card UI
      const cards = this.dom.layerCardsContainer.querySelectorAll('.layer-card');
      cards.forEach((c) => {
        c.classList.toggle('active', c.getAttribute('data-layer-id') === layerId);
      });

      // Update status bar telemetry
      if (this.dom.telemetryLayerVal) {
        this.dom.telemetryLayerVal.textContent = def.name;
      }

      this.updateDynamicLegend();
    },

    /**
     * Update Dynamic Map Legend based on active mode and layer
     */
    updateDynamicLegend: function () {
      const bar = this.dom.dynamicLegendBar;
      if (!bar) return;

      if (window.MarsLayers && window.MarsLayers.activeLayerId === 'rover-traversability') {
        bar.innerHTML = `
          <span class="legend-title">TRAVERSABILITY RISK:</span>
          <span style="display:inline-flex;gap:4px;align-items:center;">
            <span class="risk-badge-green">Trafficable</span>
            <span class="risk-badge-yellow">Caution</span>
            <span class="risk-badge-red">High Risk (Avoid)</span>
            <span style="background:rgba(119,125,131,0.2);color:#A7A09A;padding:2px 5px;border-radius:3px;font-size:9px;">Unsurveyed</span>
          </span>
        `;
      } else {
        const def = window.MarsLayers ? window.MarsLayers.getActiveDefinition() : { name: 'Global Surface' };
        bar.innerHTML = `
          <span class="legend-title">ACTIVE LAYER:</span>
          <span class="legend-val">${def.name}</span>
        `;
      }
    },

    /**
     * Primary Navigation Mode Switcher (9 Navigation Items)
     */
    navigateToSection: function (sectionKey) {
      this.activeNavSection = sectionKey;

      // Update sidebar active button
      if (this.dom.navItems) {
        this.dom.navItems.forEach((btn) => {
          btn.classList.toggle('active', btn.getAttribute('data-nav') === sectionKey);
        });
      }

      // Close layer drawer & landmark drawer by default
      if (this.dom.mapLayerDrawer) this.dom.mapLayerDrawer.classList.remove('open');
      if (this.dom.landmarkDrawer) this.dom.landmarkDrawer.classList.remove('open');

      switch (sectionKey) {
        case 'overview':
          this.closeModal();
          this.renderOverviewHUD();
          break;

        case 'map':
          this.closeModal();
          // Open layer selector flyout on the left
          if (this.dom.mapLayerDrawer) this.dom.mapLayerDrawer.classList.add('open');
          break;

        case 'traversability':
          this.closeModal();
          this.selectLayer('rover-traversability');
          break;

        case 'classification':
          this.openModal('NASA TERRAIN CLASSIFICATION SYSTEM', 'REPORT FIGURE 6.2 (JPL D-92756)', this.generateTerrainClassificationHTML());
          this.bindClassificationInteractions();
          break;

        case 'surface-analysis':
          this.openModal('NASA MOBILITY RISK MATRIX TABLE', 'ORIGINAL CHAPTER 6 CLASSIFICATION (JPL D-92756)', this.generateRiskMatrixHTML());
          this.bindRiskMatrixInteractions();
          break;

        case 'spirit-report':
          this.openModal('NASA SPIRIT MISSION RESEARCH REPORT', 'JPL D-92756 // JOHN L. CALLAS (DEC 2015)', this.generateSpiritReportHTML());
          this.bindSpiritReportInteractions();
          break;

        case 'timeline':
          this.openModal('SPIRIT MISSION TIMELINE & ROUTE CASE STUDY', 'CHAPTER 5 & CHAPTER 6 (JPL D-92756)', this.generateTimelineHTML());
          this.bindTimelineInteractions();
          break;

        case 'data-research':
          this.openModal('MISSION STATISTICS & DATA APPENDIX', 'REPORT APPENDIX A (JPL D-92756)', this.generateAppendixHTML());
          this.bindAppendixInteractions();
          break;

        case 'settings':
          this.openModal('CARTOGRAPHY SETTINGS & TRANSPARENCY', 'DATA PROVENANCE & METHODOLOGY', this.generateSettingsHTML());
          this.bindSettingsInteractions();
          break;
      }
    },

    /**
     * Open Research Modal
     */
    openModal: function (title, tag, htmlContent) {
      if (!this.dom.modalContainer) return;
      if (this.dom.modalTitle) this.dom.modalTitle.textContent = title;
      if (this.dom.modalTag) this.dom.modalTag.textContent = tag;
      if (this.dom.modalContent) this.dom.modalContent.innerHTML = htmlContent;

      this.dom.modalContainer.classList.add('open');
      this.dom.modalContainer.setAttribute('aria-hidden', 'false');
    },

    closeModal: function () {
      if (!this.dom.modalContainer) return;
      this.dom.modalContainer.classList.remove('open');
      this.dom.modalContainer.setAttribute('aria-hidden', 'true');
    },

    /**
     * Overview HUD Display
     */
    renderOverviewHUD: function () {
      const data = window.SpiritMissionData;
      if (!data) return;

      this.openModal(
        'COMMAND CENTER MISSION OVERVIEW',
        'GLOBAL MARS MAPPING & SPIRIT RESEARCH // JPL D-92756',
        `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">
          <div class="chart-card">
            <div class="chart-title">Global Mars Mapping Platform</div>
            <div style="font-size:11px;color:var(--text-secondary);line-height:1.5;">
              EPSG:3857 Web Mercator planetary visualization supporting verified OpenPlanetaryMap v0.2, Caltech CTX 5m mosaic, and NASA MOLA elevation layers without horizontal world repetition.
            </div>
            <button class="cmd-btn" style="margin-top:8px;justify-content:center;" onclick="window.MarsUIControls.navigateToSection('map')">
              Open Planetary Basemaps
            </button>
          </div>

          <div class="chart-card">
            <div class="chart-title">NASA MER Spirit Report (JPL D-92756)</div>
            <div style="font-size:11px;color:var(--text-secondary);line-height:1.5;">
              Comprehensive scientific summary of the 2,210-sol Mars Exploration Rover Spirit mission: 7,730.50 m odometry, goethite and opaline silica discoveries, and the Troy embedding investigation.
            </div>
            <button class="cmd-btn" style="margin-top:8px;justify-content:center;" onclick="window.MarsUIControls.navigateToSection('spirit-report')">
              Explore Mission Research
            </button>
          </div>

          <div class="chart-card">
            <div class="chart-title">Rover Traversability Hazard Analysis</div>
            <div style="font-size:11px;color:var(--text-secondary);line-height:1.5;">
              Interactive terrain risk evaluation based on Figure 6.2 and Chapter 6 mobility risk tables. Case studies at Home Plate, Columbia Hills, and the Troy unconsolidated sulfate sand trap.
            </div>
            <button class="cmd-btn primary" style="margin-top:8px;justify-content:center;background:var(--mars-accent);color:#fff;" onclick="window.MarsUIControls.navigateToSection('traversability')">
              Launch Traversability Model
            </button>
          </div>
        </div>

        <div class="chart-card" style="margin-top:12px;">
          <div class="chart-title-row">
            <span class="chart-title">Mission Lifetime Odometry Progression (7,730.50 m Total)</span>
            <span class="chart-source-citation">Source: JPL D-92756 Table 3.1 &amp; Appendix A</span>
          </div>
          <div class="svg-chart-container" id="overview-odometry-chart">
            ${this.generateOdometrySVG()}
          </div>
        </div>
        `
      );
    },

    /**
     * Part 4: Generate NASA Figure 6.2 Terrain Classification HTML
     */
    generateTerrainClassificationHTML: function () {
      const data = window.SpiritMissionData;
      if (!data) return '';

      const cats = data.terrainClassificationCategories;
      const slopes = data.slopeScaleValues;

      let catsHtml = cats.map(c => `
        <div class="class-item-card" data-cat-id="${c.id}">
          <div class="class-header-row">
            <div class="color-swatch-box" style="background-color:${c.hexColor};"></div>
            <div class="class-name">${c.categoryName} (${c.colorName})</div>
          </div>
          <div class="class-desc">${c.description}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">
            <strong>Mobility Impact:</strong> ${c.mobilityIssue}
          </div>
          <div class="class-risk">${c.riskLevel}</div>
        </div>
      `).join('');

      let slopeHtml = slopes.map(s => `
        <div class="slope-segment" style="background-color:${s.colorHex};" title="${s.label}: ${s.desc}">
          ${s.deg}°
        </div>
      `).join('');

      return `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div class="chart-card">
            <div class="chart-title-row">
              <span class="chart-title">NASA Figure 6.2 Terrain Classification Legend</span>
              <span class="chart-source-citation">Source: MER Spirit End of Mission Report Figure 6.2 (JPL D-92756)</span>
            </div>
            <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;">
              Original 7-category surface classification calibrated from Spirit's forward hazard cameras and Pancam imagery across Gusev Crater and the Columbia Hills.
            </div>
            <div class="classification-grid">
              ${catsHtml}
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-title-row">
              <span class="chart-title">NASA Figure 6.2 Educational Slope Scale (-10° to +25°)</span>
              <span class="chart-source-citation">Slopes radial to rover chassis (Figure 6.2)</span>
            </div>
            <div style="font-size:10px;color:var(--text-muted);margin-bottom:8px;">
              * Note: This color bar represents physical slope angles radial to the rover and is distinct from the green/yellow/red mobility risk classification.
            </div>
            <div class="slope-bar-strip">
              ${slopeHtml}
            </div>
            <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:9px;color:var(--text-muted);margin-top:4px;">
              <span>-10° Downhill</span>
              <span>0° Level</span>
              <span>4° Mild</span>
              <span>8° Moderate</span>
              <span>12° Troy Incline</span>
              <span>16° Critical</span>
              <span>25° Extreme</span>
            </div>
          </div>
        </div>
      `;
    },

    bindClassificationInteractions: function () {
      // Allow clicking category cards for detailed modal alert or focus
    },

    /**
     * Part 5: Generate Original NASA Mobility Risk Matrix Table HTML
     */
    generateRiskMatrixHTML: function () {
      const data = window.SpiritMissionData;
      if (!data) return '';

      const matrix = data.mobilityRiskMatrix;
      const cols = matrix.slopeColumns;
      const rows = matrix.terrainRows;

      let thead = `<tr><th>Terrain Classification (Figure 6.2)</th>` + cols.map(c => `<th>${c.label}</th>`).join('') + `</tr>`;

      let tbody = rows.map((r, rIdx) => {
        let cells = r.classifications.map((cl, cIdx) => {
          let badgeClass = cl === 'GREEN' ? 'risk-badge-green' : cl === 'YELLOW' ? 'risk-badge-yellow' : 'risk-badge-red';
          return `
            <td class="risk-cell" data-row="${rIdx}" data-col="${cIdx}">
              <span class="${badgeClass}">${cl}</span>
            </td>
          `;
        }).join('');
        return `<tr><td class="terrain-header-cell">${r.terrainType}</td>${cells}</tr>`;
      }).join('');

      return `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div class="chart-card">
            <div class="chart-title-row">
              <span class="chart-title">Original NASA MER Spirit Mobility Risk Table</span>
              <span class="chart-source-citation">Source: MER Spirit Report Chapter 6 (JPL D-92756)</span>
            </div>
            <div style="font-size:11px;color:var(--text-secondary);line-height:1.5;">
              Click any cell in the table below to inspect NASA's historical mobility assessment.
            </div>
            <div style="overflow-x:auto;margin-top:8px;">
              <table class="risk-matrix-table">
                <thead>${thead}</thead>
                <tbody>${tbody}</tbody>
              </table>
            </div>
          </div>

          <div id="risk-detail-card" class="chart-card">
            <div class="chart-title" style="color:var(--mars-accent);">Selected Terrain Hazard Rationale</div>
            <div id="risk-detail-text" style="font-size:11px;color:var(--text-secondary);line-height:1.5;">
              Select any cell above or choose a terrain type to review the engineering risk explanation.
            </div>
          </div>

          <div style="font-size:10px;color:var(--text-muted);border-left:2px solid var(--border-color);padding-left:8px;line-height:1.5;">
            <strong>Important Scientific Limitation:</strong> This table reflects the historical classification methodology from the 2004–2010 MER Spirit mission in Gusev Crater. It accounts for Spirit's 6-wheel rocker-bogie architecture, 25 cm clearance, and post-Sol 779 disabled right-front wheel. It does not represent a universal safety threshold for modern or future Mars rovers.
          </div>
        </div>
      `;
    },

    bindRiskMatrixInteractions: function () {
      const matrix = window.SpiritMissionData.mobilityRiskMatrix;
      const detailText = document.getElementById('risk-detail-text');

      const cells = document.querySelectorAll('.risk-cell');
      cells.forEach(cell => {
        cell.addEventListener('click', () => {
          const rIdx = parseInt(cell.getAttribute('data-row'), 10);
          const cIdx = parseInt(cell.getAttribute('data-col'), 10);
          const row = matrix.terrainRows[rIdx];
          const col = matrix.slopeColumns[cIdx];
          const risk = row.classifications[cIdx];

          const colorCode = risk === 'GREEN' ? 'var(--trav-green)' : risk === 'YELLOW' ? 'var(--trav-yellow)' : 'var(--trav-red)';
          const riskWord = risk === 'GREEN' ? 'TRAFFICABLE (ACCEPTABLE RISK)' : risk === 'YELLOW' ? 'CAUTION (ELEVATED SLIP RISK)' : 'HIGH RISK (UNTRAFFICABLE / AVOID)';

          if (detailText) {
            detailText.innerHTML = `
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-family:var(--font-mono);font-size:12px;font-weight:700;color:${colorCode};">${riskWord}</span>
                <span style="font-size:11px;color:var(--text-muted);">| ${row.terrainType} at ${col.label}</span>
              </div>
              <div><strong>Operational Condition:</strong> ${col.description}.</div>
              <div style="margin-top:4px;"><strong>Historical Rationale:</strong> ${row.notes}</div>
            `;
          }
        });
      });
    },

    /**
     * Part 3: Generate NASA Spirit Mission Research Report HTML
     */
    generateSpiritReportHTML: function () {
      const data = window.SpiritMissionData;
      if (!data) return '';

      return `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <!-- Tab selector for Report Sections -->
          <div class="modal-nav-tabs">
            <button class="modal-tab-btn active" data-report-tab="sec-science">1. Science Highlights</button>
            <button class="modal-tab-btn" data-report-tab="sec-environment">2. Environmental &amp; Dust</button>
            <button class="modal-tab-btn" data-report-tab="sec-mobility">3. Loss of Mobility</button>
            <button class="modal-tab-btn" data-report-tab="sec-winter">4. Winter Strategies</button>
            <button class="modal-tab-btn" data-report-tab="sec-embedding">5. Troy &amp; Hazard Mapping</button>
          </div>

          <!-- Section 1: Science Highlights -->
          <div id="sec-science" class="report-tab-panel active">
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;">
              ${data.scienceHighlights.map(s => `
                <div class="chart-card">
                  <div class="chart-title" style="color:var(--terrain-highlight);">${s.title}</div>
                  <div style="font-family:var(--font-mono);font-size:9px;color:var(--text-muted);">${s.location} (Sols ${s.sols})</div>
                  <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;line-height:1.4;">${s.discovery}</div>
                  <div style="font-size:10px;color:var(--text-muted);border-left:2px solid var(--mars-accent);padding-left:6px;margin-top:6px;">
                    <strong>Significance:</strong> ${s.significance}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Section 2: Environmental Challenges & Dust Factor Chart -->
          <div id="sec-environment" class="report-tab-panel" style="display:none;">
            <div class="chart-card">
              <div class="chart-title-row">
                <span class="chart-title">Historical Solar Array Dust Factor Trend (Sols 1–2260)</span>
                <span class="chart-source-citation">Source: MER Spirit Report Section 2.3 &amp; Figure 2.4</span>
              </div>
              <div style="font-size:11px;color:var(--text-secondary);line-height:1.5;">
                Dust Factor is defined as the ratio of actual energy produced to the expected energy of a pristine clean solar array (1.0 = Clean, 0.0 = Completely Obscured). Spontaneous aeolian cleaning events periodically restored energy margins.
              </div>
              <div class="svg-chart-container" id="dust-factor-chart-box">
                ${this.generateDustFactorSVG()}
              </div>
            </div>
          </div>

          <!-- Section 3: Loss of Mobility -->
          <div id="sec-mobility" class="report-tab-panel" style="display:none;">
            <div class="chart-card">
              <div class="chart-title-row">
                <span class="chart-title">Right-Front Wheel Failure &amp; Reverse Driving Mode</span>
                <span class="chart-source-citation">Source: MER Spirit Report Section 3.2</span>
              </div>
              <div style="font-size:11px;color:var(--text-secondary);line-height:1.5;">
                On Sol 779, after driving over 6,500 metres, Spirit's Right-Front (RF) wheel drive actuator suffered an open circuit failure. The mission team adapted by driving the rover backward in five-wheel drive, dragging the locked front wheel. The dragged wheel excavated regolith trenches that inadvertently led to the discovery of pure opaline silica at Gertrude Weise.
              </div>
              <div class="svg-chart-container" style="margin-top:10px;">
                ${this.generateOdometrySVG()}
              </div>
            </div>
          </div>

          <!-- Section 4: Winter Strategies -->
          <div id="sec-winter" class="report-tab-panel" style="display:none;">
            <div class="chart-card">
              <div class="chart-title-row">
                <span class="chart-title">Historical Martian Winter Comparison Table</span>
                <span class="chart-source-citation">Source: MER Spirit Report Section 4.1 &amp; Table 4.1</span>
              </div>
              <div style="overflow-x:auto;">
                <table class="risk-matrix-table" style="margin-top:6px;">
                  <thead>
                    <tr>
                      <th>Winter #</th>
                      <th>Solstice Sol</th>
                      <th>North Tilt (Deg)</th>
                      <th>Dust Factor</th>
                      <th>Daily Energy (Wh)</th>
                      <th>Status / Operational Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.winterTable.map(w => `
                      <tr>
                        <td style="font-weight:700;color:var(--mars-accent);">Winter ${w.winterNumber}</td>
                        <td style="font-family:var(--font-mono);">Sol ${w.sol}</td>
                        <td style="font-family:var(--font-mono);color:${w.northTiltDeg < 0 ? 'var(--trav-red)' : 'var(--trav-green)'};font-weight:700;">
                          ${w.northTiltDeg > 0 ? '+' : ''}${w.northTiltDeg}°
                        </td>
                        <td style="font-family:var(--font-mono);">${w.dustFactor}</td>
                        <td style="font-family:var(--font-mono);font-weight:700;color:${w.dailyEnergyWh < 150 ? 'var(--trav-red)' : 'var(--text-primary)'};">
                          ${w.dailyEnergyWh} Wh
                        </td>
                        <td style="text-align:left;font-size:10px;">${w.description} ${w.uncertain ? '<em>(Estimated - loss of contact)</em>' : ''}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Section 5: Troy Embedding & Soil Morphology -->
          <div id="sec-embedding" class="report-tab-panel" style="display:none;">
            <div class="chart-card">
              <div class="chart-title-row">
                <span class="chart-title">The Troy Embedding &amp; Loose Sulfate Sand Hazard</span>
                <span class="chart-source-citation">Source: MER Spirit Report Chapter 6 &amp; Chapter 7</span>
              </div>
              <div style="font-size:11px;color:var(--text-secondary);line-height:1.5;">
                On Sol 1886, while traversing a benign 12° slope on the western apron of Home Plate, Spirit broke through a brittle 1–2 cm cemented surface crust into extraordinarily weak, loose ferric and magnesium sulfate sands nicknamed "poppy-seed" soil. With near-zero internal cohesion, wheel cleats sheared the material without traction, burying the wheels to their hubs and resting the undercarriage on a hidden rock.
              </div>
              <div style="margin-top:10px;padding:10px;background:var(--panel-primary);border-radius:var(--radius-xs);border-left:3px solid var(--trav-red);">
                <div style="font-weight:700;color:var(--trav-red);font-size:11px;">CRITICAL ENGINEERING LESSON (JPL D-92756):</div>
                <div style="font-size:10px;color:var(--text-secondary);margin-top:3px;line-height:1.4;">
                  Benign orbital and surface visual appearance can mask dangerous subsurface rheological traps. Slopes as low as 12° become fatal when coupled with loose granular sulfates and disabled drive actuators.
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    bindSpiritReportInteractions: function () {
      const tabBtns = document.querySelectorAll('.modal-tab-btn');
      const panels = document.querySelectorAll('.report-tab-panel');

      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const target = btn.getAttribute('data-report-tab');
          panels.forEach(p => {
            p.style.display = (p.id === target) ? 'block' : 'none';
          });
        });
      });
    },

    /**
     * Part 8 & 9: Generate Mission Timeline & Route Case Study HTML
     */
    generateTimelineHTML: function () {
      const data = window.SpiritMissionData;
      if (!data) return '';

      const milestones = [
        { sol: 1800, title: "Route Planning", desc: "Mission begins planning Route 1, 2, 3 circum-traverses of Home Plate." },
        { sol: 1829, title: "Route 1 Abandoned", desc: "Ascent onto Home Plate aborted due to >18° slopes and >80% wheel slip." },
        { sol: 1843, title: "Route 2 Abandoned", desc: "Northeast path blocked by large basalt boulder fields and soft ripple dunes." },
        { sol: 1871, title: "Last Successful Drive", desc: "Spirit completes final nominal traverse before entering western apron." },
        { sol: 1886, title: "Embedding at Troy", desc: "Rover breaks through duricrust into loose sulfate sand on a 12° slope." },
        { sol: 1899, title: "Left-Middle Stall", desc: "Left-Middle drive motor stalls and suffers catastrophic electrical failure." },
        { sol: 2078, title: "Extrication Begins", desc: "Extrication drives commence after extensive Surface System Testbed testing." },
        { sol: 2169, title: "Extrication Ends", desc: "Drives ceased after Right-Rear motor failure; rover oriented for winter." },
        { sol: 2210, title: "Final Transmission", desc: "Final telemetry transmission received prior to fourth Martian winter solstice." }
      ];

      return `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div class="chart-card">
            <div class="chart-title-row">
              <span class="chart-title">Interactive Spirit Mission Case Study Timeline</span>
              <span class="chart-source-citation">Source: MER Spirit Report Chapter 5 &amp; Chapter 7</span>
            </div>
            <div class="timeline-track-wrapper">
              <div class="timeline-line-base"></div>
              <div class="timeline-milestones-row">
                ${milestones.map((m, idx) => `
                  <button class="milestone-node ${idx === 4 ? 'active' : ''}" data-sol="${m.sol}" data-idx="${idx}">
                    <div class="node-dot"></div>
                    <div class="node-label">Sol ${m.sol}</div>
                  </button>
                `).join('')}
              </div>
            </div>
            <div id="timeline-detail-box" class="milestone-detail-card" style="margin-top:10px;">
              <div style="font-family:var(--font-heading);font-size:14px;color:var(--mars-accent);font-weight:700;">
                Sol 1886: Embedding at Troy
              </div>
              <div style="font-size:11px;color:var(--text-secondary);line-height:1.5;">
                On Sol 1886, while attempting Route 3 around the western edge of Home Plate toward Goddard and von Braun, Spirit broke through an apparently solid surface crust into hidden, low-shear-strength sulfate sands. Wheels sank to axle depth with 99.7% slip.
              </div>
            </div>
          </div>

          <!-- Table 7.1 Extrication Drives -->
          <div class="chart-card">
            <div class="chart-title-row">
              <span class="chart-title">Table 7.1 — Troy Extrication Drive Attempts (Sols 2078–2169)</span>
              <span class="chart-source-citation">Source: JPL D-92756 Table 7.1</span>
            </div>
            <div style="overflow-x:auto;">
              <table class="risk-matrix-table" style="margin-top:6px;">
                <thead>
                  <tr>
                    <th>Sol</th>
                    <th>Commanded (mm)</th>
                    <th>Actual Move (mm)</th>
                    <th>Wheel Slip</th>
                    <th>Motor Stalls</th>
                    <th>Operational Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.extricationDrives.map(d => `
                    <tr>
                      <td style="font-family:var(--font-mono);font-weight:700;">Sol ${d.sol}</td>
                      <td style="font-family:var(--font-mono);">${d.commandMm} mm</td>
                      <td style="font-family:var(--font-mono);font-weight:700;color:var(--mars-accent);">${d.actualMm} mm</td>
                      <td style="font-family:var(--font-mono);color:var(--trav-red);">${d.slipPct}%</td>
                      <td style="font-family:var(--font-mono);">${d.stalls}</td>
                      <td style="text-align:left;font-size:10px;">${d.notes}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    },

    bindTimelineInteractions: function () {
      const milestones = [
        { sol: 1800, title: "Sol 1800: Route Planning Period Begins", desc: "Scientific team establishes Routes 1, 2, and 3 candidate pathways to reach von Braun and Goddard before fourth Martian winter." },
        { sol: 1829, title: "Sol 1829: Route 1 Abandoned", desc: "Direct ascent up Home Plate scarp abandoned after wheels slipped over 85% on steep >18° volcanic outcrop." },
        { sol: 1843, title: "Sol 1843: Route 2 Abandoned", desc: "Northeast circumnavigation blocked by impassable boulder fields with clasts exceeding the 25 cm rover belly clearance." },
        { sol: 1871, title: "Sol 1871: Last Nominal Long Drive", desc: "Spirit completes its last long forward traverse on the western apron before entering the sulfate formation." },
        { sol: 1886, title: "Sol 1886: Embedding at Troy", desc: "Rover sinks through a thin duricrust into loose, unconsolidated ferric and magnesium sulfate sands ('poppy-seed' soil)." },
        { sol: 1899, title: "Sol 1899: Left-Middle Wheel Stall", desc: "Left-Middle drive motor draws peak stall current and fails open-circuit, reducing Spirit to 4 operational drive wheels." },
        { sol: 2078, title: "Sol 2078: Extrication Drive 1 Commences", desc: "First extrication drive following five months of JPL Surface System Testbed (SST) sandbox testing. 4.5 m commanded, 12 mm actual move." },
        { sol: 2169, title: "Sol 2169: Extrication Discontinued", desc: "After Right-Rear motor failure on Sol 2100, efforts focus on orienting solar arrays. Drives ceased before fourth winter." },
        { sol: 2210, title: "Sol 2210: Final Telemetry Received", desc: "Final transmission via 2001 Mars Odyssey orbiter. Rover enters unrecoverable low-power sleep on a -9.2° south tilt." }
      ];

      const nodes = document.querySelectorAll('.milestone-node');
      const detailBox = document.getElementById('timeline-detail-box');

      nodes.forEach(node => {
        node.addEventListener('click', () => {
          nodes.forEach(n => n.classList.remove('active'));
          node.classList.add('active');
          const idx = parseInt(node.getAttribute('data-idx'), 10);
          const m = milestones[idx];
          if (detailBox && m) {
            detailBox.innerHTML = `
              <div style="font-family:var(--font-heading);font-size:14px;color:var(--mars-accent);font-weight:700;">${m.title}</div>
              <div style="font-size:11px;color:var(--text-secondary);line-height:1.5;">${m.desc}</div>
            `;
          }
        });
      });
    },

    /**
     * Part 10: Generate Appendix A Searchable Dashboard HTML
     */
    generateAppendixHTML: function () {
      const data = window.SpiritMissionData;
      if (!data) return '';
      const app = data.appendixA;

      return `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <!-- Search Control Bar -->
          <div class="search-control-bar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input id="appendix-search-input" class="appendix-search-input" type="text" placeholder="Search mission metrics, actuators, instruments, telemetry..." aria-label="Search Appendix A">
            <a href="${data.metadata.pdfUrl}" target="_blank" rel="noopener" class="cmd-btn" style="text-decoration:none;">
              Download Official NASA PDF
            </a>
          </div>

          <!-- Appendix Sections Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;">
            <!-- Drive Statistics -->
            <div class="chart-card appendix-searchable-item">
              <div class="chart-title">Mobility &amp; Drive Records</div>
              <table class="data-stats-table">
                <tbody>
                  <tr><td>Total Drive Distance:</td><td style="font-family:var(--font-mono);font-weight:700;color:var(--mars-accent);">7,730.50 m</td></tr>
                  <tr><td>Longest Single Drive:</td><td style="font-family:var(--font-mono);">122.7 m (Sol 125)</td></tr>
                  <tr><td>Second Longest Drive:</td><td style="font-family:var(--font-mono);">113.1 m (Sol 133)</td></tr>
                  <tr><td>Third Longest Drive:</td><td style="font-family:var(--font-mono);">109.5 m (Sol 134)</td></tr>
                  <tr><td>Bumps to Position:</td><td style="font-family:var(--font-mono);">177</td></tr>
                  <tr><td>Drives for Distance:</td><td style="font-family:var(--font-mono);">302</td></tr>
                  <tr><td>Total Drive Sols:</td><td style="font-family:var(--font-mono);">479 Sols</td></tr>
                </tbody>
              </table>
            </div>

            <!-- Instrument Sols -->
            <div class="chart-card appendix-searchable-item">
              <div class="chart-title">Instrument Usage Sols</div>
              <table class="data-stats-table">
                <tbody>
                  ${app.instrumentUsageSols.map(i => `
                    <tr><td>${i.instrument}</td><td style="font-family:var(--font-mono);font-weight:700;">${i.sols} sols</td></tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Telecom Data Return -->
            <div class="chart-card appendix-searchable-item">
              <div class="chart-title">Telecom Data Return (21.57 GB Total)</div>
              <table class="data-stats-table">
                <tbody>
                  ${app.dataReturnGB.map(d => `
                    <tr><td>${d.link}</td><td style="font-family:var(--font-mono);font-weight:700;color:var(--terrain-highlight);">${d.gb} GB (${d.pct}%)</td></tr>
                  `).join('')}
                  <tr><td>Average Return per Sol:</td><td style="font-family:var(--font-mono);">79.96 MB / sol</td></tr>
                </tbody>
              </table>
            </div>

            <!-- Image Statistics -->
            <div class="chart-card appendix-searchable-item">
              <div class="chart-title">Image Archives (124,839 Total)</div>
              <table class="data-stats-table">
                <tbody>
                  ${app.imageStatistics.map(img => `
                    <tr><td>${img.camera}</td><td style="font-family:var(--font-mono);font-weight:700;">${img.count.toLocaleString()}</td></tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Actuator Lifetime Table -->
          <div class="chart-card appendix-searchable-item">
            <div class="chart-title">Actuator &amp; Mechanism Lifetime Telemetry</div>
            <div style="overflow-x:auto;">
              <table class="data-stats-table" style="margin-top:6px;">
                <thead>
                  <tr><th>Actuator Name</th><th>Mechanism Type</th><th>Revolutions / Cycles</th><th>Operational Status</th></tr>
                </thead>
                <tbody>
                  ${app.actuators.map(a => `
                    <tr>
                      <td style="font-weight:600;color:var(--text-primary);">${a.name}</td>
                      <td>${a.type}</td>
                      <td style="font-family:var(--font-mono);">${(a.revolutions || a.cycles).toLocaleString()}</td>
                      <td style="font-size:10px;color:${a.status.includes('failed') || a.status.includes('Failed') ? 'var(--trav-red)' : 'var(--trav-green)'};">
                        ${a.status}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    },

    bindAppendixInteractions: function () {
      const search = document.getElementById('appendix-search-input');
      if (!search) return;

      search.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const rows = document.querySelectorAll('.data-stats-table tr');
        rows.forEach(r => {
          const text = r.textContent.toLowerCase();
          r.style.display = text.includes(query) ? '' : 'none';
        });
      });
    },

    /**
     * Part 13 & 14: Settings & Transparency HTML
     */
    generateSettingsHTML: function () {
      const meta = window.SpiritMissionData ? window.SpiritMissionData.metadata : {};

      return `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div class="chart-card">
            <div class="chart-title">Scientific Data Provenance &amp; Transparency</div>
            <div style="font-size:11px;color:var(--text-secondary);line-height:1.6;">
              This web platform explicitly delineates between verified planetary cartographic datasets and historical mission case studies:
              <ul style="margin:8px 0 8px 18px;">
                <li><strong>Historical NASA MER Spirit Data:</strong> Directly compiled from the official <em>Mars Exploration Rover Spirit End of Mission Report</em> (JPL Publication D-92756, Dec 2015, Author: John L. Callas).</li>
                <li><strong>Planetary Basemap Layers:</strong> Real planetary tile services (OpenPlanetaryMap v0.2, Caltech CTX 5m mosaic, NASA MOLA elevation, ESA HRSC shaded relief).</li>
                <li><strong>Derived Traversability Model:</strong> Educational reconstruction applying Figure 6.2 hazard classification criteria to local Gusev Crater terrain.</li>
              </ul>
            </div>
            <div style="margin-top:6px;">
              <a href="${meta.pdfUrl}" target="_blank" rel="noopener" class="cmd-btn" style="text-decoration:none;display:inline-flex;">
                Official NASA Technical Reports Server (NTRS) Citation
              </a>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-title">Keyboard Navigation Shortcuts</div>
            <table class="data-stats-table">
              <tbody>
                <tr><td><span class="cmd-btn" style="padding:1px 5px;height:20px;">+</span> / <span class="cmd-btn" style="padding:1px 5px;height:20px;">-</span></td><td>Zoom In / Out</td></tr>
                <tr><td><span class="cmd-btn" style="padding:1px 5px;height:20px;">R</span></td><td>Reset Global Mars Map View</td></tr>
                <tr><td><span class="cmd-btn" style="padding:1px 5px;height:20px;">D</span></td><td>Toggle Mars Geodesic Distance Measurement Tool</td></tr>
                <tr><td><span class="cmd-btn" style="padding:1px 5px;height:20px;">F</span></td><td>Toggle Fullscreen Mode</td></tr>
                <tr><td><span class="cmd-btn" style="padding:1px 5px;height:20px;">ESC</span></td><td>Close Modals &amp; Flyouts</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    bindSettingsInteractions: function () {
      // Settings hooks
    },

    /**
     * SVG Chart Generators
     */
    generateDustFactorSVG: function () {
      const data = window.SpiritMissionData ? window.SpiritMissionData.dustFactorData : [];
      if (!data.length) return '';

      const width = 600;
      const height = 180;
      const padL = 40;
      const padR = 20;
      const padT = 20;
      const padB = 30;

      const maxSol = 2300;
      const minDust = 0;
      const maxDust = 1.0;

      const points = data.map(d => {
        const x = padL + (d.sol / maxSol) * (width - padL - padR);
        const y = height - padB - ((d.dustFactor - minDust) / (maxDust - minDust)) * (height - padT - padB);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');

      return `
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          <!-- Grid lines -->
          <line x1="${padL}" y1="${height - padB}" x2="${width - padR}" y2="${height - padB}" stroke="var(--border-color)" stroke-width="1"/>
          <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${height - padB}" stroke="var(--border-color)" stroke-width="1"/>
          <line x1="${padL}" y1="${padT + (height - padT - padB)/2}" x2="${width - padR}" y2="${padT + (height - padT - padB)/2}" stroke="var(--border-subtle)" stroke-dasharray="4,4"/>

          <!-- Axis Labels -->
          <text x="${padL - 6}" y="${height - padB}" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="9" text-anchor="end">0.0</text>
          <text x="${padL - 6}" y="${padT + (height - padT - padB)/2 + 3}" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="9" text-anchor="end">0.5</text>
          <text x="${padL - 6}" y="${padT + 4}" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="9" text-anchor="end">1.0</text>

          <text x="${padL}" y="${height - 8}" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="9">Sol 1</text>
          <text x="${padL + (1000/maxSol)*(width-padL-padR)}" y="${height - 8}" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="9">Sol 1000</text>
          <text x="${width - padR - 30}" y="${height - 8}" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="9">Sol 2210</text>

          <!-- Data Polyline -->
          <polyline points="${points}" fill="none" stroke="var(--mars-accent)" stroke-width="2.5" stroke-linecap="round"/>

          <!-- Highlight Nodes -->
          ${data.map(d => {
            const x = padL + (d.sol / maxSol) * (width - padL - padR);
            const y = height - padB - ((d.dustFactor - minDust) / (maxDust - minDust)) * (height - padT - padB);
            return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="#100F0F" stroke="var(--mars-accent)" stroke-width="2"/>`;
          }).join('')}
        </svg>
      `;
    },

    generateOdometrySVG: function () {
      const data = window.SpiritMissionData ? window.SpiritMissionData.mobilityMilestones : [];
      if (!data.length) return '';

      const width = 600;
      const height = 180;
      const padL = 50;
      const padR = 20;
      const padT = 20;
      const padB = 30;

      const maxSol = 2200;
      const maxOdo = 8000;

      const points = data.map(d => {
        const x = padL + (d.sol / maxSol) * (width - padL - padR);
        const y = height - padB - (d.odometryM / maxOdo) * (height - padT - padB);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');

      return `
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          <line x1="${padL}" y1="${height - padB}" x2="${width - padR}" y2="${height - padB}" stroke="var(--border-color)" stroke-width="1"/>
          <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${height - padB}" stroke="var(--border-color)" stroke-width="1"/>

          <!-- Axis Labels -->
          <text x="${padL - 6}" y="${height - padB}" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="9" text-anchor="end">0 m</text>
          <text x="${padL - 6}" y="${padT + (height - padT - padB)/2 + 3}" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="9" text-anchor="end">4,000 m</text>
          <text x="${padL - 6}" y="${padT + 4}" fill="var(--text-muted)" font-family="var(--font-mono)" font-size="9" text-anchor="end">7,730 m</text>

          <!-- Polyline -->
          <polyline points="${points}" fill="none" stroke="var(--trav-green)" stroke-width="2.5" stroke-linecap="round"/>

          <!-- Sol 779 Wheel Failure Marker -->
          <line x1="${(padL + (779/maxSol)*(width-padL-padR)).toFixed(1)}" y1="${padT}" x2="${(padL + (779/maxSol)*(width-padL-padR)).toFixed(1)}" y2="${height - padB}" stroke="var(--trav-red)" stroke-width="1" stroke-dasharray="3,3"/>
          <text x="${(padL + (779/maxSol)*(width-padL-padR) + 4).toFixed(1)}" y="${padT + 12}" fill="var(--trav-red)" font-family="var(--font-mono)" font-size="8">Sol 779: RF Fail</text>
        </svg>
      `;
    },

    /**
     * Bind all DOM UI event listeners
     */
    bindEvents: function () {
      // 9 Primary Sidebar Navigation Items
      if (this.dom.navItems) {
        this.dom.navItems.forEach((btn) => {
          btn.addEventListener('click', () => {
            const nav = btn.getAttribute('data-nav');
            this.navigateToSection(nav);
          });
        });
      }

      // Sidebar Collapse Toggle
      if (this.dom.sidebarToggleBtn) {
        this.dom.sidebarToggleBtn.addEventListener('click', () => {
          if (this.dom.sidebar) {
            this.dom.sidebar.classList.toggle('collapsed');
            setTimeout(() => {
              if (window.MarsMapEngine && window.MarsMapEngine.map) {
                window.MarsMapEngine.map.invalidateSize();
              }
            }, 250);
          }
        });
      }

      // Layer Flyout Close Button
      if (this.dom.closeLayerDrawerBtn) {
        this.dom.closeLayerDrawerBtn.addEventListener('click', () => {
          if (this.dom.mapLayerDrawer) this.dom.mapLayerDrawer.classList.remove('open');
        });
      }

      // Modal Close Button & Backdrop Click
      if (this.dom.modalCloseBtn) {
        this.dom.modalCloseBtn.addEventListener('click', () => this.closeModal());
      }
      if (this.dom.modalContainer) {
        this.dom.modalContainer.addEventListener('click', (e) => {
          if (e.target === this.dom.modalContainer) {
            this.closeModal();
          }
        });
      }

      // Zoom Controls
      if (this.dom.btnZoomIn) {
        this.dom.btnZoomIn.addEventListener('click', () => {
          if (window.MarsMapEngine && window.MarsMapEngine.map) window.MarsMapEngine.map.zoomIn();
        });
      }
      if (this.dom.btnZoomOut) {
        this.dom.btnZoomOut.addEventListener('click', () => {
          if (window.MarsMapEngine && window.MarsMapEngine.map) window.MarsMapEngine.map.zoomOut();
        });
      }

      // Global Reset View Buttons
      const resetViewFn = () => {
        if (window.MarsMapEngine) window.MarsMapEngine.resetGlobalView(true);
      };
      if (this.dom.btnResetView) this.dom.btnResetView.addEventListener('click', resetViewFn);
      if (this.dom.btnResetViewTop) this.dom.btnResetViewTop.addEventListener('click', resetViewFn);

      // Compass Button
      if (this.dom.compassBox) {
        this.dom.compassBox.addEventListener('click', resetViewFn);
      }

      // Fullscreen Toggles
      const toggleFs = () => this.toggleFullscreen();
      if (this.dom.btnFullscreen) this.dom.btnFullscreen.addEventListener('click', toggleFs);
      if (this.dom.topFullscreenBtn) this.dom.topFullscreenBtn.addEventListener('click', toggleFs);

      // Opacity Slider Input
      if (this.dom.opacitySlider) {
        this.dom.opacitySlider.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          this.setOpacity(val);
        });
      }

      // Opacity Presets
      if (this.dom.opacityPresetButtons) {
        this.dom.opacityPresetButtons.forEach((btn) => {
          btn.addEventListener('click', () => {
            const val = parseFloat(btn.getAttribute('data-opacity'));
            this.setOpacity(val);
            if (this.dom.opacitySlider) this.dom.opacitySlider.value = val;
          });
        });
      }

      // Terrain Intelligence Layer Toggles
      const terrainToggles = [
        { id: 'chk-terrain-slope', key: 'slope' },
        { id: 'chk-terrain-rock', key: 'rock' },
        { id: 'chk-terrain-sand', key: 'sand' },
        { id: 'chk-terrain-surface', key: 'surface' },
        { id: 'chk-terrain-unknown', key: 'unknown' }
      ];
      terrainToggles.forEach(t => {
        const el = document.getElementById(t.id);
        if (el) {
          el.addEventListener('change', (e) => {
            if (window.TerrainEngine) {
              window.TerrainEngine.toggleLayerGroup(t.key, e.target.checked);
            }
          });
        }
      });

      // Historical Rover Route Toggles
      const roverToggles = [
        { id: 'chk-rover-perseverance', key: 'perseverance' },
        { id: 'chk-rover-curiosity', key: 'curiosity' },
        { id: 'chk-rover-opportunity', key: 'opportunity' },
        { id: 'chk-rover-spirit', key: 'spirit' }
      ];
      roverToggles.forEach(r => {
        const el = document.getElementById(r.id);
        if (el) {
          el.addEventListener('change', (e) => {
            if (window.RoverRoutesEngine) {
              window.RoverRoutesEngine.toggleRoverRoute(r.key, e.target.checked);
            }
          });
        }
      });

      // Landmark Quick Jump Dropdown
      if (this.dom.landmarkSelect) {
        this.dom.landmarkSelect.addEventListener('change', (e) => {
          const id = e.target.value;
          const target = window.MarsLocations ? window.MarsLocations.getById(id) : null;
          if (target) {
            window.MarsLocations.flyTo(target);
            this.openLandmarkDrawer(target);
          }
        });
      }

      // Measure Tool Buttons
      if (this.dom.toggleMeasureBtn) {
        this.dom.toggleMeasureBtn.addEventListener('click', () => {
          if (window.MarsApp && window.MarsApp.toggleMeasure) window.MarsApp.toggleMeasure();
        });
      }
      if (this.dom.measureUndoBtn) {
        this.dom.measureUndoBtn.addEventListener('click', () => {
          if (window.MarsApp && window.MarsApp.undoLastPoint) window.MarsApp.undoLastPoint();
        });
      }
      if (this.dom.measureClearBtn) {
        this.dom.measureClearBtn.addEventListener('click', () => {
          if (window.MarsApp && window.MarsApp.clearMeasure) window.MarsApp.clearMeasure();
        });
      }
      if (this.dom.measureFinishBtn) {
        this.dom.measureFinishBtn.addEventListener('click', () => {
          if (window.MarsApp && window.MarsApp.finishMeasure) window.MarsApp.finishMeasure();
        });
      }
      if (this.dom.measureCloseBtn) {
        this.dom.measureCloseBtn.addEventListener('click', () => {
          if (window.MarsApp && window.MarsApp.exitMeasure) window.MarsApp.exitMeasure();
        });
      }

      // Landmark Drawer Close & Actions
      if (this.dom.drawerCloseBtn) {
        this.dom.drawerCloseBtn.addEventListener('click', () => this.closeLandmarkDrawer());
      }
      if (this.dom.drawerFlyBtn) {
        this.dom.drawerFlyBtn.addEventListener('click', () => {
          if (this.currentLandmark && window.MarsLocations) {
            window.MarsLocations.flyTo(this.currentLandmark);
          }
        });
      }
      if (this.dom.drawerCopyBtn) {
        this.dom.drawerCopyBtn.addEventListener('click', () => {
          if (this.currentLandmark) {
            const coordsStr = window.MarsMapEngine.formatCoords(this.currentLandmark.lat, this.currentLandmark.lng);
            const text = `${this.currentLandmark.name}: ${coordsStr}`;
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(text).then(() => {
                const orig = this.dom.drawerCopyBtn.textContent;
                this.dom.drawerCopyBtn.textContent = 'COPIED!';
                setTimeout(() => this.dom.drawerCopyBtn.textContent = orig, 1800);
              }).catch(() => prompt('Coordinates:', text));
            } else {
              prompt('Coordinates:', text);
            }
          }
        });
      }

      // Tile Refresh Link & Retry Button
      if (this.dom.retryTileLink) {
        this.dom.retryTileLink.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.MarsLayers) window.MarsLayers.setBaseLayer(window.MarsLayers.activeLayerId);
        });
      }
      if (this.dom.retryInitBtn) {
        this.dom.retryInitBtn.addEventListener('click', () => {
          if (window.MarsLayers) window.MarsLayers.setBaseLayer(window.MarsLayers.activeLayerId);
        });
      }

      // Keyboard Shortcuts
      document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    },

    /**
     * Set Layer Opacity
     */
    setOpacity: function (val) {
      if (window.MarsLayers) window.MarsLayers.setSatelliteOpacity(val);

      const pct = Math.round(val * 100);
      if (this.dom.opacityValueDisplay) this.dom.opacityValueDisplay.textContent = `${pct}%`;
      if (this.dom.opacitySlider) this.dom.opacitySlider.value = val;

      if (this.dom.opacityPresetButtons) {
        this.dom.opacityPresetButtons.forEach((btn) => {
          const btnVal = parseFloat(btn.getAttribute('data-opacity'));
          btn.classList.toggle('active', Math.abs(btnVal - val) < 0.05);
        });
      }
    },

    toggleFullscreen: function () {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.warn(err));
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    },

    /**
     * Populate Quick Jump Dropdown
     */
    populateLandmarkDropdown: function (locations) {
      const select = this.dom.landmarkSelect;
      if (!select) return;

      select.innerHTML = '<option value="" disabled selected>Explore Location...</option>';
      locations.forEach((lm) => {
        const opt = document.createElement('option');
        opt.value = lm.id;
        opt.textContent = `${lm.name} (${lm.category})`;
        select.appendChild(opt);
      });
    },

    /**
     * Open Contextual Landmark Drawer
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
          card.className = 'd-stat-box';
          card.innerHTML = `
            <div class="d-stat-label">${formattedKey}</div>
            <div class="d-stat-val">${val}</div>
          `;
          d.drawerStatsGrid.appendChild(card);
        }
      }

      if (d.drawerSummary) d.drawerSummary.textContent = landmark.summary;
      if (d.drawerMission) d.drawerMission.textContent = `${landmark.mission} (Quad: ${landmark.quadrangle || 'Mars'})`;

      if (d.landmarkSelect) d.landmarkSelect.value = landmark.id;
      if (d.landmarkDrawer) d.landmarkDrawer.classList.add('open');
      if (d.mapClassificationHud) d.mapClassificationHud.classList.add('collapsed');
    },

    closeLandmarkDrawer: function () {
      this.currentLandmark = null;
      if (this.dom.landmarkDrawer) this.dom.landmarkDrawer.classList.remove('open');
      if (this.dom.landmarkSelect) this.dom.landmarkSelect.value = '';
      if (this.dom.mapClassificationHud) this.dom.mapClassificationHud.classList.remove('collapsed');
    },

    /**
     * Update Status Bar Telemetry & Map Buffering Overlay
     */
    setTileStatus: function (status, text) {
      if (this.dom.tileStatusBadge) {
        this.dom.tileStatusBadge.className = `badge-status ${status}`;
        this.dom.tileStatusBadge.textContent = text;
      }
      if (this.dom.liveDot) {
        this.dom.liveDot.className = `status-dot ${status === 'error' ? 'error' : status === 'loading' ? 'warning' : ''}`;
      }
      if (this.dom.liveStatusText) {
        this.dom.liveStatusText.textContent = (status === 'error') ? 'NETWORK DEGRADED' : (status === 'loading') ? 'BUFFERING' : 'STREAMING NOMINAL';
      }

      // Display In-Map Loading / Buffering Screen
      if (status === 'loading') {
        this.showBuffering(text);
      } else if (status === 'ready') {
        this.hideBuffering();
      } else if (status === 'error') {
        this.hideBuffering();
      }
    },

    /**
     * Show in-map telemetry buffering screen
     */
    showBuffering: function (text) {
      if (!this.dom.mapBufferingOverlay) return;
      if (this.dom.bufferingSubtitle && text) {
        this.dom.bufferingSubtitle.textContent = text;
      }
      this.dom.mapBufferingOverlay.classList.add('visible');

      // Safety timeout: automatically dismiss after 2.8s even if network is degraded
      if (this.bufferingTimer) clearTimeout(this.bufferingTimer);
      this.bufferingTimer = setTimeout(() => {
        this.hideBuffering();
      }, 2800);
    },

    /**
     * Hide in-map telemetry buffering screen
     */
    hideBuffering: function () {
      if (this.bufferingTimer) {
        clearTimeout(this.bufferingTimer);
        this.bufferingTimer = null;
      }
      if (this.dom.mapBufferingOverlay) {
        this.dom.mapBufferingOverlay.classList.remove('visible');
      }
    },

    /**
     * Loading Progress Updates
     */
    updateLoadingProgress: function (percentage, subtitle, stepLog) {
      if (this.dom.loadingProgressFill) this.dom.loadingProgressFill.style.width = `${percentage}%`;
      if (this.dom.loadingSubtitle && subtitle) this.dom.loadingSubtitle.textContent = subtitle;
      if (this.dom.loadingTelemetryLog && stepLog) {
        this.dom.loadingTelemetryLog.innerHTML += `<div>&gt; ${stepLog}</div>`;
      }
    },

    finishLoading: function () {
      this.updateLoadingProgress(100, 'SYSTEM READY — COMMAND CENTER ONLINE', 'Planetary telemetry mounted.');
      setTimeout(() => {
        if (this.dom.loadingOverlay) this.dom.loadingOverlay.classList.add('hidden');
      }, 500);
    },

    /**
     * Sol Clocks Engine
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
     * Keyboard Shortcuts Handler
     */
    handleKeyboardShortcuts: function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      switch (e.key.toLowerCase()) {
        case '+':
        case '=':
          if (window.MarsMapEngine && window.MarsMapEngine.map) window.MarsMapEngine.map.zoomIn();
          break;
        case '-':
        case '_':
          if (window.MarsMapEngine && window.MarsMapEngine.map) window.MarsMapEngine.map.zoomOut();
          break;
        case 'h':
        case 'r':
          if (window.MarsMapEngine) window.MarsMapEngine.resetGlobalView(true);
          break;
        case 'f':
          this.toggleFullscreen();
          break;
        case 'd':
          if (this.dom.toggleMeasureBtn) this.dom.toggleMeasureBtn.click();
          break;
        case 'z':
          if (e.ctrlKey && window.MarsApp && window.MarsApp.undoLastPoint) {
            e.preventDefault();
            window.MarsApp.undoLastPoint();
          }
          break;
        case 'escape':
          if (window.MarsApp && window.MarsApp.measureActive) {
            window.MarsApp.exitMeasure();
          }
          this.closeLandmarkDrawer();
          this.closeModal();
          if (this.dom.mapLayerDrawer) this.dom.mapLayerDrawer.classList.remove('open');
          break;
      }
    }
  };

  // Expose to window
  window.MarsUIControls = UIControls;

})(window);
