/**
 * ============================================================================
 * MARS EXPLORER PRO — Application Orchestrator & Bootstrapper
 * Module: app.js
 * ============================================================================
 */

(function (window) {
  'use strict';

  const MarsApp = {
    measureActive: false,
    measurePoints: [],
    measureLayer: null,
    graticuleLayer: null,
    showGraticule: false,
    initialTilesLoaded: false,

    /**
     * Start the application
     */
    init: function () {
      console.log('🚀 MARS EXPLORER PRO — Bootstrapping Planetary GIS Engine...');

      // 1. Initialize Leaflet Map Canvas with Global Extent
      MarsUIControls.updateLoadingProgress(20, 'INITIALIZING MARS GLOBAL CARTOGRAPHY ENGINE...', 'Binding Web Mercator EPSG:3857 projection');
      const map = MarsMapEngine.init('mars-map');

      // 2. Initialize Planetary Cartography Layers
      MarsUIControls.updateLoadingProgress(45, 'CONNECTING TO PLANETARY DATASETS...', 'Mounting OpenPlanetaryMap Mars Basemap v0.2');
      MarsLayers.init(map, (status, text) => {
        MarsUIControls.setTileStatus(status, text);
        if (status === 'ready' && !this.initialTilesLoaded) {
          this.initialTilesLoaded = true;
          MarsUIControls.finishLoading();
        }
      });

      // 3. Initialize Verified Martian Landmarks
      MarsUIControls.updateLoadingProgress(70, 'CALIBRATING TOPOGRAPHIC LANDMARKS...', 'Registering USGS / NASA MRO exploration sites');
      MarsLocations.init(map, (landmark) => {
        MarsUIControls.openLandmarkDrawer(landmark);
      });

      // 4. Initialize UI Controls & HUD
      MarsUIControls.init();
      MarsUIControls.populateLandmarkDropdown(MarsLocations.locations);

      // 5. Initialize Measurement Layer
      this.measureLayer = L.layerGroup().addTo(map);

      // 5b. Initialize Mars Terrain Intelligence Subsystem
      if (window.TerrainEngine) {
        window.TerrainEngine.init(map);
      }

      // 5c. Initialize Historical Rover Routes Subsystem
      if (window.RoverRoutesEngine) {
        window.RoverRoutesEngine.init(map);
      }

      // 6. Connect Map Telemetry Callbacks to UI
      this.bindTelemetryCallbacks();

      // 7. Safety timeout: guarantee loading screen dismisses even under high network latency
      setTimeout(() => {
        if (!this.initialTilesLoaded) {
          this.initialTilesLoaded = true;
          MarsUIControls.finishLoading();
        }
      }, 4200);

      console.log('🛰️ Mars Explorer Pro Initialized Successfully.');
    },

    /**
     * Connect real-time coordinates and zoom tracking
     */
    bindTelemetryCallbacks: function () {
      // Cursor Coordinates
      MarsMapEngine.onMouseMoveCallback = (lat, lng) => {
        const formatted = MarsMapEngine.formatCoords(lat, lng, 4);
        if (MarsUIControls.dom.cursorCoords) {
          MarsUIControls.dom.cursorCoords.textContent = formatted;
        }
      };

      // Map Center Coordinates
      MarsMapEngine.onMoveCallback = (lat, lng) => {
        const formatted = MarsMapEngine.formatCoords(lat, lng, 4);
        if (MarsUIControls.dom.centerCoords) {
          MarsUIControls.dom.centerCoords.textContent = formatted;
        }
      };

      // Zoom Scale Descriptor
      MarsMapEngine.onZoomCallback = (zoom) => {
        if (MarsUIControls.dom.zoomLevelBadge) {
          MarsUIControls.dom.zoomLevelBadge.textContent = `LVL ${Math.round(zoom)}`;
        }
        if (MarsUIControls.dom.zoomReadout) {
          let descriptor = 'Planetary';
          if (zoom >= 8) descriptor = 'Local Crater';
          else if (zoom >= 5) descriptor = 'Regional Chasma';
          else if (zoom >= 3) descriptor = 'Continental Basin';
          MarsUIControls.dom.zoomReadout.textContent = `Level ${zoom.toFixed(1)} (${descriptor})`;
        }
      };

      // Handle map clicks for measurement tool
      MarsMapEngine.map.on('click', (e) => {
        if (this.measureActive) {
          this.handleMeasureClick(e.latlng.lat, e.latlng.lng);
        }
      });
    },

    /**
     * =========================================================================
     * MARS GEODESIC DISTANCE MEASUREMENT ENGINE (IAU 2015/2018 MODEL)
     * R = 3,389,500 m (3,389.5 km)
     * Multi-point path, segment distance, undo, finish, and clear controls
     * =========================================================================
     */
    measureActive: false,
    measureFinished: false,
    measurePoints: [],

    toggleMeasure: function () {
      if (this.measureActive) {
        this.exitMeasure();
      } else {
        this.startMeasure();
      }
    },

    startMeasure: function () {
      this.measureActive = true;
      this.measureFinished = false;
      this.clearMeasure();

      const dom = MarsUIControls.dom;
      if (dom.toggleMeasureBtn) dom.toggleMeasureBtn.classList.add('active');
      if (dom.measureHud) dom.measureHud.classList.add('active');

      const mapEl = document.getElementById('mars-map');
      if (mapEl) mapEl.style.cursor = 'crosshair';

      // Disable double click zoom during measurement so double-clicking adds points without zooming
      if (MarsMapEngine.map && MarsMapEngine.map.doubleClickZoom) {
        MarsMapEngine.map.doubleClickZoom.disable();
      }
    },

    exitMeasure: function () {
      this.measureActive = false;
      this.measureFinished = false;
      this.clearMeasure();

      const dom = MarsUIControls.dom;
      if (dom.toggleMeasureBtn) dom.toggleMeasureBtn.classList.remove('active');
      if (dom.measureHud) dom.measureHud.classList.remove('active');

      const mapEl = document.getElementById('mars-map');
      if (mapEl) mapEl.style.cursor = '';

      // Re-enable double click zoom
      if (MarsMapEngine.map && MarsMapEngine.map.doubleClickZoom) {
        MarsMapEngine.map.doubleClickZoom.enable();
      }
    },

    handleMeasureClick: function (lat, lng) {
      if (!this.measureActive) return;

      // Normalize longitude to [-180, 180] and latitude to Web Mercator bounds
      const normLng = ((((lng + 180) % 360) + 360) % 360) - 180;
      const normLat = Math.max(-85.0511, Math.min(85.0511, lat));

      // If user previously finished the measurement, clicking on the map restarts a fresh path
      if (this.measureFinished) {
        this.clearMeasure();
      }

      // Prevent accidental jitter or duplicate clicks within 5 meters of previous point
      if (this.measurePoints.length > 0) {
        const last = this.measurePoints[this.measurePoints.length - 1];
        const distToLast = MarsMapEngine.calculateMarsDistanceMeters(last.lat, last.lng, normLat, normLng);
        if (distToLast < 5) {
          return;
        }
      }

      this.measurePoints.push({ lat: normLat, lng: normLng });
      this.renderMeasureVisuals();
      this.updateMeasureHUD();
    },

    renderMeasureVisuals: function () {
      if (!this.measureLayer) return;
      this.measureLayer.clearLayers();

      const pts = this.measurePoints;
      if (pts.length === 0) return;

      // 1. Draw High-Contrast Path Polylines (outer contrast border + inner dashed line)
      if (pts.length >= 2) {
        const latlngs = pts.map(p => [p.lat, p.lng]);

        const shadowLine = L.polyline(latlngs, {
          color: '#000000',
          weight: 6,
          opacity: 0.7,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false
        });
        this.measureLayer.addLayer(shadowLine);

        const mainLine = L.polyline(latlngs, {
          color: '#ff784e',
          weight: 3,
          dashArray: '6, 6',
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false
        });
        this.measureLayer.addLayer(mainLine);
      }

      // 2. Draw Waypoint Numbered Markers
      pts.forEach((p, idx) => {
        const isStart = idx === 0;
        const isLast = idx === pts.length - 1 && !this.measureFinished;

        let pillClass = 'm-point-pill';
        if (isStart) pillClass += ' start';
        else if (isLast) pillClass += ' current';

        const iconHtml = `
          <div class="${pillClass}">
            ${idx + 1}
            ${isLast ? '<span class="m-point-pulse"></span>' : ''}
          </div>
        `;

        const icon = L.divIcon({
          className: 'measure-marker-icon',
          html: iconHtml,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker([p.lat, p.lng], {
          icon: icon,
          interactive: true
        });

        // Tooltip displaying coordinates and segment distance
        let tooltip = `<strong>Point ${idx + 1}</strong>: ${MarsMapEngine.formatCoords(p.lat, p.lng, 2)}`;
        if (idx > 0) {
          const segMeters = MarsMapEngine.calculateMarsDistanceMeters(pts[idx - 1].lat, pts[idx - 1].lng, p.lat, p.lng);
          const segFmt = MarsMapEngine.formatDistanceUnit(segMeters);
          tooltip += `<br>Segment: <strong>${segFmt.text}</strong>`;
        }
        marker.bindTooltip(tooltip, { className: 'custom-leaflet-tooltip' });

        this.measureLayer.addLayer(marker);
      });
    },

    updateMeasureHUD: function () {
      const dom = MarsUIControls.dom;
      const pts = this.measurePoints;

      // Calculate total cumulative distance and latest segment distance
      let totalMeters = 0;
      let lastSegMeters = 0;

      for (let i = 1; i < pts.length; i++) {
        const seg = MarsMapEngine.calculateMarsDistanceMeters(pts[i - 1].lat, pts[i - 1].lng, pts[i].lat, pts[i].lng);
        totalMeters += seg;
        if (i === pts.length - 1) {
          lastSegMeters = seg;
        }
      }

      const totalFmt = MarsMapEngine.formatDistanceUnit(totalMeters);
      const segFmt = pts.length >= 2 ? MarsMapEngine.formatDistanceUnit(lastSegMeters) : null;

      // Update Total Distance Readout
      if (dom.measureDistanceVal) {
        dom.measureDistanceVal.innerHTML = `${totalFmt.value} <span class="m-unit">${totalFmt.unit}</span>`;
      }

      // Update Segment Distance Readout
      if (dom.measureSegmentVal) {
        dom.measureSegmentVal.textContent = segFmt ? `${segFmt.value} ${segFmt.unit}` : '—';
      }

      // Update Point Count
      if (dom.measureCountVal) {
        dom.measureCountVal.textContent = `${pts.length} pt${pts.length === 1 ? '' : 's'}`;
      }

      // Update Status Badge
      if (dom.measureStatusBadge) {
        if (this.measureFinished) {
          dom.measureStatusBadge.className = 'm-status-badge finished';
          dom.measureStatusBadge.textContent = 'FINISHED';
        } else if (pts.length > 0) {
          dom.measureStatusBadge.className = 'm-status-badge active';
          dom.measureStatusBadge.textContent = `POINT ${pts.length}`;
        } else {
          dom.measureStatusBadge.className = 'm-status-badge';
          dom.measureStatusBadge.textContent = 'READY';
        }
      }

      // Update Guidance Hint
      if (dom.measurePointsHint) {
        if (this.measureFinished) {
          dom.measurePointsHint.textContent = `PATH COMPLETE (${pts.length} WAYPOINTS). CLICK 'CLEAR' OR 'EXIT'.`;
        } else if (pts.length === 0) {
          dom.measurePointsHint.textContent = 'CLICK ON MARS SURFACE TO SET FIRST POINT';
        } else if (pts.length === 1) {
          const p1Str = MarsMapEngine.formatCoords(pts[0].lat, pts[0].lng, 1);
          dom.measurePointsHint.textContent = `POINT 1 SET: ${p1Str}. CLICK NEXT TARGET.`;
        } else {
          dom.measurePointsHint.textContent = `PATH ACTIVE (${pts.length} PTS). CLICK NEXT POINT, OR 'FINISH'.`;
        }
      }
    },

    undoLastPoint: function () {
      if (!this.measureActive || this.measurePoints.length === 0) return;
      this.measurePoints.pop();
      this.measureFinished = false;
      this.renderMeasureVisuals();
      this.updateMeasureHUD();
    },

    finishMeasure: function () {
      if (!this.measureActive) return;
      if (this.measurePoints.length < 2) {
        if (MarsUIControls.dom.measurePointsHint) {
          MarsUIControls.dom.measurePointsHint.textContent = 'NEED AT LEAST 2 POINTS TO COMPLETE MEASUREMENT';
        }
        return;
      }
      this.measureFinished = true;
      this.renderMeasureVisuals();
      this.updateMeasureHUD();
    },

    clearMeasure: function () {
      this.measurePoints = [];
      this.measureFinished = false;
      if (this.measureLayer) {
        this.measureLayer.clearLayers();
      }
      this.updateMeasureHUD();
    },

    /**
     * Graticule Coordinate Grid Lines
     */
    toggleGraticule: function (show) {
      this.showGraticule = show;
      const map = MarsMapEngine.map;

      if (this.graticuleLayer) {
        map.removeLayer(this.graticuleLayer);
        this.graticuleLayer = null;
      }

      if (!show) return;

      this.graticuleLayer = L.layerGroup();

      // Latitudes every 30 degrees (-60, -30, 0, 30, 60)
      for (let lat = -60; lat <= 60; lat += 30) {
        const latLine = L.polyline([[lat, -180], [lat, 180]], {
          color: 'rgba(226, 92, 52, 0.28)',
          weight: 1,
          dashArray: '4, 8'
        });
        this.graticuleLayer.addLayer(latLine);
      }

      // Longitudes every 45 degrees (-180 to 180)
      for (let lng = -180; lng <= 180; lng += 45) {
        const lngLine = L.polyline([[-85, lng], [85, lng]], {
          color: 'rgba(226, 92, 52, 0.28)',
          weight: 1,
          dashArray: '4, 8'
        });
        this.graticuleLayer.addLayer(lngLine);
      }

      this.graticuleLayer.addTo(map);
    }
  };

  // Expose to window
  window.MarsApp = MarsApp;

  // Bootstrap when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MarsApp.init());
  } else {
    MarsApp.init();
  }

})(window);

