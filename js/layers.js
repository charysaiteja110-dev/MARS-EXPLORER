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

      // Return 1x1 transparent GIF for tiles outside planetary bounds to avoid network errors
      if (coords.x < 0 || coords.x > maxCol || coords.y < 0 || coords.y > maxCol) {
        return (L.Util && L.Util.emptyImageUrl) ? L.Util.emptyImageUrl : 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
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
    },

    'rover-traversability': {
      id: 'rover-traversability',
      name: 'Rover Traversability',
      category: 'Planetary Hazard Analysis',
      dataset: 'NASA Spirit Hazard Mapping Model (JPL D-92756)',
      resolution: 'Gusev Crater / Home Plate Case Study (5m CTX base + hazard vectors)',
      url: 'https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX1/MapServer/tile/{z}/{y}/{x}',
      fallbackUrl: 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png',
      attribution: 'NASA / JPL-Caltech / MSSS / Bruce Murray Lab / MER Spirit End of Mission Report (JPL D-92756)',
      minZoom: 2,
      maxZoom: 10,
      maxNativeZoom: 8,
      isEquirect: true,
      badge: 'Traversability',
      description: 'Historical rover traversability and terrain hazard model based on NASA MER Spirit Report methodology. Features classified risk zones, candidate routes 1–3, and the Troy embedding case study.'
    }
  };

  // Layers Manager Object
  const LayersManager = {
    definitions: LAYER_DEFINITIONS,
    activeLayerId: 'global-surface',
    activeBaseLayer: null,
    currentOpacity: 1.0,
    map: null,
    onStatusChange: null,
    lastErrorLogged: 0,
    traversabilityGroup: null,

    /**
     * Initialize Layer Manager with map instance
     */
    init: function (map, onStatusChangeCallback) {
      this.map = map;
      this.onStatusChange = onStatusChangeCallback;

      // Build Traversability Vector Overlay Group
      this.initTraversabilityOverlay();

      // Set initial base layer
      this.setBaseLayer('global-surface');
    },

    /**
     * Build Traversability Vector Overlay (NASA Spirit Case Study at Gusev / Home Plate)
     */
    initTraversabilityOverlay: function () {
      this.traversabilityGroup = L.layerGroup();

      // Traversability Colors from Part 7:
      // Green: #20A66A (lower estimated mobility risk)
      // Yellow: #E9B949 (caution)
      // Red: #D94A45 (high estimated mobility risk)
      // Grey: #777D83 (unknown or insufficient data)

      // 1. Gusev Crater Regional Context Circle
      const gusevCircle = L.circle([-14.5684, 175.4726], {
        radius: 83000, // 83 km radius (166 km crater diameter)
        color: '#777D83',
        weight: 1.5,
        dashArray: '6, 8',
        fillColor: '#777D83',
        fillOpacity: 0.05
      }).bindPopup(`
        <div class="popup-category">REGIONAL CASE STUDY (MC-23 AEOLIS)</div>
        <div class="popup-title">Gusev Crater Impact Basin</div>
        <div class="popup-details">
          <span><strong>Diameter:</strong> 166 km | <strong>Floor Elevation:</strong> -1.9 km</span>
          <span><strong>Status:</strong> Regional terrain outside direct rover track classified as <em>Unknown / Insufficient In-Situ Data</em>.</span>
          <span><strong>Citation:</strong> NASA Spirit Report JPL D-92756 Chapter 1.</span>
        </div>
      `);
      this.traversabilityGroup.addLayer(gusevCircle);

      // 2. Green Trafficable Zone (Competent Bedrock Outcrop)
      const greenZone = L.polygon([
        [-14.6045, 175.5245],
        [-14.6045, 175.5280],
        [-14.6068, 175.5285],
        [-14.6068, 175.5240]
      ], {
        color: '#20A66A',
        weight: 2,
        fillColor: '#20A66A',
        fillOpacity: 0.35
      }).bindPopup(`
        <div class="popup-category" style="color:#20A66A;">TRAFFICABLE TERRAIN (LOWER RISK)</div>
        <div class="popup-title">Home Plate Upper Outcrop</div>
        <div class="popup-details">
          <span><strong>Terrain:</strong> Competent layered volcaniclastic outcrop</span>
          <span><strong>Slope:</strong> 0° to 4° (Low gradient)</span>
          <span><strong>NASA Risk Class:</strong> GREEN (Trafficable)</span>
          <span><strong>Mobility Rationale:</strong> Substantial bearing strength; wheels experience <15% slip.</span>
          <span><strong>Citation:</strong> Figure 6.2 & Section 6.2.</span>
        </div>
      `);
      this.traversabilityGroup.addLayer(greenZone);

      // 3. Yellow Caution Zone (Soil with Embedded Clasts, 4°-8° Slope)
      const yellowZone = L.polygon([
        [-14.6030, 175.5220],
        [-14.6045, 175.5245],
        [-14.6068, 175.5240],
        [-14.6055, 175.5210]
      ], {
        color: '#E9B949',
        weight: 2,
        fillColor: '#E9B949',
        fillOpacity: 0.35
      }).bindPopup(`
        <div class="popup-category" style="color:#E9B949;">CAUTIONARY TERRAIN (MODERATE RISK)</div>
        <div class="popup-title">Western Apron Scree & Soil</div>
        <div class="popup-details">
          <span><strong>Terrain:</strong> Soil with embedded rock clasts</span>
          <span><strong>Slope:</strong> 4° to 8° (Moderate incline)</span>
          <span><strong>NASA Risk Class:</strong> YELLOW (Caution)</span>
          <span><strong>Mobility Rationale:</strong> Clasts provide intermittent traction, but regolith shears readily under continuous torque.</span>
          <span><strong>Citation:</strong> Table 6.1 (NASA Risk Matrix).</span>
        </div>
      `);
      this.traversabilityGroup.addLayer(yellowZone);

      // 4. Red High-Risk Zone (Troy Embedding Site — Concealed Sulfate Sand)
      const redZone = L.polygon([
        [-14.6072, 175.5228],
        [-14.6088, 175.5248],
        [-14.6095, 175.5235],
        [-14.6078, 175.5218]
      ], {
        color: '#D94A45',
        weight: 2,
        fillColor: '#D94A45',
        fillOpacity: 0.45
      }).bindPopup(`
        <div class="popup-category" style="color:#D94A45;">HIGH RISK TERRAIN (AVOID)</div>
        <div class="popup-title">Troy Sulfate Sand Trap (Embedding Site)</div>
        <div class="popup-details">
          <span><strong>Terrain:</strong> Sulfate sand beneath brittle duricrust crust</span>
          <span><strong>Slope:</strong> ~12° (South-facing descent)</span>
          <span><strong>NASA Risk Class:</strong> RED (High Risk / Failure)</span>
          <span><strong>Event:</strong> Sol 1886 embedding; Sol 1899 LM wheel stall; high-centering on subsurface clast.</span>
          <span><strong>Citation:</strong> Chapter 6 & Chapter 7 (Table 7.1).</span>
        </div>
      `);
      this.traversabilityGroup.addLayer(redZone);

      // 5. Candidate Traverse Routes 1, 2, 3
      // Route 1 (Abandoned Sol 1829)
      const route1 = L.polyline([
        [-14.6035, 175.5260],
        [-14.6042, 175.5268],
        [-14.6048, 175.5264]
      ], {
        color: '#D94A45',
        weight: 3,
        dashArray: '5, 5'
      }).bindPopup(`
        <div class="popup-category" style="color:#D94A45;">ROUTE 1 (ABANDONED SOL 1829)</div>
        <div class="popup-title">Northern Home Plate Ascent Attempt</div>
        <div class="popup-details">
          <span><strong>Status:</strong> Abandoned on Sol 1829.</span>
          <span><strong>Hazard:</strong> Slope exceeded 18°; rover experienced excessive wheel slip (>85%).</span>
          <span><strong>Citation:</strong> Section 5.2.</span>
        </div>
      `);
      this.traversabilityGroup.addLayer(route1);

      // Route 2 (Abandoned Sol 1843)
      const route2 = L.polyline([
        [-14.6035, 175.5260],
        [-14.6040, 175.5285],
        [-14.6052, 175.5298]
      ], {
        color: '#D94A45',
        weight: 3,
        dashArray: '5, 5'
      }).bindPopup(`
        <div class="popup-category" style="color:#D94A45;">ROUTE 2 (ABANDONED SOL 1843)</div>
        <div class="popup-title">Northeast Circum-Traverse Attempt</div>
        <div class="popup-details">
          <span><strong>Status:</strong> Abandoned on Sol 1843.</span>
          <span><strong>Hazard:</strong> Blocked by dense boulder field (>0.3 m) and soft ripple dune morphology.</span>
          <span><strong>Citation:</strong> Section 5.3.</span>
        </div>
      `);
      this.traversabilityGroup.addLayer(route2);

      // Route 3 (Westward traverse to Troy)
      const route3 = L.polyline([
        [-14.6035, 175.5260],
        [-14.6040, 175.5235],
        [-14.6060, 175.5225],
        [-14.6078, 175.5238]
      ], {
        color: '#E9B949',
        weight: 3
      }).bindPopup(`
        <div class="popup-category" style="color:#E9B949;">ROUTE 3 (ACTIVE TRAVERSE)</div>
        <div class="popup-title">Western Apron Traverse to Troy</div>
        <div class="popup-details">
          <span><strong>Sols:</strong> 1844–1886.</span>
          <span><strong>Outcome:</strong> Reached Troy on Sol 1886 where concealed duricrust collapsed into sulfate sands.</span>
          <span><strong>Citation:</strong> Section 5.4 & Section 6.3.</span>
        </div>
      `);
      this.traversabilityGroup.addLayer(route3);
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

      const layerInstance = def.isEquirect
        ? new PlanetaryEquirectTileLayer(def.url, tileOptions)
        : L.tileLayer(def.url, tileOptions);

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
        const now = Date.now();
        if (now - this.lastErrorLogged > 3000) {
          console.warn(`Tile stream warning on layer [${def.id}]:`, err);
          this.lastErrorLogged = now;
        }

        // Fallback to secondary URL once if defined and primary fails
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
      this.activeBaseLayer = this.createTileLayer(def, {
        zIndex: 1,
        opacity: this.currentOpacity
      });
      this.activeBaseLayer.addTo(this.map);

      // Handle Traversability vector overlay
      if (layerId === 'rover-traversability') {
        if (this.traversabilityGroup && !this.map.hasLayer(this.traversabilityGroup)) {
          this.traversabilityGroup.addTo(this.map);
        }
        // Smoothly center on Gusev Crater case study area
        this.map.flyTo([-14.606, 175.525], 9, {
          duration: 1.8,
          easeLinearity: 0.25
        });
      } else {
        if (this.traversabilityGroup && this.map.hasLayer(this.traversabilityGroup)) {
          this.map.removeLayer(this.traversabilityGroup);
        }
      }

      return true;
    },

    /**
     * Set Layer Opacity (0.0 to 1.0)
     */
    setSatelliteOpacity: function (opacityVal) {
      this.currentOpacity = Math.max(0, Math.min(1, opacityVal));
      if (this.activeBaseLayer) {
        this.activeBaseLayer.setOpacity(this.currentOpacity);
      }
    },

    /**
     * Alias for general opacity adjustment
     */
    setOpacity: function (opacityVal) {
      this.setSatelliteOpacity(opacityVal);
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
