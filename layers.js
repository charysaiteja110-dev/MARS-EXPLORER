/**
 * ============================================================================
 * MARS EXPLORER COMMAND CENTER — Planetary Layers & NASA Traversability Engine
 * Module: layers.js
 * Official Datasets: OpenPlanetaryMap v0.2, Caltech CTX 5m, NASA MOLA, HRSC, Viking
 * NASA Spirit Traversability Model (JPL D-92756)
 * ============================================================================
 */

(function (window) {
  'use strict';

  // Mars Spheroid Physical Bounds
  const PLANETARY_BOUNDS = L.latLngBounds(
    L.latLng(-85.051129, -180.0),
    L.latLng(85.051129, 180.0)
  );

  // Custom Equirectangular-to-Mercator Planetary Tile Layer
  const PlanetaryEquirectTileLayer = L.TileLayer.extend({
    getTileUrl: function (coords) {
      const z = coords.z;
      const x = coords.x;
      const y = coords.y;

      const numTiles = Math.pow(2, z);
      if (x < 0 || x >= numTiles || y < 0 || y >= numTiles) {
        return L.Util.emptyImageUrl;
      }

      // Web Mercator tile bounds to latitude
      const n = Math.PI - (2 * Math.PI * y) / numTiles;
      const latRad = Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
      const latDeg = (latRad * 180.0) / Math.PI;

      // Equirectangular Tile Row (Y)
      const clampedLat = Math.max(-85.051129, Math.min(85.051129, latDeg));
      const latNorm = (90.0 - clampedLat) / 180.0;
      const eqY = Math.floor(latNorm * numTiles);
      const clampedEqY = Math.max(0, Math.min(numTiles - 1, eqY));

      return L.Util.template(this._url, {
        z: z,
        x: x,
        y: clampedEqY
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
    traversabilityVisible: true,

    /**
     * Initialize Layer Manager with map instance
     */
    init: function (map, onStatusChangeCallback) {
      this.map = map;
      this.onStatusChange = onStatusChangeCallback;

      // Build Traversability Vector Overlay Group
      this.initTraversabilityOverlay();

      // Add Traversability Vector Overlay by default so NASA classification is visible immediately!
      if (this.traversabilityGroup && this.map) {
        this.traversabilityGroup.addTo(this.map);
      }

      // Set initial base layer
      this.setBaseLayer('global-surface');
    },

    /**
     * Build Traversability & NASA Terrain Classification Vector Overlay
     * Includes Gusev Crater, Home Plate, Troy Sand Trap, Columbia Hills, and Global Planetary Case Studies
     */
    initTraversabilityOverlay: function () {
      this.traversabilityGroup = L.layerGroup();

      // ======================================================================
      // 1. GUSEV CRATER / HOME PLATE CASE STUDY (MER SPIRIT JPL D-92756)
      // ======================================================================

      // 1.1 Gusev Crater Regional Context Circle (166 km diameter)
      const gusevCircle = L.circle([-14.5684, 175.4726], {
        radius: 83000,
        color: '#777D83',
        weight: 1.5,
        dashArray: '6, 8',
        fillColor: '#777D83',
        fillOpacity: 0.05
      }).bindPopup(`
        <div class="mars-popup-container">
          <div class="popup-header-row">
            <span class="popup-category">REGIONAL CASE STUDY (MC-23 AEOLIS)</span>
            <span class="popup-risk-badge" style="background:rgba(119,125,131,0.2);color:#A7A09A;border:1px solid #777D83;">
              Unknown / Insufficient Data
            </span>
          </div>
          <h4 class="popup-title">Gusev Crater Impact Basin</h4>
          <div class="popup-summary">
            166 km impact crater floor. Regional plains outside rover track are classified as <em>Unknown / Insufficient In-Situ Data</em> per Chapter 6 methodology.
          </div>
          <div class="popup-stats-strip">
            <span><strong>Diameter:</strong> 166 km</span>
            <span><strong>Floor Elevation:</strong> -1.9 km</span>
            <span><strong>Citation:</strong> JPL D-92756 Ch. 1</span>
          </div>
        </div>
      `);
      this.traversabilityGroup.addLayer(gusevCircle);

      // 1.2 Home Plate Upper Outcrop — GREEN (Outcrop, 0°–4°, Trafficable)
      const greenZone = L.polygon([
        [-14.6045, 175.5245],
        [-14.6045, 175.5280],
        [-14.6068, 175.5285],
        [-14.6068, 175.5240]
      ], {
        color: '#4ADE80',
        weight: 2,
        fillColor: '#20A66A',
        fillOpacity: 0.4
      }).bindTooltip('🟢 NASA Outcrop: Home Plate (Trafficable)', {
        permanent: true,
        direction: 'top',
        className: 'nasa-map-tooltip'
      }).bindPopup(`
        <div class="mars-popup-container">
          <div class="popup-header-row">
            <span class="popup-category" style="color:#4ADE80;">NASA FIG 6.2: OUTCROP</span>
            <span class="popup-risk-badge" style="background:rgba(32,166,106,0.2);color:#20A66A;border:1px solid #20A66A;">
              Trafficable (Green)
            </span>
          </div>
          <h4 class="popup-title">Home Plate Upper Outcrop</h4>
          <div class="popup-nasa-info">
            <div class="p-info-row"><span class="p-label">Terrain Unit:</span> <span class="p-val" style="color:#4ADE80;font-weight:700;">Outcrop (Layered Ash)</span></div>
            <div class="p-info-row"><span class="p-label">Slope Bin:</span> <span class="p-val">0°–4° (Flat)</span></div>
            <div class="p-info-row"><span class="p-label">Wheel Slip:</span> <span class="p-val" style="color:#20A66A;">&lt;15% Slip (High Traction)</span></div>
          </div>
          <div class="popup-summary">
            Competent volcaniclastic layered rock slabs providing substantial bearing strength. Spirit conducted extensive winter operations and uncovered pure opaline silica (>90% SiO2).
          </div>
          <div class="popup-stats-strip">
            <span><strong>Section:</strong> 6.2 &amp; Figure 6.2</span>
            <span><strong>Status:</strong> Nominal Mobility</span>
          </div>
        </div>
      `);
      this.traversabilityGroup.addLayer(greenZone);

      // 1.3 Western Apron Scree & Soil — YELLOW (Soil with Rock Clasts, 4°–8°, Caution)
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
      }).bindTooltip('🟡 NASA Soil w/ Clasts: Western Apron (Caution)', {
        permanent: true,
        direction: 'left',
        className: 'nasa-map-tooltip'
      }).bindPopup(`
        <div class="mars-popup-container">
          <div class="popup-header-row">
            <span class="popup-category" style="color:#4B7C59;">NASA FIG 6.2: SOIL W/ CLASTS</span>
            <span class="popup-risk-badge" style="background:rgba(233,185,73,0.2);color:#E9B949;border:1px solid #E9B949;">
              Caution (Yellow)
            </span>
          </div>
          <h4 class="popup-title">Western Apron Scree &amp; Soil</h4>
          <div class="popup-nasa-info">
            <div class="p-info-row"><span class="p-label">Terrain Unit:</span> <span class="p-val" style="color:#4B7C59;font-weight:700;">Soil w/ Embedded Rock Clasts</span></div>
            <div class="p-info-row"><span class="p-label">Slope Bin:</span> <span class="p-val">4°–8° (Moderate Incline)</span></div>
            <div class="p-info-row"><span class="p-label">Wheel Slip:</span> <span class="p-val" style="color:#E9B949;">15%–40% Slip (Controlled Advance)</span></div>
          </div>
          <div class="popup-summary">
            Clasts provide intermittent traction, but regolith shears readily under continuous torque. Required conservative drive commanding to prevent embedment.
          </div>
          <div class="popup-stats-strip">
            <span><strong>Table:</strong> 6.1 Mobility Risk Matrix</span>
            <span><strong>Sols:</strong> 1844–1885</span>
          </div>
        </div>
      `);
      this.traversabilityGroup.addLayer(yellowZone);

      // 1.4 Troy Embedding Site — RED (Concealed Sulfate Sands, 12° Slope, High Risk)
      const redZone = L.polygon([
        [-14.6072, 175.5228],
        [-14.6088, 175.5248],
        [-14.6095, 175.5235],
        [-14.6078, 175.5218]
      ], {
        color: '#D94A45',
        weight: 2.5,
        fillColor: '#D94A45',
        fillOpacity: 0.5
      }).bindTooltip('🔴 NASA Sand Trap: Troy (High Risk / Sol 1886)', {
        permanent: true,
        direction: 'bottom',
        className: 'nasa-map-tooltip danger'
      }).bindPopup(`
        <div class="mars-popup-container">
          <div class="popup-header-row">
            <span class="popup-category" style="color:#EF4444;">NASA FIG 6.2: RIPPLE / SULFATE SAND</span>
            <span class="popup-risk-badge" style="background:rgba(217,74,69,0.2);color:#D94A45;border:1px solid #D94A45;">
              High Risk (Red / Impassable)
            </span>
          </div>
          <h4 class="popup-title">Troy Sulfate Sand Trap (Embedding Site)</h4>
          <div class="popup-nasa-info">
            <div class="p-info-row"><span class="p-label">Terrain Unit:</span> <span class="p-val" style="color:#1E40AF;font-weight:700;">Concealed Sulfate Sand Trap</span></div>
            <div class="p-info-row"><span class="p-label">Slope Angle:</span> <span class="p-val">~12° (Southward Tilt)</span></div>
            <div class="p-info-row"><span class="p-label">Wheel Slip:</span> <span class="p-val" style="color:#D94A45;font-weight:700;">99.7% Wheel Slip (Complete Stoppage)</span></div>
          </div>
          <div class="popup-summary">
            Thin surface duricrust crust broke through into un-cemented ferric and magnesium sulfate sands ("poppy-seed" soil) with negligible shear strength. Rover high-centered on concealed subsurface rock.
          </div>
          <div class="popup-stats-strip">
            <span><strong>Sol Embedded:</strong> Sol 1886 (May 2009)</span>
            <span><strong>Chapters:</strong> 6 &amp; 7 (Table 7.1)</span>
          </div>
        </div>
      `);
      this.traversabilityGroup.addLayer(redZone);

      // 1.5 Husband Hill Summit Ridge — PURPLE (Bedrock, 4°–8°, Lower Risk)
      const husbandHill = L.polygon([
        [-14.598, 175.520],
        [-14.596, 175.524],
        [-14.600, 175.526],
        [-14.602, 175.522]
      ], {
        color: '#9333EA',
        weight: 2,
        fillColor: '#9333EA',
        fillOpacity: 0.35
      }).bindTooltip('🟣 NASA Bedrock: Husband Hill Summit (Lower Risk)', {
        permanent: false,
        direction: 'top',
        className: 'nasa-map-tooltip'
      }).bindPopup(`
        <div class="mars-popup-container">
          <div class="popup-header-row">
            <span class="popup-category" style="color:#9333EA;">NASA FIG 6.2: BEDROCK</span>
            <span class="popup-risk-badge" style="background:rgba(32,166,106,0.2);color:#20A66A;border:1px solid #20A66A;">
              Lower Risk (Green)
            </span>
          </div>
          <h4 class="popup-title">Husband Hill Summit Ridge</h4>
          <div class="popup-nasa-info">
            <div class="p-info-row"><span class="p-label">Terrain Unit:</span> <span class="p-val" style="color:#9333EA;font-weight:700;">Competent Bedrock Ridge</span></div>
            <div class="p-info-row"><span class="p-label">Elevation:</span> <span class="p-val">+106 m Above Surrounding Plains</span></div>
            <div class="p-info-row"><span class="p-label">Bearing Strength:</span> <span class="p-val">High; negligible sinkage</span></div>
          </div>
          <div class="popup-summary">
            Highest point reached by Spirit on Sols 582–600. Exposed bedrock pavement offered excellent traction before descending toward Home Plate.
          </div>
        </div>
      `);
      this.traversabilityGroup.addLayer(husbandHill);

      // 1.6 Bonneville Crater Rim Boulders — RED (Big Rocks >0.3m, High Obstacle Risk)
      const bonnevilleRim = L.polygon([
        [-14.578, 175.485],
        [-14.576, 175.492],
        [-14.582, 175.493],
        [-14.583, 175.486]
      ], {
        color: '#EF4444',
        weight: 2,
        fillColor: '#EF4444',
        fillOpacity: 0.35
      }).bindTooltip('🔴 NASA Big Rocks: Bonneville Rim (>0.3 m Obstacle)', {
        permanent: false,
        direction: 'top',
        className: 'nasa-map-tooltip danger'
      }).bindPopup(`
        <div class="mars-popup-container">
          <div class="popup-header-row">
            <span class="popup-category" style="color:#EF4444;">NASA FIG 6.2: BIG ROCKS (>0.3 M)</span>
            <span class="popup-risk-badge" style="background:rgba(217,74,69,0.2);color:#D94A45;border:1px solid #D94A45;">
              High Obstacle Risk (Red)
            </span>
          </div>
          <h4 class="popup-title">Bonneville Crater Ejecta Rim</h4>
          <div class="popup-summary">
            Dense boulder field (>0.3 m) ejected by impact. Precluded descent into crater interior due to severe risk of underbody chassis hang-up and wheel motor damage.
          </div>
        </div>
      `);
      this.traversabilityGroup.addLayer(bonnevilleRim);

      // 1.7 Candidate Traverse Routes 1, 2, 3
      // Route 1 (Abandoned Sol 1829)
      const route1 = L.polyline([
        [-14.6035, 175.5260],
        [-14.6042, 175.5268],
        [-14.6048, 175.5264]
      ], {
        color: '#D94A45',
        weight: 3,
        dashArray: '5, 5'
      }).bindTooltip('Route 1 (Abandoned: Slope >18°)', {
        direction: 'right',
        className: 'nasa-map-tooltip danger'
      }).bindPopup(`
        <div class="mars-popup-container">
          <div class="popup-header-row">
            <span class="popup-category" style="color:#D94A45;">ROUTE 1 (ABANDONED SOL 1829)</span>
          </div>
          <h4 class="popup-title">Northern Home Plate Ascent Attempt</h4>
          <div class="popup-summary">
            Slope exceeded 18°; rover experienced excessive wheel slip (>85%) while dragging locked right-front wheel. Abandoned on Sol 1829.
          </div>
          <div class="popup-stats-strip"><span>Citation: Section 5.2</span></div>
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
      }).bindTooltip('Route 2 (Abandoned: Boulders & Ripples)', {
        direction: 'right',
        className: 'nasa-map-tooltip danger'
      }).bindPopup(`
        <div class="mars-popup-container">
          <div class="popup-header-row">
            <span class="popup-category" style="color:#D94A45;">ROUTE 2 (ABANDONED SOL 1843)</span>
          </div>
          <h4 class="popup-title">Northeast Circum-Traverse Attempt</h4>
          <div class="popup-summary">
            Blocked by dense boulder field (>0.3 m) and soft ripple dune morphology. Abandoned on Sol 1843.
          </div>
          <div class="popup-stats-strip"><span>Citation: Section 5.3</span></div>
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
        weight: 3.5
      }).bindTooltip('Route 3 (Active Western Traverse to Troy)', {
        direction: 'left',
        className: 'nasa-map-tooltip'
      }).bindPopup(`
        <div class="mars-popup-container">
          <div class="popup-header-row">
            <span class="popup-category" style="color:#E9B949;">ROUTE 3 (ACTIVE TRAVERSE)</span>
          </div>
          <h4 class="popup-title">Western Apron Traverse to Troy</h4>
          <div class="popup-summary">
            Traversed Sols 1844–1886 along the western base of Home Plate until breaking through duricrust into concealed sulfate sands at Troy on Sol 1886.
          </div>
          <div class="popup-stats-strip"><span>Citation: Section 5.4 &amp; 6.3</span></div>
        </div>
      `);
      this.traversabilityGroup.addLayer(route3);

      // ======================================================================
      // 2. PLANETARY CASE STUDIES (NASA CLASSIFICATION APPLIED GLOBALLY)
      // ======================================================================

      // 2.1 Jezero Crater River Delta — GREEN (Outcrop, Layered Siltstones)
      const jezeroDelta = L.polygon([
        [18.35, 77.52],
        [18.42, 77.55],
        [18.40, 77.62],
        [18.33, 77.58]
      ], {
        color: '#4ADE80',
        weight: 1.5,
        fillColor: '#20A66A',
        fillOpacity: 0.3
      }).bindTooltip('🟢 NASA Outcrop: Jezero River Delta (Trafficable)', {
        direction: 'top',
        className: 'nasa-map-tooltip'
      }).bindPopup(`
        <div class="mars-popup-container">
          <div class="popup-header-row">
            <span class="popup-category" style="color:#4ADE80;">NASA FIG 6.2: OUTCROP</span>
            <span class="popup-risk-badge" style="background:rgba(32,166,106,0.2);color:#20A66A;border:1px solid #20A66A;">Trafficable</span>
          </div>
          <h4 class="popup-title">Jezero Crater Sedimentary Delta</h4>
          <div class="popup-summary">
            Layered clay and mudstone river delta. High bearing strength; ideal trafficability for Perseverance rover sample collection.
          </div>
        </div>
      `);
      this.traversabilityGroup.addLayer(jezeroDelta);

      // 2.2 Gale Crater Bagnold Dunes — BLUE (Soil with Ripple Morphology)
      const galeDunes = L.polygon([
        [-5.40, 137.40],
        [-5.36, 137.43],
        [-5.39, 137.47],
        [-5.43, 137.44]
      ], {
        color: '#1E40AF',
        weight: 1.5,
        fillColor: '#1E40AF',
        fillOpacity: 0.35
      }).bindTooltip('🔵 NASA Ripple Morphology: Bagnold Dunes (High Slip)', {
        direction: 'bottom',
        className: 'nasa-map-tooltip danger'
      }).bindPopup(`
        <div class="mars-popup-container">
          <div class="popup-header-row">
            <span class="popup-category" style="color:#1E40AF;">NASA FIG 6.2: RIPPLE MORPHOLOGY</span>
            <span class="popup-risk-badge" style="background:rgba(217,74,69,0.2);color:#D94A45;border:1px solid #D94A45;">High Risk</span>
          </div>
          <h4 class="popup-title">Gale Crater Bagnold Active Dunes</h4>
          <div class="popup-summary">
            Unconsolidated active aeolian dunes with steep slip faces (>15°). Curiosity navigates along perimeter to avoid wheel sinkage.
          </div>
        </div>
      `);
      this.traversabilityGroup.addLayer(galeDunes);
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

      // Make sure vector classification overlay stays visible on top if enabled
      if (this.traversabilityVisible && this.traversabilityGroup && !this.map.hasLayer(this.traversabilityGroup)) {
        this.traversabilityGroup.addTo(this.map);
      }

      // If rover-traversability base layer selected, fly to Gusev Crater case study
      if (layerId === 'rover-traversability') {
        this.map.flyTo([-14.606, 175.525], 9, {
          duration: 1.8,
          easeLinearity: 0.25
        });
      }

      return true;
    },

    /**
     * Toggle Traversability / NASA Classification Vector Overlay
     */
    toggleTraversabilityOverlay: function (show) {
      this.traversabilityVisible = (typeof show === 'boolean') ? show : !this.traversabilityVisible;

      if (this.traversabilityVisible) {
        if (this.traversabilityGroup && !this.map.hasLayer(this.traversabilityGroup)) {
          this.traversabilityGroup.addTo(this.map);
        }
      } else {
        if (this.traversabilityGroup && this.map.hasLayer(this.traversabilityGroup)) {
          this.map.removeLayer(this.traversabilityGroup);
        }
      }

      return this.traversabilityVisible;
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
