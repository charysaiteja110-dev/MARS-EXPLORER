/**
 * ============================================================================
 * MARS EXPLORER COMMAND CENTER — Mars Terrain Intelligence Engine
 * Module: terrain-engine.js
 * Renders verified slope, rock abundance, sand morphology, surface units,
 * and explicit Unknown/No-Data polygon overlays on Leaflet.
 * Manages click interrogation and dynamic scientific map legends.
 * ============================================================================
 */

(function (window) {
  'use strict';

  const TerrainEngine = {
    map: null,
    activeSubLayer: 'all', // 'slope', 'rock', 'sand', 'surface', 'unknown', 'all'
    layerGroups: {
      slope: null,
      rock: null,
      sand: null,
      surface: null,
      unknown: null
    },
    masterGroup: null,
    inspectorPanel: null,
    activeInspectorMarker: null,

    /**
     * Initialize the Terrain Intelligence engine with the Leaflet map instance
     */
    init: function (map) {
      this.map = map;

      // Initialize Leaflet LayerGroups
      this.layerGroups.slope = L.layerGroup();
      this.layerGroups.rock = L.layerGroup();
      this.layerGroups.sand = L.layerGroup();
      this.layerGroups.surface = L.layerGroup();
      this.layerGroups.unknown = L.layerGroup();

      this.masterGroup = L.layerGroup([
        this.layerGroups.slope,
        this.layerGroups.rock,
        this.layerGroups.sand,
        this.layerGroups.surface,
        this.layerGroups.unknown
      ]).addTo(this.map);

      // Build vectors from TerrainIntelligenceData
      this.buildTerrainLayers();

      // Bind map click inspector
      this.bindClickInspector();

      // Create / Cache UI Inspector Panel in DOM
      this.initInspectorDOM();

      console.log('🏔️ Mars Terrain Intelligence Engine Initialized.');
    },

    /**
     * Builds Leaflet vector polygons and hazard zones from verified scientific datasets
     */
    buildTerrainLayers: function () {
      if (!window.TerrainIntelligenceData) return;
      const data = window.TerrainIntelligenceData;

      // 1. Unknown / No Data Zones (Distinct neutral pattern & border)
      data.unknownZones.forEach(unk => {
        const poly = L.rectangle(unk.bounds, {
          color: '#64748b',
          weight: 2,
          dashArray: '6, 6',
          fillColor: '#334155',
          fillOpacity: 0.45,
          interactive: true
        });

        poly.bindTooltip(`
          <div class="terrain-tooltip unknown">
            <span class="tooltip-badge">UNKNOWN / NO DATA</span>
            <strong>${unk.name}</strong>
            <p>${unk.reason}</p>
            <div class="tooltip-caution">⚠️ Missing data does not indicate safe terrain.</div>
          </div>
        `, { sticky: true, className: 'custom-leaflet-tooltip' });

        poly.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (window.MarsApp && window.MarsApp.measureActive) {
            window.MarsApp.handleMeasureClick(e.latlng.lat, e.latlng.lng);
            return;
          }
          this.inspectLocation(e.latlng.lat, e.latlng.lng);
        });

        this.layerGroups.unknown.addLayer(poly);
      });

      // 2. Calibrated Regional Polygons (Slope, Rock, Sand, Surface)
      data.calibratedRegions.forEach(reg => {
        // Slope Layer representation
        const slopeInfo = data.slopeScale[reg.slopeClass];
        const slopePoly = L.rectangle(reg.bounds, {
          color: slopeInfo.color,
          weight: 2,
          fillColor: slopeInfo.color,
          fillOpacity: 0.35,
          interactive: true
        });

        slopePoly.bindTooltip(`
          <div class="terrain-tooltip">
            <span class="tooltip-badge" style="background:${slopeInfo.color};color:#000;">SLOPE: ${slopeInfo.label}</span>
            <strong>${reg.name}</strong>
            <div>Measured Incline: <strong>${reg.slopeDeg}°</strong> (${slopeInfo.riskLevel})</div>
            <div class="tooltip-sub">Wheel Slip Rating: ${slopeInfo.wheelSlip}</div>
          </div>
        `, { sticky: true, className: 'custom-leaflet-tooltip' });

        slopePoly.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (window.MarsApp && window.MarsApp.measureActive) {
            window.MarsApp.handleMeasureClick(e.latlng.lat, e.latlng.lng);
            return;
          }
          this.inspectLocation(e.latlng.lat, e.latlng.lng);
        });
        this.layerGroups.slope.addLayer(slopePoly);

        // Rock Layer representation
        const rockInfo = data.rockAbundanceScale[reg.rockClass];
        const rockMarker = L.circle(reg.bounds[0], {
          radius: 35000,
          color: rockInfo.color,
          weight: 1.5,
          fillColor: rockInfo.color,
          fillOpacity: 0.28,
          dashArray: '4, 4'
        });
        rockMarker.bindTooltip(`
          <div class="terrain-tooltip">
            <span class="tooltip-badge" style="background:${rockInfo.color};color:#fff;">ROCK: ${rockInfo.label}</span>
            <strong>${reg.name}</strong>
            <div>CFA: <strong>${reg.rockAbundanceCFA}%</strong> (>10 cm)</div>
            <p>${rockInfo.description}</p>
          </div>
        `, { sticky: true, className: 'custom-leaflet-tooltip' });
        this.layerGroups.rock.addLayer(rockMarker);

        // Sand & Dune Hazard representation
        const sandInfo = data.sandMorphology[reg.sandType];
        const sandMarker = L.circle(reg.bounds[1], {
          radius: 25000,
          color: sandInfo.color,
          weight: 2,
          fillColor: sandInfo.color,
          fillOpacity: 0.4
        });
        sandMarker.bindTooltip(`
          <div class="terrain-tooltip">
            <span class="tooltip-badge" style="background:${sandInfo.color};color:#000;">SAND: ${sandInfo.name}</span>
            <strong>${reg.name}</strong>
            <div>Hazard: <strong>${sandInfo.riskLevel}</strong></div>
            <p>${sandInfo.hazardSummary}</p>
          </div>
        `, { sticky: true, className: 'custom-leaflet-tooltip' });
        this.layerGroups.sand.addLayer(sandMarker);

        // Surface Classification representation
        const surfInfo = data.surfaceUnits[reg.surfaceType];
        const surfPoly = L.rectangle(reg.bounds, {
          color: surfInfo.color,
          weight: 1,
          fillColor: surfInfo.color,
          fillOpacity: 0.2
        });
        surfPoly.bindTooltip(`
          <div class="terrain-tooltip">
            <span class="tooltip-badge" style="background:${surfInfo.color};color:#000;">SURFACE: ${surfInfo.name}</span>
            <strong>${reg.name}</strong>
            <div>Mobility: ${surfInfo.mobilityClass}</div>
          </div>
        `, { sticky: true, className: 'custom-leaflet-tooltip' });
        this.layerGroups.surface.addLayer(surfPoly);
      });
    },

    /**
     * Map Click Inspector binding
     */
    bindClickInspector: function () {
      this.map.on('click', (e) => {
        // If distance measurement is active, don't interrupt measurement
        if (window.MarsApp && window.MarsApp.measureActive) return;

        this.inspectLocation(e.latlng.lat, e.latlng.lng);
      });
    },

    /**
     * Interrogate and display terrain intelligence for given coordinate
     */
    inspectLocation: function (lat, lng) {
      if (!window.TerrainIntelligenceData) return;
      const report = window.TerrainIntelligenceData.queryTerrain(lat, lng);

      // Place visual pulse inspection pin on map
      if (this.activeInspectorMarker) {
        this.map.removeLayer(this.activeInspectorMarker);
      }

      const pulseIcon = L.divIcon({
        className: 'terrain-inspect-pin',
        html: `
          <div class="inspect-pin-pulse"></div>
          <div class="inspect-pin-dot"></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      this.activeInspectorMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(this.map);

      // Render side panel
      this.renderInspectorPanel(report);
    },

    /**
     * Initialize Inspector DOM elements
     */
    initInspectorDOM: function () {
      let panel = document.getElementById('terrain-intelligence-panel');
      if (!panel) {
        panel = document.createElement('aside');
        panel.id = 'terrain-intelligence-panel';
        panel.className = 'terrain-intelligence-panel hidden';
        panel.setAttribute('aria-label', 'Mars Terrain Intelligence Inspector');

        const mapContainer = document.querySelector('.map-central-viewport');
        if (mapContainer) {
          mapContainer.appendChild(panel);
        } else {
          document.body.appendChild(panel);
        }
      }
      this.inspectorPanel = panel;
    },

    /**
     * Render the Terrain Intelligence Side Panel
     */
    renderInspectorPanel: function (report) {
      if (!this.inspectorPanel) return;

      const latDir = report.lat >= 0 ? 'N' : 'S';
      const lngDir = report.lng >= 0 ? 'E' : 'W';
      const formattedCoord = `${Math.abs(report.lat).toFixed(4)}° ${latDir}, ${Math.abs(report.lng).toFixed(4)}° ${lngDir}`;

      // Status pill styling
      let statusClass = 'available';
      if (report.isUnknown) statusClass = 'unknown';
      else if (report.status.includes('Baseline')) statusClass = 'baseline';

      const elevationText = report.elevationMeters != null
        ? `${report.elevationMeters > 0 ? '+' : ''}${Math.round(report.elevationMeters).toLocaleString()} m (Areoid Datum)`
        : '<span class="val-unavailable">Data unavailable</span>';

      const slopeText = report.slopeDeg != null
        ? `${report.slopeDeg.toFixed(1)}° (${report.slopeScaleItem ? report.slopeScaleItem.label : 'Measured'})`
        : '<span class="val-unavailable">Data unavailable</span>';

      this.inspectorPanel.innerHTML = `
        <div class="panel-header">
          <div class="panel-header-titles">
            <span class="panel-tag">TERRAIN INTELLIGENCE INSPECTOR</span>
            <h3 class="panel-title">${report.name}</h3>
            <div class="panel-coords">${formattedCoord}</div>
          </div>
          <button id="close-terrain-panel-btn" class="panel-close-btn" aria-label="Close Inspector">&times;</button>
        </div>

        <div class="panel-body">
          <!-- Availability & Concern Status -->
          <div class="status-banner ${statusClass}">
            <div class="status-indicator-dot"></div>
            <div class="status-banner-text">
              <strong>${report.status}</strong>
              <div class="status-sub">${report.concernReason}</div>
            </div>
          </div>

          <!-- Primary Metric Cards -->
          <div class="inspector-metrics-grid">
            <div class="metric-card">
              <span class="m-label">Elevation</span>
              <span class="m-val">${elevationText}</span>
              <span class="m-sub">Datum: 610.0 Pa (0 m)</span>
            </div>

            <div class="metric-card">
              <span class="m-label">Slope Gradient</span>
              <span class="m-val">${slopeText}</span>
              <span class="m-sub">${report.slopeScaleItem ? report.slopeScaleItem.riskLevel : 'Limitation applied'}</span>
            </div>
          </div>

          <!-- Detailed Observations -->
          <div class="inspector-section">
            <h4 class="section-title">Rock & Boulder Observations</h4>
            <div class="observation-box">
              <div class="obs-icon rock-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <div class="obs-content">
                <strong>Rock Abundance:</strong>
                <p>${report.rockObservations}</p>
              </div>
            </div>
          </div>

          <div class="inspector-section">
            <h4 class="section-title">Sand & Dune Morphology</h4>
            <div class="observation-box">
              <div class="obs-icon sand-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"></path><path d="M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"></path></svg>
              </div>
              <div class="obs-content">
                <strong>Aeolian Formation:</strong>
                <p>${report.sandObservations}</p>
              </div>
            </div>
          </div>

          <div class="inspector-section">
            <h4 class="section-title">Surface Classification</h4>
            <div class="observation-box">
              <div class="obs-icon surface-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              </div>
              <div class="obs-content">
                <strong>Geological Unit:</strong>
                <p>${report.surfaceClassification}</p>
              </div>
            </div>
          </div>

          <!-- Scientific Provenance & Limitations -->
          <div class="provenance-section">
            <div class="prov-row">
              <span class="prov-lbl">Data Provenance:</span>
              <span class="prov-val">${report.dataProvenance}</span>
            </div>
            <div class="prov-row">
              <span class="prov-lbl">Data Confidence:</span>
              <span class="prov-val">${report.dataConfidence}</span>
            </div>
            <div class="prov-alert">
              <strong>Scientific Limitations:</strong>
              <p>${report.limitations}</p>
            </div>
          </div>
        </div>
      `;

      this.inspectorPanel.classList.remove('hidden');

      // Bind close button
      const closeBtn = document.getElementById('close-terrain-panel-btn');
      if (closeBtn) {
        closeBtn.onclick = () => this.closeInspector();
      }
    },

    closeInspector: function () {
      if (this.inspectorPanel) {
        this.inspectorPanel.classList.add('hidden');
      }
      if (this.activeInspectorMarker && this.map) {
        this.map.removeLayer(this.activeInspectorMarker);
        this.activeInspectorMarker = null;
      }
    },

    /**
     * Filter active terrain sublayer ('all', 'slope', 'rock', 'sand', 'surface', 'unknown')
     */
    setSubLayer: function (subLayer) {
      this.activeSubLayer = subLayer;
      Object.keys(this.layerGroups).forEach(key => {
        if (subLayer === 'all' || subLayer === key) {
          if (!this.masterGroup.hasLayer(this.layerGroups[key])) {
            this.masterGroup.addLayer(this.layerGroups[key]);
          }
        } else {
          if (this.masterGroup.hasLayer(this.layerGroups[key])) {
            this.masterGroup.removeLayer(this.layerGroups[key]);
          }
        }
      });
      this.updateDynamicLegend();
    },

    toggleLayerGroup: function (layerKey, visible) {
      if (!this.layerGroups[layerKey]) return;
      if (visible) {
        this.masterGroup.addLayer(this.layerGroups[layerKey]);
      } else {
        this.masterGroup.removeLayer(this.layerGroups[layerKey]);
      }
      this.updateDynamicLegend();
    },

    /**
     * Updates the bottom dynamic legend bar
     */
    updateDynamicLegend: function () {
      const legendBar = document.getElementById('dynamic-legend-bar');
      if (!legendBar) return;

      legendBar.innerHTML = `
        <div class="dynamic-terrain-legend">
          <span class="legend-title">TERRAIN SCALE:</span>
          <div class="legend-scale-chips">
            <span class="scale-chip" style="border-left: 3px solid #22c55e;">Flat (0°–4°)</span>
            <span class="scale-chip" style="border-left: 3px solid #14b8a6;">Gentle (4°–8°)</span>
            <span class="scale-chip" style="border-left: 3px solid #facc15;">Caution (8°–12°)</span>
            <span class="scale-chip" style="border-left: 3px solid #f97316;">Steep (12°–16°)</span>
            <span class="scale-chip" style="border-left: 3px solid #ef4444;">Critical (>16°)</span>
            <span class="scale-chip" style="border-left: 3px solid #64748b; background: rgba(51,65,85,0.4);">Unknown / No Data</span>
          </div>
        </div>
      `;
    }
  };

  window.TerrainEngine = TerrainEngine;
})(window);

