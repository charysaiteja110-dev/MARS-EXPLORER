/**
 * ============================================================================
 * MARS EXPLORER COMMAND CENTER — Historical Mars Rover Route Visualization Engine
 * Module: rover-routes-engine.js
 * Visualizes verified exploration routes for:
 * 1. Curiosity (MSL) — Gale Crater (32.5 km)
 * 2. Perseverance (Mars 2020) — Jezero Crater (28.3 km)
 * 3. Opportunity (MER-B) — Meridiani Planum (45.16 km)
 * 4. Spirit (MER-A) — Gusev Crater (7.73 km)
 *
 * Includes Interactive Chronological Sol Timeline, Waypoints, and Rover Selector.
 * ============================================================================
 */

(function (window) {
  'use strict';

  const RoverRoutesEngine = {
    map: null,
    roverLayers: {}, // { roverId: L.layerGroup }
    masterRouteGroup: null,
    selectedRoverId: 'perseverance',
    timelineSol: 0,
    isPlayingTimeline: false,
    timelineInterval: null,

    /**
     * Initialize the Rover Route Visualization Engine with the Leaflet map
     */
    init: function (map) {
      this.map = map;
      this.masterRouteGroup = L.layerGroup().addTo(this.map);

      // Create LayerGroups for each rover
      const rovers = ['curiosity', 'perseverance', 'opportunity', 'spirit'];
      rovers.forEach(id => {
        this.roverLayers[id] = L.layerGroup().addTo(this.masterRouteGroup);
      });

      // Render all 4 historical rover routes
      this.renderAllRoutes();

      // Initialize UI Rover Selector & Route Timeline in DOM
      this.initRoverSelectorDOM();
      this.initTimelineDOM();

      console.log('🤖 Historical Mars Rover Route Engine Initialized.');
    },

    /**
     * Renders polylines, landing sites, and waypoint markers for all rovers
     */
    renderAllRoutes: function () {
      if (!window.RoverRoutesData) return;
      const rovers = window.RoverRoutesData.getAllRovers();

      rovers.forEach(rover => {
        this.renderRoverRoute(rover.id);
      });
    },

    /**
     * Renders single rover route with polylines and waypoints
     */
    renderRoverRoute: function (roverId, maxSol = Infinity) {
      if (!window.RoverRoutesData) return;
      const rover = window.RoverRoutesData.getRover(roverId);
      if (!rover) return;

      const layer = this.roverLayers[roverId];
      if (!layer) return;
      layer.clearLayers();

      // Filter waypoints up to current timeline sol
      const activeWaypoints = rover.waypoints.filter(w => w.sol <= maxSol);
      if (activeWaypoints.length === 0) return;

      const latlngs = activeWaypoints.map(w => [w.lat, w.lng]);

      // 1. Base Route Shadow Polyline (Glow effect)
      const shadowLine = L.polyline(latlngs, {
        color: rover.color,
        weight: 6,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false
      });
      layer.addLayer(shadowLine);

      // 2. Primary Route Polyline
      const mainLine = L.polyline(latlngs, {
        color: rover.color,
        weight: 3,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: true
      });

      mainLine.bindTooltip(`
        <div class="rover-route-tooltip">
          <strong style="color:${rover.color};">${rover.name} Historical Traverse</strong>
          <div>Traverse: <strong>${(rover.totalDistanceMeters / 1000).toFixed(2)} km</strong></div>
          <div>Total Sols: <strong>${rover.solsActive}</strong></div>
          <div class="tooltip-sub">Click to inspect waypoint milestones</div>
        </div>
      `, { sticky: true, className: 'custom-leaflet-tooltip' });

      mainLine.on('click', (e) => {
        if (window.MarsApp && window.MarsApp.measureActive) {
          L.DomEvent.stopPropagation(e);
          window.MarsApp.handleMeasureClick(e.latlng.lat, e.latlng.lng);
          return;
        }
        this.selectRover(rover.id);
      });
      layer.addLayer(mainLine);

      // 3. Landing Site Marker
      const landingPt = rover.waypoints[0];
      if (landingPt) {
        const landingIcon = L.divIcon({
          className: 'rover-landing-icon',
          html: `
            <div class="landing-badge" style="border-color:${rover.color};">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="${rover.color}">
                <polygon points="12 2 15 8 21 9 17 14 18 20 12 17 6 20 7 14 3 9 9 8 12 2"></polygon>
              </svg>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const landingMarker = L.marker([landingPt.lat, landingPt.lng], { icon: landingIcon });
        landingMarker.on('click', (e) => {
          if (window.MarsApp && window.MarsApp.measureActive) {
            L.DomEvent.stopPropagation(e);
            landingMarker.closePopup();
            window.MarsApp.handleMeasureClick(landingPt.lat, landingPt.lng);
          }
        });
        landingMarker.bindPopup(`
          <div class="rover-waypoint-popup">
            <div class="popup-badge" style="background:${rover.color};color:#000;">TOUCHDOWN SITE</div>
            <h4>${rover.name} // ${rover.landingSite}</h4>
            <div class="popup-date">Landing Date: <strong>${rover.landingDate}</strong></div>
            <div class="popup-coord">Coordinates: ${landingPt.lat.toFixed(4)}°, ${landingPt.lng.toFixed(4)}°</div>
            <div class="popup-obs">${landingPt.observation}</div>
            <div class="popup-source">Source: ${landingPt.source}</div>
          </div>
        `, { className: 'custom-leaflet-popup' });
        layer.addLayer(landingMarker);
      }

      // 4. Intermediate Historical Waypoint Markers
      activeWaypoints.forEach((wpt, index) => {
        if (index === 0) return; // Skip landing site already drawn

        const isLast = index === activeWaypoints.length - 1;
        const wptIcon = L.divIcon({
          className: 'rover-waypoint-icon',
          html: `
            <div class="wpt-dot ${isLast ? 'active-rover-head' : ''}" style="background:${isLast ? '#fff' : rover.color};border:2px solid ${rover.color};"></div>
          `,
          iconSize: isLast ? [14, 14] : [10, 10],
          iconAnchor: isLast ? [7, 7] : [5, 5]
        });

        const wptMarker = L.marker([wpt.lat, wpt.lng], { icon: wptIcon });
        wptMarker.on('click', (e) => {
          if (window.MarsApp && window.MarsApp.measureActive) {
            L.DomEvent.stopPropagation(e);
            wptMarker.closePopup();
            window.MarsApp.handleMeasureClick(wpt.lat, wpt.lng);
          }
        });
        wptMarker.bindPopup(`
          <div class="rover-waypoint-popup">
            <div class="popup-badge" style="background:${rover.color};color:#000;">SOL ${wpt.sol} WAYPOINT</div>
            <h4>${rover.name}: ${wpt.name}</h4>
            <div class="popup-date">Earth Date: <strong>${wpt.earthDate}</strong> (Sol ${wpt.sol})</div>
            <div class="popup-coord">Coordinates: ${wpt.lat.toFixed(4)}°, ${wpt.lng.toFixed(4)}° | Elev: ${wpt.elevation} m</div>
            <div class="popup-odom">Odometer Distance: <strong>${wpt.odometerMeters.toLocaleString()} m</strong></div>
            <div class="popup-obs">${wpt.observation}</div>
            <div class="popup-source">Source: ${wpt.source}</div>
          </div>
        `, { className: 'custom-leaflet-popup' });
        layer.addLayer(wptMarker);
      });
    },

    /**
     * Selects and focuses map on specific rover
     */
    selectRover: function (roverId) {
      this.selectedRoverId = roverId;
      if (!window.RoverRoutesData) return;
      const rover = window.RoverRoutesData.getRover(roverId);
      if (!rover) return;

      // Update UI cards active state
      const cards = document.querySelectorAll('.rover-selector-card');
      cards.forEach(card => {
        if (card.dataset.roverId === roverId) card.classList.add('active');
        else card.classList.remove('active');
      });

      // Fly map to rover exploration region
      this.focusRover(roverId);

      // Update timeline slider max Sols to match this rover
      this.updateTimelineForRover(rover);
    },

    /**
     * Focuses the Leaflet map on rover's operational region
     */
    focusRover: function (roverId) {
      if (!window.RoverRoutesData) return;
      const rover = window.RoverRoutesData.getRover(roverId);
      if (!rover || !this.map) return;

      const pts = rover.waypoints.map(w => [w.lat, w.lng]);
      const bounds = L.latLngBounds(pts);

      this.map.flyToBounds(bounds, {
        padding: [60, 60],
        maxZoom: 10,
        duration: 1.5
      });
    },

    /**
     * Toggles individual rover route visibility
     */
    toggleRoverRoute: function (roverId, isVisible) {
      const layer = this.roverLayers[roverId];
      if (!layer) return;

      if (isVisible) {
        if (!this.masterRouteGroup.hasLayer(layer)) {
          this.masterRouteGroup.addLayer(layer);
        }
      } else {
        if (this.masterRouteGroup.hasLayer(layer)) {
          this.masterRouteGroup.removeLayer(layer);
        }
      }
    },

    showAllRoutes: function () {
      Object.keys(this.roverLayers).forEach(id => {
        this.toggleRoverRoute(id, true);
      });
    },

    hideAllRoutes: function () {
      Object.keys(this.roverLayers).forEach(id => {
        this.toggleRoverRoute(id, false);
      });
    },

    /**
     * Initialize Rover Selector DOM elements
     */
    initRoverSelectorDOM: function () {
      let panel = document.getElementById('rover-routes-selector-panel');
      if (!panel) {
        panel = document.createElement('div');
        panel.id = 'rover-routes-selector-panel';
        panel.className = 'rover-routes-selector-panel';

        const mapContainer = document.querySelector('.map-central-viewport');
        if (mapContainer) {
          mapContainer.appendChild(panel);
        } else {
          document.body.appendChild(panel);
        }
      }

      if (!window.RoverRoutesData) return;
      const rovers = window.RoverRoutesData.getAllRovers();

      panel.innerHTML = `
        <div class="rover-selector-header">
          <span class="selector-tag">HISTORICAL ROVER EXPLORATION</span>
          <div class="selector-actions">
            <button id="btn-show-all-routes" class="sel-btn" title="Show all 4 rover routes">Show All</button>
            <button id="btn-hide-all-routes" class="sel-btn" title="Hide rover routes">Hide All</button>
            <button id="btn-toggle-rover-panel" class="sel-btn" title="Collapse / Expand Panel" style="padding: 2px 7px; font-weight: bold;">−</button>
          </div>
        </div>

        <div class="rover-cards-grid">
          ${rovers.map(r => `
            <div class="rover-selector-card ${r.id === this.selectedRoverId ? 'active' : ''}" data-rover-id="${r.id}">
              <div class="card-top">
                <span class="rover-color-dot" style="background:${r.color};"></span>
                <strong>${r.name}</strong>
                <span class="r-status-badge ${r.statusType}">${r.statusType === 'active' ? 'Active' : 'Completed'}</span>
              </div>
              <div class="card-site">${r.landingSite.split(',')[0]}</div>
              <div class="card-stats">
                <span>${(r.totalDistanceMeters / 1000).toFixed(1)} km driven</span>
                <span>${r.solsActive.split(' ')[0]} Sols</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Bind card clicks
      panel.querySelectorAll('.rover-selector-card').forEach(card => {
        card.addEventListener('click', () => {
          this.selectRover(card.dataset.roverId);
        });
      });

      document.getElementById('btn-show-all-routes')?.addEventListener('click', () => this.showAllRoutes());
      document.getElementById('btn-hide-all-routes')?.addEventListener('click', () => this.hideAllRoutes());
      document.getElementById('btn-toggle-rover-panel')?.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
        const btn = document.getElementById('btn-toggle-rover-panel');
        if (btn) btn.textContent = panel.classList.contains('collapsed') ? '+' : '−';
      });
    },

    /**
     * Initialize Chronological Route Timeline DOM
     */
    initTimelineDOM: function () {
      let timeline = document.getElementById('rover-route-timeline-hud');
      if (!timeline) {
        timeline = document.createElement('div');
        timeline.id = 'rover-route-timeline-hud';
        timeline.className = 'rover-route-timeline-hud';

        const mapContainer = document.querySelector('.map-central-viewport');
        if (mapContainer) {
          mapContainer.appendChild(timeline);
        } else {
          document.body.appendChild(timeline);
        }
      }

      const rover = window.RoverRoutesData ? window.RoverRoutesData.getRover(this.selectedRoverId) : null;
      const maxSol = rover ? rover.waypoints[rover.waypoints.length - 1].sol : 4000;

      timeline.innerHTML = `
        <div class="timeline-hud-inner">
          <div class="timeline-meta-col">
            <span class="timeline-tag">CHRONOLOGICAL TRAVERSE TIMELINE</span>
            <div id="timeline-rover-name" class="timeline-rover-title">${rover ? rover.name : 'Rover'} Traverse</div>
            <div id="timeline-sol-display" class="timeline-sol-readout">Sol 0 <span class="timeline-date-sub">(Landing)</span></div>
          </div>

          <div class="timeline-slider-col">
            <input type="range" id="timeline-sol-slider" min="0" max="${maxSol}" value="${maxSol}" step="1" class="timeline-slider">
            <div class="timeline-ticks">
              <span>Sol 0 (Touchdown)</span>
              <span id="timeline-mid-sol">Mid Mission</span>
              <span id="timeline-max-sol">Sol ${maxSol}</span>
            </div>
          </div>

          <div class="timeline-btn-col">
            <button id="timeline-play-btn" class="timeline-play-btn" title="Animate Traverse Progression">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Play</span>
            </button>
            <button id="timeline-focus-btn" class="timeline-focus-btn" title="Center on Rover Traverse">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="12 8 8 12 12 16 12 8"></polygon>
              </svg>
              <span>Focus</span>
            </button>
          </div>
        </div>
      `;

      // Bind slider input
      const slider = document.getElementById('timeline-sol-slider');
      slider?.addEventListener('input', (e) => {
        const sol = parseInt(e.target.value);
        this.setTimelineSol(sol);
      });

      // Bind Play button
      document.getElementById('timeline-play-btn')?.addEventListener('click', () => {
        this.toggleTimelinePlay();
      });

      // Bind Focus button
      document.getElementById('timeline-focus-btn')?.addEventListener('click', () => {
        this.focusRover(this.selectedRoverId);
      });
    },

    updateTimelineForRover: function (rover) {
      const title = document.getElementById('timeline-rover-name');
      const slider = document.getElementById('timeline-sol-slider');
      const maxSolEl = document.getElementById('timeline-max-sol');
      const midSolEl = document.getElementById('timeline-mid-sol');

      if (!rover || !slider) return;

      const maxSol = rover.waypoints[rover.waypoints.length - 1].sol;
      if (title) title.textContent = `${rover.name} Traverse (${rover.missionName})`;
      slider.max = maxSol;
      slider.value = maxSol;
      if (maxSolEl) maxSolEl.textContent = `Sol ${maxSol}`;
      if (midSolEl) midSolEl.textContent = `Sol ${Math.round(maxSol / 2)}`;

      this.setTimelineSol(maxSol);
    },

    setTimelineSol: function (sol) {
      this.timelineSol = sol;
      if (!window.RoverRoutesData) return;
      const rover = window.RoverRoutesData.getRover(this.selectedRoverId);
      if (!rover) return;

      // Find closest waypoint to display
      let currentWpt = rover.waypoints[0];
      for (const w of rover.waypoints) {
        if (w.sol <= sol) currentWpt = w;
        else break;
      }

      const solDisplay = document.getElementById('timeline-sol-display');
      if (solDisplay) {
        solDisplay.innerHTML = `Sol ${sol} <span class="timeline-date-sub">(${currentWpt.earthDate} &bull; ${currentWpt.name})</span>`;
      }

      // Re-render route up to this Sol
      this.renderRoverRoute(this.selectedRoverId, sol);
    },

    toggleTimelinePlay: function () {
      this.isPlayingTimeline = !this.isPlayingTimeline;
      const playBtn = document.getElementById('timeline-play-btn');

      if (this.isPlayingTimeline) {
        if (playBtn) playBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          <span>Pause</span>
        `;

        const slider = document.getElementById('timeline-sol-slider');
        if (!slider) return;

        let currentVal = parseInt(slider.value);
        const maxVal = parseInt(slider.max);
        if (currentVal >= maxVal) currentVal = 0;

        this.timelineInterval = setInterval(() => {
          currentVal += Math.max(1, Math.round(maxVal / 60));
          if (currentVal >= maxVal) {
            currentVal = maxVal;
            this.toggleTimelinePlay();
          }
          slider.value = currentVal;
          this.setTimelineSol(currentVal);
        }, 120);
      } else {
        if (playBtn) playBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <span>Play</span>
        `;
        if (this.timelineInterval) {
          clearInterval(this.timelineInterval);
          this.timelineInterval = null;
        }
      }
    }
  };

  window.RoverRoutesEngine = RoverRoutesEngine;
})(window);

