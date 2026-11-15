/**
 * ============================================================================
 * MARS EXPLORER COMMAND CENTER — NASA Spirit Mission Research & Traversability Data
 * Official Source: NASA Mars Exploration Rover Spirit — End of Mission Report
 * JPL Publication: JPL D-92756 | Author: John L. Callas | Published: December 2015
 * NTRS Citation: https://ntrs.nasa.gov/citations/20160001767
 * ============================================================================
 */

(function (window) {
  'use strict';

  const SpiritMissionData = {
    metadata: {
      title: "Mars Exploration Rover Spirit End of Mission Report",
      jplDoc: "JPL D-92756",
      author: "John L. Callas, Project Manager, Mars Exploration Rover Project",
      publisher: "Jet Propulsion Laboratory, California Institute of Technology",
      published: "December 2015",
      landingDate: "January 4, 2004 (Sol 1) 04:35 UTC",
      landingSite: "Columbia Memorial Station, Gusev Crater (14.5684° S, 175.47263° E)",
      finalContact: "March 22, 2010 (Sol 2210)",
      endOfMission: "May 25, 2011",
      plannedDuration: "90 Sols (nominal mission)",
      actualDuration: "2,210 Sols (24x planned lifetime)",
      totalDriveDistanceMeters: 7730.50,
      totalImagesReturned: 124839,
      totalDataReturnedGB: 21.57,
      pdfUrl: "https://ntrs.nasa.gov/api/citations/20160001767/downloads/20160001767.pdf"
    },

    /**
     * Section 1: Science Highlights
     */
    scienceHighlights: [
      {
        id: "gusev-plains",
        title: "Gusev Crater Basaltic Plains & Impact Geology",
        location: "Gusev Crater floor (Landing site to Bonneville Crater)",
        discovery: "Early traverse across the crater plains revealed primitive, olivine-rich basaltic volcanic rocks (Adirondack class) only slightly altered by water, establishing a baseline of unaltered Martian volcanic crust.",
        significance: "Demonstrated that younger volcanic floods had buried whatever ancient lacustrine sediments originally covered the Gusev Crater floor.",
        sols: "1–156"
      },
      {
        id: "goethite-columbia",
        title: "Goethite in the Columbia Hills",
        location: "West Spur & Clovis Outcrop, Columbia Hills",
        discovery: "Discovered the iron oxyhydroxide mineral goethite (FeO(OH)) using the Mössbauer Spectrometer at Clovis outcrop.",
        significance: "Goethite forms exclusively in the presence of liquid water, providing the first conclusive proof that the older Columbia Hills rocks had undergone extensive aqueous alteration.",
        sols: "210–350"
      },
      {
        id: "opaline-silica",
        title: "Pure Opaline Silica (>90% SiO2)",
        location: "Gertrude Weise & Eastern Home Plate",
        discovery: "The locked right-front wheel excavated bright white sub-surface soil deposits composed of up to 91% amorphous opaline silica.",
        significance: "On Earth, such high concentrations of silica form only in acidic fumarolic steam vents or hot spring sinter deposits, providing strong evidence of past hydrothermal volcanic activity.",
        sols: "1150–1160"
      },
      {
        id: "hydrated-sulfates",
        title: "Hydrated Ferric & Magnesium Sulfates",
        location: "Paso Robles & Arad, Columbia Hills",
        discovery: "Trenching by rover wheels revealed light-toned soils rich in sulfur (up to 35% SO3), phosphorus, and hydrated magnesium and iron sulfates.",
        significance: "Identified low-pH, volatile-rich hydrothermal fluids that altered bedrock minerals under active fumarolic conditions.",
        sols: "400–600"
      },
      {
        id: "carbonate-comanche",
        title: "Magnesium-Iron Carbonates at Comanche Outcrop",
        location: "Comanche Outcrop, Columbia Hills",
        discovery: "Mini-TES, Mössbauer, and APXS jointly determined that the Comanche rock contains 16 to 34 wt% magnesium-iron carbonate (Mg,Fe)CO3.",
        significance: "Direct proof of a near-neutral hydrothermal environment under an ancient, dense carbon dioxide atmosphere, demonstrating that Mars did not turn universally acidic.",
        sols: "689 (Analysis published 2010)"
      },
      {
        id: "home-plate-hydrothermal",
        title: "Home Plate Volcaniclastic Structure",
        location: "Home Plate, Inner Basin",
        discovery: "Identified cross-bedded volcaniclastic surge deposits formed by explosive phreatomagmatic eruptions (magma interacting with subsurface water or ice).",
        significance: "Confirmed a complex volcanic center that sustained liquid water and steam circulation throughout the Noachian/Hesperian boundary.",
        sols: "744–2210"
      }
    ],

    /**
     * Section 2: Environmental Challenges & Historical Dust Factor Trend
     * Dust factor: 1.0 = pristine clean array; 0.0 = completely obscured.
     */
    dustFactorData: [
      { sol: 1, dustFactor: 1.00, energyWh: 900, notes: "Landing on Mars (Clean arrays)" },
      { sol: 100, dustFactor: 0.88, energyWh: 750, notes: "Nominal dust accumulation" },
      { sol: 254, dustFactor: 0.71, energyWh: 434, notes: "Winter 1 Solstice (Tilt: 13.5° N)" },
      { sol: 420, dustFactor: 0.93, energyWh: 820, notes: "Major wind cleaning event (Dust devil)" },
      { sol: 582, dustFactor: 0.75, energyWh: 590, notes: "Husband Hill Summit reach" },
      { sol: 779, dustFactor: 0.65, energyWh: 450, notes: "Right-Front wheel drive failure" },
      { sol: 923, dustFactor: 0.53, energyWh: 278, notes: "Winter 2 Solstice (Tilt: 11.5° N)" },
      { sol: 1175, dustFactor: 0.89, energyWh: 780, notes: "Wind cleaning event at Home Plate" },
      { sol: 1250, dustFactor: 0.55, energyWh: 390, notes: "Global dust storm of 2007 begins" },
      { sol: 1285, dustFactor: 0.38, energyWh: 260, notes: "Peak of global dust storm" },
      { sol: 1591, dustFactor: 0.35, energyWh: 227, notes: "Winter 3 Solstice (Tilt: 28.8° N)" },
      { sol: 1720, dustFactor: 0.42, energyWh: 290, notes: "Post-winter recovery" },
      { sol: 1845, dustFactor: 0.62, energyWh: 410, notes: "Cleaning event before Route 3" },
      { sol: 1886, dustFactor: 0.54, energyWh: 340, notes: "Embedding event at Troy" },
      { sol: 2100, dustFactor: 0.45, energyWh: 210, notes: "Right-Rear wheel failure during extrication" },
      { sol: 2210, dustFactor: 0.41, energyWh: 134, notes: "Last contact prior to Winter 4" },
      { sol: 2260, dustFactor: 0.38, energyWh: 110, notes: "Winter 4 Solstice (Estimated; tilt -9.2° S)" }
    ],

    /**
     * Section 3: Loss of Mobility & Odometry Milestones
     */
    mobilityMilestones: [
      { sol: 1, odometryM: 0, status: "All 6 wheels nominal at landing" },
      { sol: 125, odometryM: 1240, status: "Record single-sol drive: 122.7 m" },
      { sol: 133, odometryM: 1353, status: "Second-longest drive: 113.1 m" },
      { sol: 134, odometryM: 1462, status: "Third-longest drive: 109.5 m" },
      { sol: 156, odometryM: 3000, status: "Arrival at base of Columbia Hills" },
      { sol: 582, odometryM: 4802, status: "Summit of Husband Hill reached" },
      { sol: 744, odometryM: 6420, status: "Arrival at Home Plate" },
      { sol: 779, odometryM: 6512, status: "Right-Front (RF) wheel actuator failure. Rover driven in reverse, dragging RF wheel." },
      { sol: 1150, odometryM: 7120, status: "Dragging RF wheel excavates opaline silica trench" },
      { sol: 1871, odometryM: 7727, status: "Last successful drive before Troy" },
      { sol: 1886, odometryM: 7729, status: "Rover becomes embedded at Troy in loose sulfate sand" },
      { sol: 1899, odometryM: 7729.5, status: "Left-Middle (LM) wheel drive motor stalls and fails" },
      { sol: 2169, odometryM: 7730.5, status: "Final extrication drive completed. Total mission odometry: 7,730.50 m" }
    ],

    /**
     * Section 4: Historical Winter Comparison Table
     */
    winterTable: [
      {
        winterNumber: 1,
        sol: 254,
        northTiltDeg: 13.5,
        dustFactor: 0.71,
        dailyEnergyWh: 434,
        survivalStatus: "Nominal",
        description: "Successfully wintered on north-facing slope of West Spur; generous solar margin."
      },
      {
        winterNumber: 2,
        sol: 923,
        northTiltDeg: 11.5,
        dustFactor: 0.53,
        dailyEnergyWh: 278,
        survivalStatus: "Nominal",
        description: "Stationary on north-facing slope of Low Ridge; conducted extensive Mössbauer and Mini-TES experiments."
      },
      {
        winterNumber: 3,
        sol: 1591,
        northTiltDeg: 28.8,
        dustFactor: 0.35,
        dailyEnergyWh: 227,
        survivalStatus: "Challenging",
        description: "Parked on extreme 28.8° north-facing slope at Home Plate edge; lowest dust factor to date."
      },
      {
        winterNumber: 4,
        sol: 2260,
        northTiltDeg: -9.2,
        dustFactor: 0.40,
        dailyEnergyWh: 133,
        survivalStatus: "Loss of Contact",
        uncertain: true,
        description: "Stranded at Troy tilted 9.2° SOUTHWARD away from the sun. Daily energy dropped below survival threshold of 133 Wh on ~Sol 2210."
      }
    ],

    /**
     * Section 5 & 6 & 8: Home Plate Routes & Embedding at Troy
     */
    homePlateRoutes: [
      {
        routeId: "route-1",
        name: "Route 1 — Northern Traverse onto Home Plate",
        startDate: "Sol 1800",
        endDate: "Sol 1829",
        status: "Abandoned on Sol 1829",
        cause: "Rover encountered impassable slopes (>18°) and severe wheel slip while trying to re-climb the northern apron of Home Plate.",
        terrainIssue: "Steep bedrock outcrop with loose unconsolidated scree and high rock obstacle density."
      },
      {
        routeId: "route-2",
        name: "Route 2 — Northeast Circum-Traverse",
        startDate: "Sol 1830",
        endDate: "Sol 1843",
        status: "Abandoned on Sol 1843",
        cause: "Blocked by dense field of large basalt boulders and soft ripple terrain on the northeast perimeter.",
        terrainIssue: "Big rocks (>0.3 m) exceeding rover ground clearance (0.25 m), and ripple morphology with high embedding risk."
      },
      {
        routeId: "route-3",
        name: "Route 3 — Western Apron toward von Braun & Goddard",
        startDate: "Sol 1844",
        endDate: "Sol 1886",
        status: "Embedded at Troy on Sol 1886",
        cause: "On Sol 1886, while traversing a benign-looking 12° slope on the west side of Home Plate, the rover broke through a thin indurated surface crust into loose, un-cemented ferric and magnesium sulfate sands ('poppy-seed' soil).",
        terrainIssue: "Thin cemented crust (duricrust) overlying extremely weak, loose, frictionless sulfate sand. The wheels broke through, high-centering the rover belly pan on a concealed bedrock clast."
      }
    ],

    /**
     * Section 4 & Part 4: NASA Terrain Classification System (Report Figure 6.2)
     */
    terrainClassificationCategories: [
      {
        id: "purple",
        colorName: "Purple",
        hexColor: "#9333EA",
        categoryName: "Big rocks and boulder fields",
        description: "Dense fields of loose basaltic boulders greater than 25–30 cm in diameter.",
        mobilityIssue: "Severe hazard. Rocks exceed the rover's 25 cm ground clearance, causing high-centering, bumper strikes, and wheel entrapment.",
        reportSection: "Section 6.1 (Hazard Mapping Methodology)",
        riskLevel: "High Risk (Avoid across all slopes)"
      },
      {
        id: "light-green",
        colorName: "Light green",
        hexColor: "#4ADE80",
        categoryName: "Soil with embedded rock clasts",
        description: "Regolith containing interspersed pebble- to cobble-sized rocks firmly anchored in matrix.",
        mobilityIssue: "Moderate traction. Rocks provide bearing strength at low slopes (<8°), but introduce slip and tripping hazards at slopes >8°.",
        reportSection: "Section 6.2 (Terrain Categories & Slip Calibration)",
        riskLevel: "Trafficable at <8°; Caution at 4–8°; High Risk >8°"
      },
      {
        id: "grey-green",
        colorName: "Grey-green",
        hexColor: "#4B7C59",
        categoryName: "Soil over bedrock",
        description: "Thin mantle of sand and granules over solid, continuous basaltic or volcaniclastic bedrock.",
        mobilityIssue: "Highest trafficability. Subsurface bedrock provides reliable vertical support; risk is limited to wheel slip on slopes >12°.",
        reportSection: "Section 6.2 (Home Plate Geology)",
        riskLevel: "Trafficable at <12°; Caution at 12–16°; High Risk >16°"
      },
      {
        id: "white",
        colorName: "White",
        hexColor: "#F3F4F6",
        categoryName: "Sky or rover",
        description: "Non-terrain areas in forward and hazard camera imagery, including the Martian horizon, sky, and rover hardware.",
        mobilityIssue: "Masked out of automated traversability algorithms.",
        reportSection: "Section 6.2 (Automated Imagery Classification)",
        riskLevel: "Non-navigable (Hardware/Atmosphere)"
      },
      {
        id: "orange",
        colorName: "Orange",
        hexColor: "#F97316",
        categoryName: "Soil with no rocks",
        description: "Smooth, fine-grained dust and sand without stabilizing rock clasts or visible bedrock.",
        mobilityIssue: "Moderate to high hazard. Susceptible to shear failure under wheel pressure, high slip (>50%), and sinkage, especially on slopes >4°.",
        reportSection: "Section 6.2 & Section 6.3",
        riskLevel: "Trafficable at <0°; Caution at 0–8°; High Risk >8°"
      },
      {
        id: "dark-blue",
        colorName: "Dark blue",
        hexColor: "#1E40AF",
        categoryName: "Outcrop",
        description: "Exposed, competent layered bedrock (such as the volcaniclastic ash layers of Home Plate).",
        mobilityIssue: "Very high traction and bearing capacity on slopes up to 12°. Becomes slippery or impassable on steep ledges >16°.",
        reportSection: "Section 6.1 (Competent Rock Formations)",
        riskLevel: "Trafficable at <16°; Caution at 12–16°; High Risk >16°"
      },
      {
        id: "red",
        colorName: "Red",
        hexColor: "#EF4444",
        categoryName: "Soil with ripple morphology",
        description: "Wind-sculpted aeolian bedforms consisting of fine sand beneath coarse granule armoring.",
        mobilityIssue: "Extreme hazard. Wheel cleats fluidize the interior loose sand, causing 90–100% slip and rapid wheel burial (e.g. Purgatory dune on Opportunity, Troy on Spirit).",
        reportSection: "Section 6.2 & Section 6.4 (Aeolian Hazards)",
        riskLevel: "Caution at <0°; High Risk at any positive slope (>=0°)"
      }
    ],

    /**
     * Part 5: Original NASA Mobility Risk Matrix (Table from Chapter 6)
     */
    mobilityRiskMatrix: {
      slopeColumns: [
        { id: "s-neg", label: "Below 0°", min: -90, max: 0, description: "Downhill / negative slope" },
        { id: "s-0-4", label: "0° to 4°", min: 0, max: 4, description: "Flat / gently rolling terrain" },
        { id: "s-4-8", label: "4° to 8°", min: 4, max: 8, description: "Modest incline" },
        { id: "s-8-12", label: "8° to 12°", min: 8, max: 12, description: "Moderate slope" },
        { id: "s-12-16", label: "12° to 16°", min: 12, max: 16, description: "Steep slope (Critical threshold)" },
        { id: "s-16-plus", label: "Above 16°", min: 16, max: 90, description: "Very steep (Exceeds rover design margin)" }
      ],
      terrainRows: [
        {
          terrainType: "Soil over bedrock",
          classifications: ["GREEN", "GREEN", "GREEN", "YELLOW", "YELLOW", "RED"],
          notes: "Solid substrate prevents embedding; slip remains manageable up to 12°."
        },
        {
          terrainType: "Soil with embedded rock clasts",
          classifications: ["GREEN", "GREEN", "YELLOW", "RED", "RED", "RED"],
          notes: "Clasts provide traction at low slopes, but loose surrounding soil shears easily above 4°."
        },
        {
          terrainType: "Soil with no rocks",
          classifications: ["GREEN", "YELLOW", "YELLOW", "RED", "RED", "RED"],
          notes: "Low shear strength causes wheel sinkage and high slip (>50%) above 4°."
        },
        {
          terrainType: "Soil with ripple morphology",
          classifications: ["YELLOW", "RED", "RED", "RED", "RED", "RED"],
          notes: "Aeolian sand dunes trap wheels. High risk across virtually all slopes."
        },
        {
          terrainType: "Outcrop",
          classifications: ["GREEN", "GREEN", "GREEN", "GREEN", "YELLOW", "RED"],
          notes: "Best traction surface on Mars. High confidence up to 12° incline."
        },
        {
          terrainType: "Big rocks",
          classifications: ["RED", "RED", "RED", "RED", "RED", "RED"],
          notes: "High risk of high-centering, wheel entrapment, or collision across all slope angles."
        }
      ]
    },

    /**
     * Part 6: NASA Figure 6.2 Slope Visualization Scale
     */
    slopeScaleValues: [
      { deg: -10, colorHex: "#22c55e", label: "-10° (Downhill)", desc: "Negative gradient away from rover" },
      { deg: 0, colorHex: "#a5f3fc", label: "0° (Level)", desc: "Flat horizontal surface" },
      { deg: 4, colorHex: "#06b6d4", label: "4° (Mild)", desc: "Initial slip threshold for loose soils" },
      { deg: 8, colorHex: "#2563eb", label: "8° (Moderate)", desc: "High slip on embedded clast terrain" },
      { deg: 12, colorHex: "#9333ea", label: "12° (Steep)", desc: "Threshold of Troy embedding incline" },
      { deg: 16, colorHex: "#ec4899", label: "16° (Critical)", desc: "Maximum operational slope for outcrops" },
      { deg: 25, colorHex: "#831843", label: "25° (Extreme)", desc: "Impassable / gravitational rollover hazard" }
    ],

    /**
     * Part 9: Rover Extrication Drives (Report Table 7.1)
     */
    extricationDrives: [
      { sol: 2078, commandMm: 4500, actualMm: 12, slipPct: 99.7, stalls: "None", notes: "First forward drive attempt after testbed testing; massive wheel slip." },
      { sol: 2088, commandMm: 3800, actualMm: 9, slipPct: 99.8, stalls: "None", notes: "Backward drive attempt; minimal displacement." },
      { sol: 2095, commandMm: 5000, actualMm: 16, slipPct: 99.7, stalls: "None", notes: "Crab drive motion to loosen high-centered belly pan." },
      { sol: 2100, commandMm: 4000, actualMm: 11, slipPct: 99.7, stalls: "Right-Rear (RR)", notes: "Right-rear drive motor stalled; wheel resistance spiked." },
      { sol: 2101, commandMm: 2500, actualMm: 4, slipPct: 99.8, stalls: "RR Failed", notes: "RR motor permanently ceased nominal rotation (lost 3rd drive wheel)." },
      { sol: 2115, commandMm: 3000, actualMm: 8, slipPct: 99.7, stalls: "LM / RR", notes: "Four-wheel drive mode (LF, LR, RM). High-centered on buried rock." },
      { sol: 2130, commandMm: 2200, actualMm: 5, slipPct: 99.8, stalls: "None", notes: "Turning wheels in place to excavate supportive sand ramps." },
      { sol: 2150, commandMm: 3100, actualMm: 14, slipPct: 99.5, stalls: "None", notes: "Progress halted by increasing southward tilt." },
      { sol: 2169, commandMm: 2000, actualMm: 7, slipPct: 99.6, stalls: "None", notes: "Final drive attempt. Rover repositioned for stationary winter science. Extrication discontinued." }
    ],

    /**
     * Part 10: Appendix A Mission Statistics & Data
     */
    appendixA: {
      driveStatistics: {
        totalDriveDistanceMeters: 7730.50,
        longestDriveMeters: 122.7,
        longestDriveSol: 125,
        secondLongestDriveMeters: 113.1,
        secondLongestDriveSol: 133,
        thirdLongestDriveMeters: 109.5,
        thirdLongestDriveSol: 134,
        bumpsToPosition: 177,
        drivesForDistance: 302,
        totalDriveSols: 479,
        averageMetersPerDriveSol: 16.14
      },

      actuators: [
        { name: "Left-Front (LF) Drive", type: "Wheel Drive", revolutions: 163450, status: "Operational throughout mission" },
        { name: "Left-Middle (LM) Drive", type: "Wheel Drive", revolutions: 154210, status: "Stalled & failed on Sol 1899 at Troy" },
        { name: "Left-Rear (LR) Drive", type: "Wheel Drive", revolutions: 161890, status: "Operational throughout mission" },
        { name: "Right-Front (RF) Drive", type: "Wheel Drive", revolutions: 78420, status: "Failed on Sol 779; dragged in reverse for remainder of mission" },
        { name: "Right-Middle (RM) Drive", type: "Wheel Drive", revolutions: 159300, status: "Operational throughout mission" },
        { name: "Right-Rear (RR) Drive", type: "Wheel Drive", revolutions: 157840, status: "Stalled & failed on Sols 2100–2101 during extrication" },
        { name: "Steering Actuators (4x)", type: "Corner Steering", revolutions: 41200, status: "All 4 corner steering actuators remained functional" },
        { name: "High Gain Antenna (HGA) Az/El", type: "Gimbal Pointing", cycles: 12890, status: "Nominal DTE telecom tracking" },
        { name: "Pancam Mast Assembly (PMA)", type: "Mast Az/El", revolutions: 384500, status: "Nominal panoramic survey pointing" },
        { name: "Instrument Arm (IDD) 5-DOF", type: "Robotic Arm", cycles: 8940, status: "591 IDD sols completed" },
        { name: "Rock Abrasion Tool (RAT)", type: "Grind / Brush", revolutions: 48900, status: "101 RAT sols completed" }
      ],

      instrumentUsageSols: [
        { instrument: "Mini-TES (Thermal Emission Spectrometer)", sols: 1546, role: "Mineralogical reconnaissance from mast" },
        { instrument: "IDD (Instrument Deployment Device)", sols: 591, role: "Robotic arm contact positioning" },
        { instrument: "Mössbauer Spectrometer (MB)", sols: 462, role: "Iron-bearing mineral identification (Goethite discovery)" },
        { instrument: "APXS (Alpha Particle X-Ray Spectrometer)", sols: 359, role: "Elemental composition analysis" },
        { instrument: "MI (Microscopic Imager)", sols: 356, role: "Sub-millimeter rock texture imaging" },
        { instrument: "RAT (Rock Abrasion Tool)", sols: 101, role: "Grinding rock rind and brushing dust" }
      ],

      dataReturnGB: [
        { link: "2001 Mars Odyssey (ODY)", gb: 20.72, pct: 96.1, description: "Primary UHF relay orbiter" },
        { link: "Direct-to-Earth (DTE)", gb: 0.37, pct: 1.7, description: "X-band Deep Space Network direct communications" },
        { link: "Mars Global Surveyor (MGS)", gb: 0.35, pct: 1.6, description: "Early UHF relay (2004–2006)" },
        { link: "Mars Reconnaissance Orbiter (MRO)", gb: 0.12, pct: 0.6, description: "Electra UHF relay" },
        { link: "Mars Express (MEX - ESA)", gb: 0.01, pct: 0.05, description: "International interoperability relay tests" }
      ],

      imageStatistics: [
        { camera: "Pancam (Panoramic Camera)", count: 80568, role: "High-resolution stereo color multispectral imaging" },
        { camera: "Navcam (Navigation Camera)", count: 27432, role: "Wide-field stereo black-and-white terrain mapping" },
        { camera: "Front Hazcam (Hazard Cameras)", count: 7432, role: "Forward wheel clearance & obstacle detection" },
        { camera: "Microscopic Imager (MI)", count: 6053, role: "Extreme close-up mineral grain photography" },
        { camera: "Rear Hazcam (Hazard Cameras)", count: 3351, role: "Reverse driving & rear obstacle monitoring" },
        { camera: "EDL Descent Imager (DIMES)", count: 3, role: "Descent horizontal velocity tracking" }
      ],

      acronyms: [
        { term: "APXS", def: "Alpha Particle X-Ray Spectrometer" },
        { term: "DTE", def: "Direct-to-Earth (X-Band telecom via Deep Space Network)" },
        { term: "EDL", def: "Entry, Descent, and Landing" },
        { term: "HGA", def: "High-Gain Antenna (gimbaled dish)" },
        { term: "IDD", def: "Instrument Deployment Device (5-joint robotic arm)" },
        { term: "MB", def: "Mössbauer Spectrometer" },
        { term: "MI", def: "Microscopic Imager" },
        { term: "Mini-TES", def: "Miniature Thermal Emission Spectrometer" },
        { term: "MRO", def: "Mars Reconnaissance Orbiter" },
        { term: "MSD", def: "Mars Sol Date (astronomical Sol counter since Dec 29, 1873)" },
        { term: "MTC", def: "Coordinated Mars Time (Airy-0 Prime Meridian equivalent)" },
        { term: "ODY", def: "2001 Mars Odyssey Orbiter" },
        { term: "PMA", def: "Pancam Mast Assembly" },
        { term: "RAT", def: "Rock Abrasion Tool" },
        { term: "SST", def: "Surface System Testbed (JPL ground sandbox replica)" },
        { term: "Wh", def: "Watt-hour (unit of daily solar array energy generation)" }
      ]
    }
  };

  // Expose to window
  window.SpiritMissionData = SpiritMissionData;

})(window);

