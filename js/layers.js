/**
 * ============================================================================
 * MARS EXPLORER PRO — Planetary Cartography & Imagery Layers Engine
 * Module: layers.js
 * ============================================================================
 */

(function (window) {
  'use strict';

  // Strict Global Planetary Bounds
  const PLANETARY_BOUNDS = L.latLngBounds(
    L.latLng(-85.05112878, -180),
    L.latLng(85.05112878, 180)
  );

  // Custom Leaflet TileLayer for Mars Equirectangular & ArcGISTile Schemas
  const PlanetaryEquirectTileLayer = L.TileLayer.extend({
    getTileUrl: function (coords) {
      const z = coords.z;
      const maxCol = Math.pow(2, z) - 1;

      // Reject tiles outside the horizontal world bounds
      if (coords.x < 0 || coords.x > maxCol || coords.y < 0 || coords.y > maxCol) {
        return '';
      }

      // Convert Mercator tile coordinates to geographic lat/lng bounds
      const bounds = this._tileCoordsToBounds(coords);
      const center = bounds.getCenter();

      let lng = ((((center.lng + 180) % 360) + 360) % 360) - 180;
      let lat = Math.max(-85.0511, Math.min(85.0511, center.lat));

      // Equirectangular Tile Matrix Set (2 cols x 1 row at Level 0)
      const matrixZoom = Math.max(0, Math.min(this.options.maxNativeZoom || 8, Math.max(0, z - 1)));
      const totalCols = Math.pow(2, matrixZoom + 1);
      const totalRows = Math.pow(2, matrixZoom);

      let col = Math.floor(((lng + 180) / 360) * totalCols);
      let row = Math.floor(((90 - lat) / 180) * totalRows);

      col = Math.max(0, Math.min(totalCols - 1, col));
      row = Math.max(0, Math.min(totalRows - 1, row));

      return L.Util.template(this._url, {
        z: matrixZoom,
        y: row,
        x: col
      });
    }
  });

  // Layer Catalog & Planetary Dataset Specifications
  const LAYER_DEFINITIONS = {
    'global-surface': {
      id: 'global-surface',
      name: 'Global Surface',
      category: 'Cartographic Basemap',
      dataset: 'OpenPlanetaryMap Mars Basemap v0.2',
      resolution: 'Global Multi-Scale (MOLA / USGS)',
      url: 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openplanetary.org/opm" target="_blank" rel="noopener">OpenPlanetaryMap</a> | NASA / USGS / MOLA / CARTO',
      minZoom: 2,
      maxZoom: 9,
      maxNativeZoom: 8,
      isEquirect: false,
      badge: 'OPM v0.2',
      description: 'The official OpenPlanetaryMap global Mars basemap, integrating USGS Astrogeology nomenclature, MOLA topography, and shaded relief in Web Mercator.'
    },

    'satellite-imagery': {
      id: 'satellite-imagery',
      name: 'Satellite Imagery',
      category: 'Orbital Reconnaissance Mosaic',
      dataset: 'Caltech Global CTX Mosaic of Mars (V01)',
      resolution: '~5.0 meters / pixel (88°S to 88°N)',
      url: 'https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX1/MapServer/tile/{z}/{y}/{x}',
      fallbackUrl: 'https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer/tile/{z}/{y}/{x}',
      attribution: 'NASA / JPL-Caltech / MSSS / The Murray Lab / Esri Astro (Context Camera MRO)',
      minZoom: 2,
      maxZoom: 10,
      maxNativeZoom: 8,
      isEquirect: true,
      badge: 'MRO CTX 5m',
      description: '5.7-terapixel seamless orbital mosaic produced by Caltech\'s Bruce Murray Lab from 86,571 NASA MRO Context Camera (CTX) images covering 99.5% of Mars.'
    },

    'mola-elevation': {
      id: 'mola-elevation',
      name: 'Color MOLA Elevation',
      category: 'Topographic Altimetry',
      dataset: 'Mars MGS MOLA Global Color Shaded Relief 463m',
      resolution: '463 meters / pixel (128 ppd)',
      url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
      attribution: 'NASA / USGS Astrogeology Science Center / MGS MOLA Science Team',
      minZoom: 2,
      maxZoom: 8,
      maxNativeZoom: 7,
      isEquirect: true,
      badge: 'MOLA Topo',
      description: 'Global topography color-coded by elevation referenced to the Martian areoid datum, based on 600M+ laser altimeter pulses from Mars Global Surveyor.'
    },

    'mola-hillshade': {
      id: 'mola-hillshade',
      name: 'MOLA Hillshade',
      category: 'Terrain Morphology',
      dataset: 'Mars MOLA & MEX HRSC Blended Shaded Relief 200m',
      resolution: '200 meters / pixel',
      url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MOLA_blend200ppx_HRSC_Shade_clon0dd_200mpp_lzw/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
      attribution: 'NASA / USGS Astrogeology / ESA Mars Express HRSC Team',
      minZoom: 2,
      maxZoom: 8,
      maxNativeZoom: 7,
      isEquirect: true,
      badge: 'Shaded Relief',
      description: 'High-precision grayscale shaded relief blending MGS laser altimetry with ESA Mars Express High-Resolution Stereo Camera terrain models.'
    },

    'viking-imagery': {
      id: 'viking-imagery',
      name: 'Viking MDIM2.1',
      category: 'Orbital Photomosaic',
      dataset: 'Mars Viking Orbiter MDIM 2.1 Color Global Mosaic',
      resolution: '232 meters / pixel (256 ppd)',
      url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
      attribution: 'NASA / USGS Astrogeology Science Center / Viking Orbiter Mosaic',
      minZoom: 2,
      maxZoom: 8,
      maxNativeZoom: 7,
      isEquirect: true,
      badge: 'Viking Color',
      description: 'Geodetically controlled color mosaic constructed from thousands of orbital images captured by NASA\'s twin Viking Orbiters.'
    }
  };

  // Layers Manager Object
  const LayersManager = {
    definitions: LAYER_DEFINITIONS,
    activeLayerId: 'global-surface',
    activeBaseLayer: null,
    overlayLayer: null,
    overlayActive: false,
    overlayOpacity: 1.0,
    map: null,
    onStatusChange: null,

    /**
     * Initialize Layer Manager with map instance
     */
    init: function (map, onStatusChangeCallback) {
      this.map = map;
      this.onStatusChange = onStatusChangeCallback;

      // Set initial base layer
      this.setBaseLayer('global-surface');
    },

    /**
     * Create a Leaflet tile layer instance from a layer definition
     */
    createTileLayer: function (def, options = {}) {
      const tileOptions = {
        minZoom: def.minZoom,
        maxZoom: def.maxZoom,
        maxNativeZoom: def.maxNativeZoom,
        attribution: def.attribution,
        noWrap: true, // Prevents horizontal repetition
        bounds: PLANETARY_BOUNDS, // Strictly limits tiles to [-85.05, -180] to [85.05, 180]
        crossOrigin: true,
        ...options
      };

      let layerInstance;
      if (def.isEquirect) {
        layerInstance = new PlanetaryEquirectTileLayer(def.url, tileOptions);
      } else {
        layerInstance = L.tileLayer(def.url, tileOptions);
      }

      // Tile Event Listeners
      layerInstance.on('loading', () => {
        if (typeof this.onStatusChange === 'function') {
          this.onStatusChange('loading', 'BUFFERING TILES...');
        }
      });

      layerInstance.on('load', () => {
        if (typeof this.onStatusChange === 'function') {
          this.onStatusChange('ready', 'STREAMING NOMINAL');
        }
      });

      layerInstance.on('tileerror', (err) => {
        console.warn(`Tile error on layer [${def.id}]:`, err);
        // Fallback to secondary URL if defined and primary fails
        if (def.fallbackUrl && layerInstance._url !== def.fallbackUrl) {
          layerInstance.setUrl(def.fallbackUrl);
        }
        if (typeof this.onStatusChange === 'function') {
          this.onStatusChange('error', 'RETRYING STREAM');
        }
      });

      return layerInstance;
    },

    /**
     * Switch mutually exclusive base layer
     */
    setBaseLayer: function (layerId) {
      const def = this.definitions[layerId];
      if (!def) {
        console.error(`Layer ID not found: ${layerId}`);
        return false;
      }

      if (typeof this.onStatusChange === 'function') {
        this.onStatusChange('loading', `LOADING ${def.name.toUpperCase()}...`);
      }

      // Remove existing base layer
      if (this.activeBaseLayer && this.map.hasLayer(this.activeBaseLayer)) {
        this.map.removeLayer(this.activeBaseLayer);
      }

      // Create and add new base layer
      this.activeLayerId = layerId;
      this.activeBaseLayer = this.createTileLayer(def, { zIndex: 1 });
      this.activeBaseLayer.addTo(this.map);

      // Keep overlay in sync if active
      if (this.overlayActive && this.overlayLayer) {
        this.overlayLayer.bringToFront();
      }

      return true;
    },

    /**
     * Enable or disable Satellite Imagery as an overlay on top of current basemap
     */
    setOverlayActive: function (active) {
      this.overlayActive = active;

      if (active) {
        if (!this.overlayLayer) {
          const satDef = this.definitions['satellite-imagery'];
          this.overlayLayer = this.createTileLayer(satDef, {
            zIndex: 10,
            opacity: this.overlayOpacity
          });
        }
        if (!this.map.hasLayer(this.overlayLayer)) {
          this.overlayLayer.addTo(this.map);
          this.overlayLayer.setOpacity(this.overlayOpacity);
        }
      } else {
        if (this.overlayLayer && this.map.hasLayer(this.overlayLayer)) {
          this.map.removeLayer(this.overlayLayer);
        }
      }
    },

    /**
     * Set Opacity of the Satellite Imagery layer (0.0 to 1.0)
     */
    setSatelliteOpacity: function (opacityVal) {
      this.overlayOpacity = Math.max(0, Math.min(1, opacityVal));

      // If active base layer is satellite imagery, adjust its opacity directly
      if (this.activeLayerId === 'satellite-imagery' && this.activeBaseLayer) {
        this.activeBaseLayer.setOpacity(this.overlayOpacity);
      }

      // If satellite overlay is active, adjust overlay opacity
      if (this.overlayLayer) {
        this.overlayLayer.setOpacity(this.overlayOpacity);
      }
    },

    /**
     * Get active layer definition
     */
    getActiveDefinition: function () {
      return this.definitions[this.activeLayerId];
    }
  };

  // Expose to window
  window.MarsLayers = LayersManager;

})(window);
