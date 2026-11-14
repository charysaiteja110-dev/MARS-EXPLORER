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
     * Mars Geodesic Distance Tool
     */
    toggleMeasure: function () {
      this.measureActive = !this.measureActive;
      this.clearMeasure();

      const dom = MarsUIControls.dom;
      if (this.measureActive) {
        if (dom.toggleMeasureBtn) dom.toggleMeasureBtn.classList.add('active');
        if (dom.measureHud) dom.measureHud.classList.add('active');
        if (dom.measurePointsHint) dom.measurePointsHint.textContent = 'CLICK 1ST POINT ON MARS SURFACE';
        if (dom.measureDistanceVal) dom.measureDistanceVal.innerHTML = '0.0 <span class="measure-unit">KM</span>';
        document.getElementById('mars-map').style.cursor = 'crosshair';
      } else {
        if (dom.toggleMeasureBtn) dom.toggleMeasureBtn.classList.remove('active');
        if (dom.measureHud) dom.measureHud.classList.remove('active');
        document.getElementById('mars-map').style.cursor = '';
      }
    },

    handleMeasureClick: function (lat, lng) {
      if (!this.measureActive) return;

      this.measurePoints.push({ lat, lng });

      // Add point marker
      const ptIcon = L.divIcon({
        className: 'measure-pt-icon',
        html: '<div style="width:10px;height:10px;background:#ff784e;border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px #e25c34;"></div>',
        iconSize: [10, 10],
        iconAnchor: [5, 5]
      });

      const marker = L.marker([lat, lng], { icon: ptIcon });
      this.measureLayer.addLayer(marker);

      const dom = MarsUIControls.dom;
      if (this.measurePoints.length === 1) {
        if (dom.measurePointsHint) {
          const pt1Str = MarsMapEngine.formatCoords(lat, lng, 1);
          dom.measurePointsHint.textContent = `POINT 1 SET: ${pt1Str}. CLICK 2ND POINT.`;
        }
      } else if (this.measurePoints.length === 2) {
        const p1 = this.measurePoints[0];
        const p2 = this.measurePoints[1];

        // Draw geodesic line
        const polyline = L.polyline([
          [p1.lat, p1.lng],
          [p2.lat, p2.lng]
        ], {
          color: '#ff784e',
          weight: 3,
          dashArray: '6, 6',
          opacity: 0.95
        });
        this.measureLayer.addLayer(polyline);

        // Calculate Great Circle Distance on Mars Spheroid (Radius = 3389.5 km)
        const distKm = MarsMapEngine.calculateMarsDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng);

        if (dom.measureDistanceVal) {
          dom.measureDistanceVal.innerHTML = `${distKm.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span class="measure-unit">KM</span>`;
        }
        if (dom.measurePointsHint) {
          dom.measurePointsHint.textContent = `MARS SPHEROID DISTANCE (R=3,389.5 KM)`;
        }
      } else {
        // Reset and start new measurement
        this.clearMeasure();
        this.handleMeasureClick(lat, lng);
      }
    },

    clearMeasure: function () {
      this.measurePoints = [];
      if (this.measureLayer) {
        this.measureLayer.clearLayers();
      }
      const dom = MarsUIControls.dom;
      if (dom.measureDistanceVal) {
        dom.measureDistanceVal.innerHTML = '0.0 <span class="measure-unit">KM</span>';
      }
      if (dom.measurePointsHint) {
        dom.measurePointsHint.textContent = 'CLICK 1ST POINT ON MARS SURFACE';
      }
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

