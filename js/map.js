/**
 * ============================================================================
 * MARS EXPLORER PRO — Core Map Engine & Projection Configuration
 * Module: map.js
 * ============================================================================
 */

(function (window) {
  'use strict';

  // Mars Geodetic Constants
  const MARS_RADIUS_KM = 3389.5; // Mean volumetric radius (IAU / USGS)

  // Strict Global Bounding Box in Web Mercator EPSG:3857
  const GLOBAL_MARS_BOUNDS = L.latLngBounds(
    L.latLng(-85.05112878, -180),
    L.latLng(85.05112878, 180)
  );

  const MapEngine = {
    map: null,
    bounds: GLOBAL_MARS_BOUNDS,
    onMoveCallback: null,
    onMouseMoveCallback: null,
    onZoomCallback: null,

    /**
     * Initialize Leaflet map instance with full global extent & no repetition
     */
    init: function (containerId, options = {}) {
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Map container #${containerId} not found.`);
      }

      this.map = L.map(containerId, {
        crs: L.CRS.EPSG3857,
        zoomControl: false,
        attributionControl: true,
        maxBounds: GLOBAL_MARS_BOUNDS,
        maxBoundsViscosity: 1.0,
        worldCopyJump: false,
        bounceAtZoomLimits: false,
        inertia: true,
        inertiaDeceleration: 3000,
        wheelPxPerZoomLevel: 100,
        zoomSnap: 0.5,
        zoomDelta: 1.0,
        minZoom: 2,
        maxZoom: 11
      });

      // Style custom attribution
      this.map.attributionControl.setPrefix(
        '<span style="color:#e25c34;font-weight:700;">MARS EXPLORER PRO</span>'
      );

      // Add official Leaflet Metric Scale
      L.control.scale({
        position: 'bottomright',
        imperial: false,
        maxWidth: 140
      }).addTo(this.map);

      // Fit entire global Mars surface into viewport on startup
      this.resetGlobalView(false);

      // Bind coordinate tracking events
      this.bindEvents();

      // Handle window resizing
      window.addEventListener('resize', () => {
        if (this.map) {
          this.map.invalidateSize();
        }
      });

      return this.map;
    },

    /**
     * Reset map view to the complete global Mars extent
     */
    resetGlobalView: function (animate = true) {
      if (!this.map) return;
      this.map.fitBounds(this.bounds, {
        animate: animate,
        duration: 1.2,
        padding: [0, 0]
      });
    },

    /**
     * Bind map tracking events with 60fps frame debouncing
     */
    bindEvents: function () {
      const map = this.map;
      let mouseRaf = null;
      let moveRaf = null;

      // Mousemove coordinate tracking
      map.on('mousemove', (e) => {
        if (mouseRaf) return;
        mouseRaf = window.requestAnimationFrame(() => {
          if (typeof this.onMouseMoveCallback === 'function') {
            this.onMouseMoveCallback(e.latlng.lat, e.latlng.lng);
          }
          mouseRaf = null;
        });
      });

      // Pan & drag center tracking
      map.on('move', () => {
        if (moveRaf) return;
        moveRaf = window.requestAnimationFrame(() => {
          const center = map.getCenter();
          if (typeof this.onMoveCallback === 'function') {
            this.onMoveCallback(center.lat, center.lng);
          }
          moveRaf = null;
        });
      });

      // Zoom level tracking
      map.on('zoomend', () => {
        const zoom = map.getZoom();
        if (typeof this.onZoomCallback === 'function') {
          this.onZoomCallback(zoom);
        }
      });
    },

    /**
     * Calculate Great Circle Distance on Mars Spheroid using Haversine formula
     */
    calculateMarsDistanceKm: function (lat1, lon1, lat2, lon2) {
      const toRad = deg => (deg * Math.PI) / 180;
      const phi1 = toRad(lat1);
      const phi2 = toRad(lat2);
      const deltaPhi = toRad(lat2 - lat1);
      const deltaLambda = toRad(lon2 - lon1);

      const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return MARS_RADIUS_KM * c;
    },

    /**
     * Format coordinates in planetary quadrant notation
     * e.g. 18.6500° N, 133.8000° W
     */
    formatCoords: function (lat, lng, decimals = 4) {
      if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
        return '0.0000° N, 0.0000° E';
      }

      let normLng = ((((lng + 180) % 360) + 360) % 360) - 180;
      let normLat = Math.max(-90, Math.min(90, lat));

      const latDir = normLat >= 0 ? 'N' : 'S';
      const lngDir = normLng >= 0 ? 'E' : 'W';

      const latStr = Math.abs(normLat).toFixed(decimals);
      const lngStr = Math.abs(normLng).toFixed(decimals);

      return `${latStr}° ${latDir}, ${lngStr}° ${lngDir}`;
    }
  };

  // Expose to window
  window.MarsMapEngine = MapEngine;

})(window);
