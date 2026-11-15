/**
 * ============================================================================
 * MARS EXPLORER COMMAND CENTER — Core Map Engine & Projection Configuration
 * Module: map.js
 * Non-Wrapping Planetary Mercator Projection (EPSG:3857)
 * ============================================================================
 */

(function (window) {
  'use strict';

  // Mars Geodetic Constants (IAU / USGS)
  const MARS_RADIUS_KM = 3389.5; // Mean volumetric Mars radius in kilometers

  // Strict Global Bounding Box in Web Mercator
  // Constrained to latitude [-85.05112878, 85.05112878] and longitude [-180, 180]
  const GLOBAL_MARS_BOUNDS = L.latLngBounds(
    L.latLng(-85.05112878, -180.0),
    L.latLng(85.05112878, 180.0)
  );

  // Mars Non-Wrapping Planetary Web Mercator CRS
  // Removing wrapLng strictly prevents horizontal world repeating
  const MarsPlanetaryCRS = L.extend({}, L.CRS.EPSG3857, {
    wrapLng: null,
    wrapLat: null,
    infinite: false
  });

  const MapEngine = {
    map: null,
    crs: MarsPlanetaryCRS,
    bounds: GLOBAL_MARS_BOUNDS,
    onMoveCallback: null,
    onMouseMoveCallback: null,
    onZoomCallback: null,

    /**
     * Initialize Leaflet map instance with strict planetary bounds & zero horizontal repetition
     */
    init: function (containerId, options = {}) {
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Map container #${containerId} not found.`);
      }

      this.map = L.map(containerId, {
        crs: MarsPlanetaryCRS,
        zoomControl: false,
        attributionControl: true,
        maxBounds: GLOBAL_MARS_BOUNDS,
        maxBoundsViscosity: 1.0, // 100% rigid boundary restraint: prevents panning outside bounds
        worldCopyJump: false,
        bounceAtZoomLimits: false,
        inertia: true,
        inertiaDeceleration: 3500,
        wheelPxPerZoomLevel: 100,
        zoomSnap: 0.25, // Smooth fractional zoom steps
        zoomDelta: 0.75,
        minZoom: 2,
        maxZoom: 11
      });

      // Style custom attribution
      this.map.attributionControl.setPrefix(
        '<span style="color:#D87932;font-weight:700;letter-spacing:0.5px;">MARS EXPLORER COMMAND CENTER</span>'
      );

      // Add official Leaflet Metric Scale
      L.control.scale({
        position: 'bottomright',
        imperial: false,
        maxWidth: 140
      }).addTo(this.map);

      // Fit entire global Mars surface into viewport on startup without world duplication
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
        padding: [0, 0],
        maxZoom: 3.5
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
     * Calculate Great Circle Geodesic Distance on Mars Spheroid using Haversine formula
     * Planetary Model: IAU/IAG 2015/2018 Recommended Mars Mean Volumetric Radius
     * R = 3,389.5 km = 3,389,500 meters
     *
     * Formula:
     *   deltaPhi = toRad(lat2 - lat1)
     *   deltaLambda = toRad(lon2 - lon1)
     *   a = sin^2(deltaPhi / 2) + cos(phi1) * cos(phi2) * sin^2(deltaLambda / 2)
     *   c = 2 * atan2(sqrt(a), sqrt(1 - a))
     *   d = R * c
     */
    calculateMarsDistanceMeters: function (lat1, lon1, lat2, lon2) {
      if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return 0;
      if (lat1 === lat2 && lon1 === lon2) return 0;

      const MARS_RADIUS_METERS = 3389500;
      const toRad = deg => (deg * Math.PI) / 180;
      const phi1 = toRad(lat1);
      const phi2 = toRad(lat2);
      const deltaPhi = toRad(lat2 - lat1);
      const deltaLambda = toRad(lon2 - lon1);

      const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

      const clampedA = Math.min(1, Math.max(0, a));
      const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
      return MARS_RADIUS_METERS * c;
    },

    calculateMarsDistanceKm: function (lat1, lon1, lat2, lon2) {
      return this.calculateMarsDistanceMeters(lat1, lon1, lat2, lon2) / 1000;
    },

    formatDistanceUnit: function (meters) {
      if (meters === null || meters === undefined || isNaN(meters)) {
        return { value: '0.0', unit: 'M', text: '0.0 m' };
      }
      if (meters < 1000) {
        return {
          value: meters.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
          unit: 'M',
          text: `${meters.toFixed(1)} m`
        };
      } else {
        const km = meters / 1000;
        const decimals = km < 100 ? 2 : 1;
        return {
          value: km.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
          unit: 'KM',
          text: `${km.toFixed(decimals)} km`
        };
      }
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
