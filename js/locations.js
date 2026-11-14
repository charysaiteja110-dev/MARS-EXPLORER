/**
 * ============================================================================
 * MARS EXPLORER PRO — Verified Martian Landmarks & Scientific Locations
 * Module: locations.js
 * ============================================================================
 */

(function (window) {
  'use strict';

  // Verified Martian Geographical Features & Landers (USGS / NASA PDS)
  const MARS_LOCATIONS = [
    {
      id: 'olympus-mons',
      name: 'Olympus Mons',
      category: 'Shield Volcano',
      lat: 18.65,
      lng: -133.80,
      zoom: 5,
      stats: {
        height: '21.9 km (72,000 ft)',
        diameter: '600 km (370 mi)',
        calderaDepth: '3.2 km',
        slope: '~5 degrees'
      },
      summary: 'The tallest planetary mountain and largest volcano in the Solar System. Rising nearly 2.5 times Mount Everest\'s height above the Martian datum, Olympus Mons is bounded by an outer scarp up to 8 km high.',
      mission: 'Mariner 9 (1971) confirmed it as an enormous volcanic shield rather than an albedo feature ("Nix Olympica").',
      quadrangle: 'MC-09 Amazonis'
    },
    {
      id: 'valles-marineris',
      name: 'Valles Marineris',
      category: 'Canyon System / Chasma',
      lat: -13.90,
      lng: -59.20,
      zoom: 4,
      stats: {
        length: '4,000 km (2,500 mi)',
        width: 'Up to 200 km',
        depth: 'Up to 7 km (23,000 ft)',
        volume: 'Grand Canyon x 10'
      },
      summary: 'A vast canyon system that runs along the Martian equator. Spanning nearly a quarter of Mars\' circumference, it originated as a tectonic crack during the volcanic crustal uplift of the Tharsis bulge.',
      mission: 'Discovered in 1971–1972 by NASA\'s Mariner 9 spacecraft, after which the rift system is named.',
      quadrangle: 'MC-18 Coprates'
    },
    {
      id: 'gale-crater',
      name: 'Gale Crater',
      category: 'Impact Crater & Lakebed',
      lat: -5.37,
      lng: 137.44,
      zoom: 6,
      stats: {
        diameter: '154 km (96 mi)',
        centralPeak: 'Aeolis Mons (5.5 km)',
        age: '~3.5–3.8 Billion Years',
        landingDate: 'August 6, 2012'
      },
      summary: 'Landing site of NASA\'s Curiosity Rover. The crater floor features layered sedimentary deposits that record transitions from ancient flowing freshwater lakes to hyper-arid modern Martian conditions.',
      mission: 'Mars Science Laboratory (MSL Curiosity) continues active in-situ exploration on Mount Sharp.',
      quadrangle: 'MC-23 Aeolis'
    },
    {
      id: 'jezero-crater',
      name: 'Jezero Crater',
      category: 'Ancient River Delta & Lake',
      lat: 18.38,
      lng: 77.58,
      zoom: 6,
      stats: {
        diameter: '45 km (28 mi)',
        deltaDepth: 'Up to 250 m sediment',
        hostFeature: 'Isidis Planitia Basin',
        landingDate: 'February 18, 2021'
      },
      summary: 'Touchdown site of NASA\'s Perseverance rover and the Ingenuity helicopter. Jezero once hosted a 30-mile-wide paleolake fed by an ancient inlet river that deposited a magnificent clay-rich delta ideal for preserving biosignatures.',
      mission: 'Mars 2020 Perseverance mission; actively collecting rock core samples for planned Mars Sample Return (MSR).',
      quadrangle: 'MC-13 Syrtis Major'
    },
    {
      id: 'hellas-planitia',
      name: 'Hellas Planitia',
      category: 'Giant Impact Basin',
      lat: -42.40,
      lng: 70.50,
      zoom: 4,
      stats: {
        diameter: '2,300 km (1,400 mi)',
        depth: '7.15 km below datum',
        surfacePressure: '~11.5 mbar (highest)',
        rimHeight: '~2 km above surrounding'
      },
      summary: 'The deepest impact structure on Mars and one of the largest recognized impact basins in the Solar System. Atmospheric pressure here is nearly double the planetary datum, periodically allowing atmospheric frost or carbon dioxide haze.',
      mission: 'Surveyed by Mariner 9, Viking, Mars Global Surveyor, and Mars Express (HRSC imagery).',
      quadrangle: 'MC-28 Hellas'
    },
    {
      id: 'tharsis-region',
      name: 'Tharsis Region (Tharsis Rise)',
      category: 'Volcanic Plateau',
      lat: 0.00,
      lng: -107.00,
      zoom: 3,
      stats: {
        elevation: 'Up to 10 km above datum',
        extent: '~5,000 km across',
        volcanoCount: '12+ major volcanoes',
        massLoad: 'Reoriented Mars spin axis'
      },
      summary: 'An immense volcanic bulge situated near the Martian equator. The massive weight of Tharsis fundamentally deformed the Martian lithosphere, spawning the Valles Marineris rift and hosting the triad of Tharsis Montes.',
      mission: 'Characterized via MOLA (Mars Orbiter Laser Altimeter) topological measurements.',
      quadrangle: 'MC-09 / MC-17 Tharsis'
    },
    {
      id: 'gusev-crater',
      name: 'Gusev Crater',
      category: 'Paleo-Lake Impact Basin',
      lat: -14.57,
      lng: 175.47,
      zoom: 6,
      stats: {
        diameter: '166 km',
        inletChannel: 'Ma\'adim Vallis',
        rover: 'Spirit (MER-A)',
        landingDate: 'January 4, 2004'
      },
      summary: 'Landing site of the Spirit rover. Ma\'adim Vallis, one of the largest river channels on Mars, carved directly into Gusev Crater, leaving basaltic and silica-rich volcanic hydrothermal deposits at the Columbia Hills.',
      mission: 'Mars Exploration Rover Spirit operated from 2004 to 2010 (JPL D-92756).',
      quadrangle: 'MC-23 Aeolis'
    },
    {
      id: 'home-plate',
      name: 'Home Plate (Gusev Crater)',
      category: 'Volcaniclastic Plateau',
      lat: -14.606,
      lng: 175.526,
      zoom: 9,
      stats: {
        diameter: '~90 meters across',
        elevation: '-1,920 m datum',
        feature: 'Phreatomagmatic Surge',
        discovery: 'Pure Opaline Silica (>90%)'
      },
      summary: 'An eroded plateau of volcaniclastic ash layers formed by explosive volcanic surge eruptions into surface water or ice. Spirit discovered pure opaline silica here, proving active ancient hydrothermal fumaroles.',
      mission: 'Surveyed by Spirit across Sols 744–2210; site of Routes 1, 2, and 3 traversability evaluations (JPL D-92756).',
      quadrangle: 'MC-23 Aeolis'
    },
    {
      id: 'troy-embedding',
      name: 'Troy (Spirit Embedding Site)',
      category: 'Historical Rover Case Study',
      lat: -14.608,
      lng: 175.524,
      zoom: 10,
      stats: {
        solEmbedded: 'Sol 1886 (May 2009)',
        hazardType: 'Concealed Sulfate Sand',
        terrainSlope: '~12 degrees south tilt',
        lastContact: 'Sol 2210 (March 22, 2010)'
      },
      summary: 'Historical case study site where Spirit broke through a thin indurated surface crust into loose, un-cemented ferric and magnesium sulfate sands. Wheels experienced 99.7% slip, leading to LM wheel failure and stationary winter mode.',
      mission: 'Subject of Chapter 6 (Hazard Mapping) and Chapter 7 (Extrication) in NASA MER Spirit Report JPL D-92756.',
      quadrangle: 'MC-23 Aeolis'
    },
    {
      id: 'meridiani-planum',
      name: 'Meridiani Planum',
      category: 'Sedimentary Plain',
      lat: -1.95,
      lng: -5.53,
      zoom: 6,
      stats: {
        diameter: '~1,100 km',
        keyMineral: 'Crystalline Hematite',
        rover: 'Opportunity (MER-B)',
        distanceTraversed: '45.16 km (record)'
      },
      summary: 'A smooth plain near Mars\' prime meridian where NASA\'s Opportunity rover famously uncovered millimeter-sized hematite spherules nicknamed "Martian blueberries," conclusively proving ancient groundwater percolation.',
      mission: 'Opportunity rover operated for nearly 15 Earth years (2004–2018).',
      quadrangle: 'MC-19 Margaritifer Sinus'
    },
    {
      id: 'elysium-mons',
      name: 'Elysium Mons',
      category: 'Shield Volcano',
      lat: 25.02,
      lng: 147.21,
      zoom: 5,
      stats: {
        height: '14.1 km above datum',
        diameter: '240 x 174 km',
        calderaSize: '14 km across',
        region: 'Elysium Volcanic Province'
      },
      summary: 'The second largest volcanic region on Mars after Tharsis. Elysium Mons rises over 14 kilometers, surrounded by lava plains and nearby InSight lander seismology detection zones.',
      mission: 'Photographed by Mariner 9, Viking 1/2, Mars Odyssey, and HiRISE.',
      quadrangle: 'MC-15 Elysium'
    },
    {
      id: 'utopia-planitia',
      name: 'Utopia Planitia',
      category: 'Vast Northern Plains',
      lat: 25.07,
      lng: 109.93,
      zoom: 5,
      stats: {
        diameter: '3,300 km',
        subsurfaceIce: 'Contains Lake Superior volume of ice',
        landers: 'Viking 2 (1976), Zhurong (2021)',
        terrain: 'Scalloped depressions & polygon ground'
      },
      summary: 'The largest recognized impact basin on Mars and in the solar system by surface area. Ground-penetrating radar from Mars Reconnaissance Orbiter revealed massive deposits of subsurface water ice.',
      mission: 'Site of Viking 2 in 1976 and China\'s Tianwen-1 Zhurong rover in May 2021.',
      quadrangle: 'MC-07 Cebrenia'
    }
  ];

  // Locations Manager Object
  const LocationsManager = {
    locations: MARS_LOCATIONS,
    layerGroup: null,
    visible: true,

    /**
     * Initialize markers layer on the map
     */
    init: function (map, onSelectCallback) {
      this.map = map;
      this.onSelect = onSelectCallback;
      this.layerGroup = L.layerGroup();

      this.locations.forEach((item) => {
        const marker = this.createMarker(item);
        this.layerGroup.addLayer(marker);
      });

      if (this.visible) {
        this.layerGroup.addTo(this.map);
      }
    },

    /**
     * Create custom radar-beacon marker for a location
     */
    createMarker: function (item) {
      const iconHtml = `
        <div class="mars-marker-beacon" title="${item.name}">
          <div class="marker-ping"></div>
          <div class="marker-pin-outer"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'mars-custom-div-icon',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14]
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });

      const latDir = item.lat >= 0 ? 'N' : 'S';
      const lngDir = item.lng >= 0 ? 'E' : 'W';
      const formattedCoords = `${Math.abs(item.lat).toFixed(2)}° ${latDir}, ${Math.abs(item.lng).toFixed(2)}° ${lngDir}`;

      const popupHtml = `
        <div class="popup-category">${item.category}</div>
        <div class="popup-title">${item.name}</div>
        <div class="popup-details">
          <span><strong>Coords:</strong> ${formattedCoords}</span>
          ${item.stats.height ? `<span><strong>Elevation:</strong> ${item.stats.height}</span>` : ''}
          ${item.stats.diameter ? `<span><strong>Diameter:</strong> ${item.stats.diameter}</span>` : ''}
          ${item.stats.length ? `<span><strong>Length:</strong> ${item.stats.length}</span>` : ''}
        </div>
        <button class="popup-inspect-btn" onclick="window.marsLocations.inspect('${item.id}')">
          EXAMINE TELEMETRY
        </button>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 240,
        className: 'mars-custom-popup'
      });

      marker.on('click', () => {
        if (typeof this.onSelect === 'function') {
          this.onSelect(item);
        }
      });

      return marker;
    },

    /**
     * Toggle markers visibility
     */
    toggle: function () {
      this.setVisible(!this.visible);
      return this.visible;
    },

    /**
     * Set markers visibility
     */
    setVisible: function (show) {
      this.visible = show;
      if (show) {
        if (this.layerGroup && !this.map.hasLayer(this.layerGroup)) {
          this.layerGroup.addTo(this.map);
        }
      } else {
        if (this.layerGroup && this.map.hasLayer(this.layerGroup)) {
          this.map.removeLayer(this.layerGroup);
        }
      }
    },

    /**
     * Get location by ID
     */
    getById: function (id) {
      return this.locations.find(l => l.id === id);
    },

    /**
     * Fly to a specific location
     */
    flyTo: function (item) {
      if (!item || !this.map) return;
      this.map.flyTo([item.lat, item.lng], item.zoom || 5, {
        duration: 1.8,
        easeLinearity: 0.25
      });
      if (typeof this.onSelect === 'function') {
        this.onSelect(item);
      }
    },

    /**
     * Inspect location by ID (called from popup button or external triggers)
     */
    inspect: function (id) {
      const item = this.getById(id);
      if (item && typeof this.onSelect === 'function') {
        this.onSelect(item);
      }
    }
  };

  // Expose to window (with lowercase alias for popup onclick compatibility)
  window.MarsLocations = LocationsManager;
  window.marsLocations = LocationsManager;

})(window);

