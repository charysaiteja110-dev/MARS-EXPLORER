/**
 * ============================================================================
 * MARS EXPLORER COMMAND CENTER — Verified Martian Landmarks & Scientific Locations
 * Module: locations.js
 * Integrated NASA JPL D-92756 Terrain & Mobility Risk Classification
 * ============================================================================
 */

(function (window) {
  'use strict';

  // Verified Martian Geographical Features & Landers (USGS / NASA PDS / JPL D-92756)
  const MARS_LOCATIONS = [
    {
      id: 'olympus-mons',
      name: 'Olympus Mons',
      category: 'Shield Volcano',
      shortTag: 'Shield Volcano • 21.9 km',
      nasaClass: 'Bedrock & Scarp',
      mobilityRisk: 'Lower Risk (Caldera) / High Risk (Scarp)',
      slopeGrade: '5° Flanks / >25° Scarp Wall',
      mobilityDesc: 'Summit caldera features competent basaltic bedrock; outer perimeter scarp is an impassable vertical cliff.',
      lat: 18.65,
      lng: -133.80,
      zoom: 5,
      stats: {
        height: '21.9 km (72,000 ft)',
        diameter: '600 km (370 mi)',
        calderaDepth: '3.2 km',
        slope: '~5 degrees'
      },
      summary: 'The tallest planetary mountain and largest volcano in the Solar System. Rising nearly 2.5 times Mount Everest above the Martian datum, Olympus Mons is bounded by an outer cliff scarp up to 8 km high.',
      mission: 'Mariner 9 (1971) confirmed it as an enormous volcanic shield rather than an albedo feature ("Nix Olympica").',
      quadrangle: 'MC-09 Amazonis'
    },
    {
      id: 'valles-marineris',
      name: 'Valles Marineris',
      category: 'Canyon System / Chasma',
      shortTag: 'Grand Canyon of Mars • 4,000 km',
      nasaClass: 'Soil w/ Clasts & Scarps',
      mobilityRisk: 'High Risk (Walls) / Caution (Floor)',
      slopeGrade: '12°–16° Floor Scree / >20° Scarps',
      mobilityDesc: 'Severe tectonic rift scarps exceeding maximum rover climb angles (>16°); floor features mixed scree and soil.',
      lat: -13.90,
      lng: -59.20,
      zoom: 4,
      stats: {
        length: '4,000 km (2,500 mi)',
        width: 'Up to 200 km',
        depth: 'Up to 7 km (23,000 ft)',
        volume: 'Grand Canyon x 10'
      },
      summary: 'A vast canyon system running along the Martian equator. Spanning nearly a quarter of Mars circumference, it originated as a tectonic rift during the crustal uplift of the Tharsis volcanic bulge.',
      mission: 'Discovered in 1971–1972 by NASA Mariner 9 spacecraft, after which the rift system is named.',
      quadrangle: 'MC-18 Coprates'
    },
    {
      id: 'jezero-crater',
      name: 'Jezero Crater',
      category: 'Ancient River Delta & Lake',
      shortTag: 'Perseverance Rover • Lake Delta',
      nasaClass: 'Outcrop (Layered Delta)',
      mobilityRisk: 'Lower Risk (Trafficable)',
      slopeGrade: '0°–4° Flat / 4°–8° Fan Edge',
      mobilityDesc: 'Competent mudstone and siltstone outcrops provide high wheel bearing strength and low slippage.',
      lat: 18.38,
      lng: 77.58,
      zoom: 6,
      stats: {
        diameter: '45 km (28 mi)',
        deltaDepth: 'Up to 250 m sediment',
        hostFeature: 'Isidis Planitia Basin',
        landingDate: 'February 18, 2021'
      },
      summary: 'Touchdown site of NASA Perseverance rover and Ingenuity helicopter. Jezero once hosted a 30-mile-wide paleolake fed by an inlet river that deposited a clay-rich delta ideal for preserving ancient biosignatures.',
      mission: 'Mars 2020 Perseverance mission; actively collecting rock core samples for planned Mars Sample Return (MSR).',
      quadrangle: 'MC-13 Syrtis Major'
    },
    {
      id: 'gale-crater',
      name: 'Gale Crater',
      category: 'Impact Crater & Lakebed',
      shortTag: 'Curiosity Rover • Mt Sharp',
      nasaClass: 'Soil over Bedrock & Dunes',
      mobilityRisk: 'Lower Risk (Bedrock) / High Risk (Dunes)',
      slopeGrade: '0°–8° Lower Mount Sharp / 12° Dunes',
      mobilityDesc: 'Traversable mudstones at Yellowknife Bay, but Bagnold active dune fields present extreme wheel sinkage hazard.',
      lat: -5.37,
      lng: 137.44,
      zoom: 6,
      stats: {
        diameter: '154 km (96 mi)',
        centralPeak: 'Aeolis Mons (5.5 km)',
        age: '~3.5–3.8 Billion Years',
        landingDate: 'August 6, 2012'
      },
      summary: 'Landing site of NASA Curiosity Rover. The crater floor features layered sedimentary deposits that record transitions from ancient flowing freshwater lakes to hyper-arid modern Martian conditions.',
      mission: 'Mars Science Laboratory (MSL Curiosity) continues active in-situ exploration ascending Mount Sharp.',
      quadrangle: 'MC-23 Aeolis'
    },
    {
      id: 'gusev-crater',
      name: 'Gusev Crater (Columbia Memorial)',
      category: 'Paleo-Lake Impact Basin',
      shortTag: 'Spirit Landing Site • 7,730 m',
      nasaClass: 'Soil over Bedrock (Basalt Plains)',
      mobilityRisk: 'Lower Risk (Trafficable)',
      slopeGrade: '0°–4° Nominal Flat Plains',
      mobilityDesc: 'Basaltic rubble and thin regolith over volcanic bedrock; wheel slip remained nominal (<15%) across plains.',
      lat: -14.57,
      lng: 175.47,
      zoom: 6,
      stats: {
        diameter: '166 km',
        inletChannel: 'Ma\'adim Vallis',
        rover: 'Spirit (MER-A)',
        landingDate: 'January 4, 2004'
      },
      summary: 'Landing site of Spirit rover (Columbia Memorial Station). Ma\'adim Vallis carved directly into Gusev Crater, leaving basaltic and silica-rich volcanic hydrothermal deposits investigated across 2,210 Sols.',
      mission: 'Mars Exploration Rover Spirit operated from 2004 to 2010 (JPL D-92756).',
      quadrangle: 'MC-23 Aeolis'
    },
    {
      id: 'home-plate',
      name: 'Home Plate (Gusev Crater)',
      category: 'Volcaniclastic Plateau',
      shortTag: 'Home Plate • Hydrothermal Silica',
      nasaClass: 'Outcrop (Ash Layers)',
      mobilityRisk: 'Lower Risk (Trafficable)',
      slopeGrade: '0°–4° Plateau Surface',
      mobilityDesc: 'Substantial bearing strength on layered rock slabs; site of pure opaline silica (>90% SiO2) discoveries.',
      lat: -14.606,
      lng: 175.526,
      zoom: 9,
      stats: {
        diameter: '~90 meters across',
        elevation: '-1,920 m datum',
        feature: 'Phreatomagmatic Surge',
        discovery: 'Pure Opaline Silica (>90%)'
      },
      summary: 'An eroded plateau of volcaniclastic ash layers formed by explosive phreatomagmatic volcanic surge eruptions into surface water or ice. Spirit discovered pure opaline silica here, proving active ancient hydrothermal fumaroles.',
      mission: 'Surveyed by Spirit across Sols 744–2210; site of Routes 1, 2, and 3 traversability evaluations (JPL D-92756).',
      quadrangle: 'MC-23 Aeolis'
    },
    {
      id: 'troy-embedding',
      name: 'Troy (Spirit Embedding Site)',
      category: 'Historical Rover Case Study',
      shortTag: 'Troy Trap • Concealed Sulfate Sands',
      nasaClass: 'Soil w/ Ripple Morphology',
      mobilityRisk: 'High Risk (Impassable)',
      slopeGrade: '~12° Southward Descent Tilt',
      mobilityDesc: 'Thin crust collapsed into zero-cohesion sulfate sand; wheels suffered 99.7% slip and high-centered on hidden rock.',
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
      shortTag: 'Opportunity Rover • Hematite Plain',
      nasaClass: 'Soil with No Rocks',
      mobilityRisk: 'Caution (Moderate Risk)',
      slopeGrade: '0°–4° Flat Plains / Ripple Swales',
      mobilityDesc: 'Fine aeolian sand drift punctuated by hematite spherules; high slip in soft drift ripples (Purgatory Dune trap).',
      lat: -1.95,
      lng: -5.53,
      zoom: 6,
      stats: {
        diameter: '~1,100 km',
        keyMineral: 'Crystalline Hematite',
        rover: 'Opportunity (MER-B)',
        distanceTraversed: '45.16 km (record)'
      },
      summary: 'A smooth plain near Mars prime meridian where NASA Opportunity rover famously uncovered millimeter-sized hematite spherules nicknamed "Martian blueberries," conclusively proving ancient groundwater percolation.',
      mission: 'Opportunity rover operated for nearly 15 Earth years (2004–2018).',
      quadrangle: 'MC-19 Margaritifer Sinus'
    },
    {
      id: 'victoria-crater',
      name: 'Victoria Crater',
      category: 'Impact Crater & Cliffs',
      shortTag: 'Opportunity • 750 m Crater',
      nasaClass: 'Outcrop & Cliff Scarps',
      mobilityRisk: 'Lower Risk (Duck Bay) / High Risk (Walls)',
      slopeGrade: '12°–15° Ingress Ramp / >25° Cliffs',
      mobilityDesc: 'Opportunity successfully navigated Duck Bay ingress alcove on layered bedrock slabs while avoiding sheer promontory scarps.',
      lat: -2.05,
      lng: -5.50,
      zoom: 7,
      stats: {
        diameter: '750 meters (half mile)',
        depth: '75 meters',
        promontories: 'Cape Verde, Cabo Anonimo',
        explorationSols: 'Sols 951–1634'
      },
      summary: 'An ancient impact crater explored by Opportunity for nearly two Earth years. Deep vertical promontories revealed spectacular layered sulfate bedrock, illuminating ancient Martian groundwater depositional history.',
      mission: 'Opportunity entered and safely exited Victoria Crater via Duck Bay (2006–2008).',
      quadrangle: 'MC-19 Margaritifer Sinus'
    },
    {
      id: 'elysium-mons',
      name: 'Elysium Mons',
      category: 'Shield Volcano',
      shortTag: 'Shield Volcano • 14.1 km',
      nasaClass: 'Bedrock',
      mobilityRisk: 'Lower Risk (Flanks)',
      slopeGrade: '0°–8° Lava Flow Plains',
      mobilityDesc: 'Extensive basaltic lava flow fields with substantial bearing capacity and moderate regional gradients.',
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
      shortTag: 'Viking 2 & Zhurong Rover',
      nasaClass: 'Soil w/ Embedded Rock Clasts',
      mobilityRisk: 'Caution (Moderate Risk)',
      slopeGrade: '0°–4° Flat Periglacial Plain',
      mobilityDesc: 'Periglacial polygon ground with embedded basaltic clasts and vast subsurface water ice reserves.',
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
      mission: 'Site of Viking 2 in 1976 and China Tianwen-1 Zhurong rover in May 2021.',
      quadrangle: 'MC-07 Cebrenia'
    },
    {
      id: 'chryse-planitia',
      name: 'Chryse Planitia',
      category: 'Outflow Flood Plain',
      shortTag: 'Viking 1 Lander (1976)',
      nasaClass: 'Soil w/ Embedded Rock Clasts',
      mobilityRisk: 'Caution (Moderate Risk)',
      slopeGrade: '0°–4° Flat Channel Floor',
      mobilityDesc: 'Immense mega-flood deposit characterized by scattered boulders and wind-blown dust drifts.',
      lat: 22.27,
      lng: -47.95,
      zoom: 5,
      stats: {
        diameter: '~1,600 km',
        elevation: '-2.5 km below datum',
        lander: 'Viking 1 Lander (Thomas Mutch Memorial)',
        landingDate: 'July 20, 1976'
      },
      summary: 'A circular sedimentary basin at the mouth of major outflow channels (Kasei, Ares, Tiu Valles). Site of humanity\'s first successful long-duration operational touchdown on the surface of Mars.',
      mission: 'Viking 1 operated until November 1982, returning 57,000 images and weather observations.',
      quadrangle: 'MC-10 Lunae Palus'
    },
    {
      id: 'ares-vallis',
      name: 'Ares Vallis',
      category: 'Catastrophic Outflow Channel',
      shortTag: 'Mars Pathfinder & Sojourner',
      nasaClass: 'Big Rocks (>0.3 m) & Scree',
      mobilityRisk: 'Caution / High Obstacle Risk',
      slopeGrade: '0°–4° Floodplain w/ Dense Boulders',
      mobilityDesc: 'Dense distribution of imbricated flood-scoured boulders (Yogi, Barnacle Bill) requiring tight obstacle avoidance.',
      lat: 19.33,
      lng: -33.55,
      zoom: 6,
      stats: {
        length: '1,700 km',
        depth: 'Up to 1.5 km',
        rover: 'Sojourner (First Mars microrover)',
        landingDate: 'July 4, 1997'
      },
      summary: 'A dramatic Martian outflow channel carved by ancient catastrophic floods. NASA Mars Pathfinder and the Sojourner rover landed here, analyzing volcanic and impact rocks washed down from ancient highlands.',
      mission: 'Mars Pathfinder / Carl Sagan Memorial Station; demonstrated airbag landing and microrover mobility.',
      quadrangle: 'MC-11 Oxia Palus'
    },
    {
      id: 'elysium-planitia',
      name: 'Elysium Planitia',
      category: 'Equatorial Smooth Plain',
      shortTag: 'InSight Lander • Marsquakes',
      nasaClass: 'Soil over Bedrock',
      mobilityRisk: 'Lower Risk (Trafficable)',
      slopeGrade: '0°–2° Smooth Basalt Regolith',
      mobilityDesc: 'Extremely uniform, rock-poor impact-gardened regolith ideal for robotic arm instrument deployment.',
      lat: 4.50,
      lng: 135.62,
      zoom: 6,
      stats: {
        terrain: 'Homogeneous duricrust & fine sand',
        missionFocus: 'Planetary Seismology & Heat Flow',
        detectedQuakes: '1,319+ Marsquakes',
        landingDate: 'November 26, 2018'
      },
      summary: 'A flat, smooth volcanic plain nicknamed "the biggest parking lot on Mars." NASA InSight lander operated SEIS seismometer here, revealing Mars crustal thickness, mantle properties, and liquid core radius.',
      mission: 'NASA InSight Mission (2018–2022); established Martian seismological science.',
      quadrangle: 'MC-15 Elysium'
    },
    {
      id: 'hellas-planitia',
      name: 'Hellas Planitia',
      category: 'Giant Impact Basin',
      shortTag: 'Deepest Impact Basin • -7.1 km',
      nasaClass: 'Soil w/ Ripple Morphology',
      mobilityRisk: 'Caution (Moderate Risk)',
      slopeGrade: '0°–8° Floor / >15° Crater Rim',
      mobilityDesc: 'Thick atmospheric column (~11.5 mbar); dynamic aeolian dust storms and soft wind-blown drift deposits.',
      lat: -42.40,
      lng: 70.50,
      zoom: 4,
      stats: {
        diameter: '2,300 km (1,400 mi)',
        depth: '7.15 km below datum',
        surfacePressure: '~11.5 mbar (highest)',
        rimHeight: '~2 km above surrounding'
      },
      summary: 'The deepest impact structure on Mars and one of the largest recognized impact basins in the Solar System. Atmospheric pressure here is nearly double the planetary datum, periodically allowing atmospheric frost or haze.',
      mission: 'Surveyed by Mariner 9, Viking, Mars Global Surveyor, and Mars Express (HRSC imagery).',
      quadrangle: 'MC-28 Hellas'
    },
    {
      id: 'tharsis-region',
      name: 'Tharsis Region (Tharsis Rise)',
      category: 'Volcanic Plateau',
      shortTag: 'Volcanic Plateau • 5,000 km',
      nasaClass: 'Bedrock & Volcanic Shield',
      mobilityRisk: 'Lower Risk (Plateau)',
      slopeGrade: '2°–6° Gentle Regional Rise',
      mobilityDesc: 'Massive basaltic volcanic crust reoriented the Martian spin axis; high bearing capacity on basalt sheets.',
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
    }
  ];

  // Locations Manager Object
  const LocationsManager = {
    locations: MARS_LOCATIONS,
    layerGroup: null,
    visible: true,
    showLabels: true,

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
     * Create high-visibility custom card-beacon marker with permanent on-map label
     */
    createMarker: function (item) {
      const latDir = item.lat >= 0 ? 'N' : 'S';
      const lngDir = item.lng >= 0 ? 'E' : 'W';
      const formattedCoords = `${Math.abs(item.lat).toFixed(2)}° ${latDir}, ${Math.abs(item.lng).toFixed(2)}° ${lngDir}`;

      // Mobility risk color tokens
      let riskColor = '#20A66A'; // Green
      let riskBg = 'rgba(32, 166, 106, 0.16)';
      let riskClass = 'risk-green';

      if (item.mobilityRisk && item.mobilityRisk.includes('High Risk')) {
        riskColor = '#D94A45'; // Red
        riskBg = 'rgba(217, 74, 69, 0.2)';
        riskClass = 'risk-red';
      } else if (item.mobilityRisk && (item.mobilityRisk.includes('Caution') || item.mobilityRisk.includes('Moderate'))) {
        riskColor = '#E9B949'; // Yellow
        riskBg = 'rgba(233, 185, 73, 0.2)';
        riskClass = 'risk-yellow';
      }

      // NASA Fig 6.2 Unit Color Code
      let nasaUnitColor = '#4ADE80';
      if (item.nasaClass.includes('Bedrock')) nasaUnitColor = '#9333EA';
      else if (item.nasaClass.includes('Outcrop')) nasaUnitColor = '#4ADE80';
      else if (item.nasaClass.includes('Clasts')) nasaUnitColor = '#4B7C59';
      else if (item.nasaClass.includes('No Rocks')) nasaUnitColor = '#F3F4F6';
      else if (item.nasaClass.includes('Soil over Bedrock')) nasaUnitColor = '#F97316';
      else if (item.nasaClass.includes('Ripple')) nasaUnitColor = '#1E40AF';
      else if (item.nasaClass.includes('Big Rocks')) nasaUnitColor = '#EF4444';

      const iconHtml = `
        <div class="mars-marker-card ${riskClass}" data-location-id="${item.id}">
          <div class="mars-marker-beacon" title="${item.name}">
            <div class="marker-ping" style="border-color:${riskColor};"></div>
            <div class="marker-pin-outer" style="background:${riskColor};box-shadow:0 0 8px ${riskColor};"></div>
          </div>
          <div class="mars-marker-label">
            <div class="m-label-name">${item.name}</div>
            <div class="m-label-sub">
              <span class="m-tag">${item.shortTag}</span>
              <span class="m-nasa-pill" style="border-color:${nasaUnitColor};color:${nasaUnitColor};">
                ${item.nasaClass}
              </span>
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'mars-custom-div-icon',
        html: iconHtml,
        iconSize: [220, 36],
        iconAnchor: [10, 18],
        popupAnchor: [10, -20]
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });

      // Rich On-Map Popup
      const popupHtml = `
        <div class="mars-popup-container">
          <div class="popup-header-row">
            <span class="popup-category">${item.category}</span>
            <span class="popup-risk-badge" style="background:${riskBg};color:${riskColor};border:1px solid ${riskColor};">
              ${item.mobilityRisk}
            </span>
          </div>
          <h4 class="popup-title">${item.name}</h4>
          <div class="popup-coords-bar">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span>${formattedCoords}</span>
            <span style="margin-left:auto;color:var(--text-muted);">${item.quadrangle || 'Mars'}</span>
          </div>

          <div class="popup-nasa-info">
            <div class="p-info-row">
              <span class="p-label">NASA Fig 6.2 Unit:</span>
              <span class="p-val" style="color:${nasaUnitColor};font-weight:700;">${item.nasaClass}</span>
            </div>
            <div class="p-info-row">
              <span class="p-label">Slope Profile:</span>
              <span class="p-val">${item.slopeGrade}</span>
            </div>
            <div class="p-info-row">
              <span class="p-label">Mobility Rationale:</span>
              <span class="p-val" style="color:var(--text-secondary);">${item.mobilityDesc}</span>
            </div>
          </div>

          <div class="popup-summary">${item.summary}</div>

          <div class="popup-stats-strip">
            ${item.stats.height ? `<span><strong>Elev:</strong> ${item.stats.height}</span>` : ''}
            ${item.stats.diameter ? `<span><strong>Diam:</strong> ${item.stats.diameter}</span>` : ''}
            ${item.stats.length ? `<span><strong>Len:</strong> ${item.stats.length}</span>` : ''}
            ${item.stats.rover ? `<span><strong>Rover:</strong> ${item.stats.rover}</span>` : ''}
          </div>

          <button class="popup-inspect-btn" onclick="window.marsLocations.inspect('${item.id}')">
            OPEN FULL TELEMETRY DRAWER &rarr;
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 300,
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
     * Toggle permanent label visibility
     */
    toggleLabels: function (show) {
      this.showLabels = (typeof show === 'boolean') ? show : !this.showLabels;
      const cards = document.querySelectorAll('.mars-marker-label');
      cards.forEach((card) => {
        card.style.display = this.showLabels ? 'flex' : 'none';
      });
      return this.showLabels;
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
