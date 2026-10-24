import {
  PortData,
  OriginPort,
  VesselOption,
  SimulationInputs,
  VesselCalculationResult,
  ComparisonVerdict,
  RiskZone,
} from "./types";

// Indian Destination Ports
export const INDIAN_PORTS: Record<string, PortData> = {
  paradip: {
    id: "paradip",
    name: "Paradip Port",
    country: "India (Odisha)",
    lat: 20.2644,
    lng: 86.6853,
    maxPermissibleDraft: 14.2, // meters CD
    tidalAllowance: 1.5, // meters average tide
    requiredUKC: 1.2, // meters safety under keel clearance
    fairwayDraftLimit: 14.5,
    dailyDemurrageRate: 22000, // USD / day
    lighteringCostPerTonne: 9.5, // USD / tonne
    description: "Major deepwater port on east coast; strict draft protocol at Coal/Iron Berths.",
    activeRiskZones: ["zone_paradip_fairway", "zone_bay_monsoon"],
  },
  kandla: {
    id: "kandla",
    name: "Deendayal Port (Kandla)",
    country: "India (Gujarat)",
    lat: 23.0033,
    lng: 70.2194,
    maxPermissibleDraft: 13.0,
    tidalAllowance: 2.2,
    requiredUKC: 1.5,
    fairwayDraftLimit: 13.8,
    dailyDemurrageRate: 20000,
    lighteringCostPerTonne: 11.0,
    description: "Gulf of Kutch port with heavy siltation and intense tidal currents; strict tidal windows.",
    activeRiskZones: ["zone_kutch_siltation"],
  },
  mundra: {
    id: "mundra",
    name: "Mundra Port",
    country: "India (Gujarat)",
    lat: 22.7441,
    lng: 69.7042,
    maxPermissibleDraft: 17.5,
    tidalAllowance: 1.0,
    requiredUKC: 1.2,
    fairwayDraftLimit: 18.0,
    dailyDemurrageRate: 24000,
    lighteringCostPerTonne: 8.5,
    description: "Deep-draft multi-cargo port accommodating Capesize vessels with low tidal constraint.",
    activeRiskZones: [],
  },
  jnpt: {
    id: "jnpt",
    name: "Jawaharlal Nehru Port (JNPT)",
    country: "India (Maharashtra)",
    lat: 18.9499,
    lng: 72.9515,
    maxPermissibleDraft: 14.5,
    tidalAllowance: 1.8,
    requiredUKC: 1.3,
    fairwayDraftLimit: 14.8,
    dailyDemurrageRate: 25000,
    lighteringCostPerTonne: 12.0,
    description: "Premier container and bulk gateway on west coast near Mumbai.",
    activeRiskZones: ["zone_arabian_sea_monsoon"],
  },
  vizag: {
    id: "vizag",
    name: "Visakhapatnam Port",
    country: "India (Andhra Pradesh)",
    lat: 17.6868,
    lng: 83.2185,
    maxPermissibleDraft: 14.5, // Inner harbour; outer is deeper
    tidalAllowance: 1.4,
    requiredUKC: 1.2,
    fairwayDraftLimit: 15.0,
    dailyDemurrageRate: 21000,
    lighteringCostPerTonne: 9.0,
    description: "Key eastern bulk hub; inner harbour draft capped at 14.5m with strict maneuvering rules.",
    activeRiskZones: ["zone_bay_monsoon"],
  },
};

// Origin Ports
export const ORIGIN_PORTS: Record<string, OriginPort> = {
  singapore: {
    id: "singapore",
    name: "Port of Singapore",
    country: "Singapore",
    lat: 1.29027,
    lng: 103.851959,
    cargoTypes: ["Clean Petroleum Products", "Iron Ore Fines", "Containerized Cargo", "Bunkers"],
  },
  port_hedland: {
    id: "port_hedland",
    name: "Port Hedland",
    country: "Australia",
    lat: -20.3122,
    lng: 118.5753,
    cargoTypes: ["Iron Ore", "Lump Ore", "Salt", "Manganese"],
  },
  richards_bay: {
    id: "richards_bay",
    name: "Richards Bay Coal Terminal",
    country: "South Africa",
    lat: -28.8045,
    lng: 32.0833,
    cargoTypes: ["Thermal Coal", "Titanium Slag", "Ferrochrome"],
  },
  ras_laffan: {
    id: "ras_laffan",
    name: "Ras Laffan Industrial Port",
    country: "Qatar",
    lat: 25.9083,
    lng: 51.545,
    cargoTypes: ["LNG", "LPG", "Condensate", "Sulfur"],
  },
  tanjung_pelepas: {
    id: "tanjung_pelepas",
    name: "Port of Tanjung Pelepas",
    country: "Malaysia",
    lat: 1.3653,
    lng: 103.5518,
    cargoTypes: ["Containers", "Palm Oil", "Bulk Agri"],
  },
};

// Nautical Distance Matrix (in Nautical Miles)
export const VOYAGE_DISTANCES_NM: Record<string, Record<string, number>> = {
  singapore: {
    paradip: 1650,
    kandla: 2420,
    mundra: 2390,
    jnpt: 2150,
    vizag: 1580,
  },
  port_hedland: {
    paradip: 3680,
    kandla: 4320,
    mundra: 4290,
    jnpt: 4050,
    vizag: 3550,
  },
  richards_bay: {
    paradip: 4850,
    kandla: 4420,
    mundra: 4390,
    jnpt: 4250,
    vizag: 4720,
  },
  ras_laffan: {
    paradip: 2580,
    kandla: 1240,
    mundra: 1210,
    jnpt: 1390,
    vizag: 2450,
  },
  tanjung_pelepas: {
    paradip: 1670,
    kandla: 2440,
    mundra: 2410,
    jnpt: 2170,
    vizag: 1600,
  },
};

// Default Vessels for Comparison
export const DEFAULT_VESSEL_A: VesselOption = {
  id: "vesselA",
  name: "MV Sagar Samrat (Panamax Bulk)",
  type: "Post-Panamax Gearless Bulk Carrier",
  dwt: 82500,
  loa: 229.0,
  beam: 32.26,
  staticDraft: 14.8, // 14.8m laden draft
  designSpeed: 14.2,
  baseCharterRatePerDay: 18500, // Appears cheaper upfront!
  baseFuelConsumptionPerDay: 31.8, // MT/day at design speed
  portAuxFuelConsumptionPerDay: 3.4,
  flag: "Marshall Islands",
  yearBuilt: 2014,
  engineType: "MAN B&W 6S60MC-C (Tier II)",
  baselineCII: "D",
  vesselNotes: "Conventional hull form; draft exceeds shallower east coast Indian tidal channels without offshore lightering.",
};

export const DEFAULT_VESSEL_B: VesselOption = {
  id: "vesselB",
  name: "MV Nilgiri Green (Eco-Ultramax)",
  type: "Eco-Designed Shallow-Draft Ultramax",
  dwt: 64200,
  loa: 199.9,
  beam: 32.26,
  staticDraft: 13.3, // 13.3m shallow draft design
  designSpeed: 13.8,
  baseCharterRatePerDay: 21000, // Higher daily charter base
  baseFuelConsumptionPerDay: 24.5, // High efficiency Tier III
  portAuxFuelConsumptionPerDay: 2.1,
  flag: "Singapore",
  yearBuilt: 2021,
  engineType: "MAN B&W 6S50ME-C9.7 with Mewis Duct (Tier III)",
  baselineCII: "A",
  vesselNotes: "Optimized shallow-draft design with wake-equalizing Mewis duct; 100% compliant at Paradip with zero lightering penalty.",
};

// Active Maritime Risk Zones (Prototype scenario data for decision modeling)
export const MARITIME_RISK_ZONES: RiskZone[] = [
  {
    id: "zone_paradip_fairway",
    name: "Prototype coastal sensitivity zone",
    type: "SHALLOW_DRAFT",
    severity: "danger",
    description: "Prototype scenario data: Sandheads approach fairway model subject to simulated siltation and turtle seasonal advisory.",
    coordinates: [
      [20.35, 86.6],
      [20.35, 86.85],
      [20.15, 86.85],
      [20.15, 86.6],
    ],
    mitigationRequirement: "Prototype guideline: Vessels with draft >14.0m evaluated for tidal transit or lightering.",
  },
  {
    id: "zone_bay_monsoon",
    name: "Bay of Bengal Monsoon & Cyclone Warning Sector",
    type: "CYCLONE_MONSOON",
    severity: "warning",
    description: "Prototype scenario data: Seasonal depression zone with simulated swell heights 3.5m - 5.0m.",
    coordinates: [
      [18.0, 84.0],
      [18.0, 90.0],
      [14.0, 90.0],
      [14.0, 84.0],
    ],
    mitigationRequirement: "Prototype guideline: Maintain dynamic UKC allowance +0.4m; evaluate speed reduction.",
  },
  {
    id: "zone_cetacean_corridor",
    name: "Prototype cetacean sensitivity zone",
    type: "CETACEAN_CORRIDOR",
    severity: "caution",
    description: "Prototype scenario data: Simulated marine mammal corridor south of international shipping lane.",
    coordinates: [
      [5.5, 79.5],
      [6.8, 82.5],
      [5.0, 82.5],
      [4.5, 79.5],
    ],
    mitigationRequirement: "Demo eco-speed threshold: 11.5 knots evaluated to model underwater radiated noise (URN) mitigation.",
  },
  {
    id: "zone_kutch_siltation",
    name: "Gulf of Kutch Tidal Ridge & Sandbanks",
    type: "SHALLOW_DRAFT",
    severity: "warning",
    description: "Tidal currents up to 4.5 knots and shifting shoals between Kandla Fairway and Tuna Buoy.",
    coordinates: [
      [22.8, 69.8],
      [23.1, 70.3],
      [22.6, 70.3],
      [22.5, 69.8],
    ],
    mitigationRequirement: "High-water slack water transit mandatory for draft >13.2m.",
  },
];

// Waypoint paths for Leaflet mapping
export const MARITIME_ROUTES: Record<string, [number, number][]> = {
  "singapore-paradip": [
    [1.29, 103.85], // Singapore
    [3.0, 100.5], // Malacca Strait
    [5.8, 95.3], // Banda Aceh / Great Channel
    [11.5, 92.5], // Andaman Sea
    [16.0, 89.0], // Bay of Bengal transit
    [19.8, 87.1], // Approaching Paradip Pilot Station
    [20.26, 86.68], // Paradip Berth
  ],
  "singapore-kandla": [
    [1.29, 103.85], // Singapore
    [5.8, 95.3], // Great Channel
    [5.8, 80.5], // South Sri Lanka
    [8.0, 76.5], // Cape Comorin
    [15.5, 72.8], // West Coast India
    [22.4, 69.0], // Gulf of Kutch
    [23.0, 70.22], // Kandla
  ],
  "port_hedland-paradip": [
    [-20.31, 118.57], // Port Hedland
    [-10.0, 110.0], // Indian Ocean
    [-0.5, 98.0], // West of Sumatra
    [6.0, 94.0], // Great Channel
    [14.0, 88.0], // Central Bay of Bengal
    [20.26, 86.68], // Paradip
  ],
  "richards_bay-kandla": [
    [-28.8, 32.08], // Richards Bay
    [-12.0, 48.0], // Madagascar channel
    [5.0, 60.0], // Central Arabian Sea
    [18.0, 68.0], // North Arabian Sea
    [23.0, 70.22], // Kandla
  ],
  "ras_laffan-mundra": [
    [25.9, 51.55], // Ras Laffan
    [26.3, 56.5], // Strait of Hormuz
    [23.8, 60.0], // Gulf of Oman
    [22.74, 69.7], // Mundra
  ],
};

/**
 * Deterministic Squat Calculation (Huuska / Barrass formula for bulk carriers in restricted/shallow water)
 * Squat (m) = Cb * (V^2 / 100) * K_s
 * Where Cb = Block coefficient (~0.82 for bulkers), V = speed in knots, K_s = shallow water factor (~1.1)
 */
export function calculateSquat(speedKnots: number, blockCoefficient = 0.82): number {
  const squatMeters = (blockCoefficient * Math.pow(speedKnots, 2)) / 120;
  return Number(Math.max(0.05, squatMeters).toFixed(2));
}

/**
 * Deterministic Fuel Consumption using Naval Architecture Admiralty Cubic Relation
 * F_daily = F_design * (V / V_design)^3
 */
export function calculateDailyFuel(
  baseDailyFuelMT: number,
  speedKnots: number,
  designSpeedKnots: number
): number {
  const ratio = speedKnots / designSpeedKnots;
  const consumption = baseDailyFuelMT * Math.pow(ratio, 3);
  return Number(consumption.toFixed(1));
}

/**
 * Deterministic Underwater Radiated Noise (URN) Index and Sound Pressure Level (dB re 1uPa @ 1m)
 * Cavitation Inception Speed (CIS) typically ~10.5 knots for bulk carriers.
 * Noise rises rapidly above CIS as propeller tip vortex cavitates.
 */
export function calculateUnderwaterNoise(speedKnots: number): {
  urnIndex: number; // 0 - 100 scale
  soundPressureDB: number; // dB
  isSanctuaryAlert: boolean;
} {
  const cisSpeed = 10.5;
  let baseDB = 135; // base auxiliary / machinery noise

  if (speedKnots > cisSpeed) {
    // Cavitation penalty ~ 40 * log10(V / V_cis)
    baseDB += 40 * Math.log10(speedKnots / cisSpeed);
  } else {
    baseDB += (speedKnots - 8) * 1.5;
  }

  // Convert to 0 - 100 scale where 135 dB = 20, 165 dB = 95
  const normalizedIndex = Math.min(100, Math.max(10, Math.round(((baseDB - 130) / 40) * 100)));
  const isSanctuaryAlert = speedKnots > 12.0 || normalizedIndex > 65;

  return {
    urnIndex: normalizedIndex,
    soundPressureDB: Number(baseDB.toFixed(1)),
    isSanctuaryAlert,
  };
}

/**
 * Deterministic IMO Carbon Emission Factor
 * 1 MT of VLSFO = 3.114 MT CO2 (IMO Resolution MEPC.308(73))
 */
export const IMO_CO2_FACTOR = 3.114;

/**
 * Calculate single vessel operational and financial metrics deterministically
 */
export function calculateVesselMetrics(
  vessel: VesselOption,
  inputs: SimulationInputs,
  port: PortData,
  distanceNM: number,
  draftOverride?: number
): VesselCalculationResult {
  const speed = inputs.speedKnots;
  const staticDraft = draftOverride ?? vessel.staticDraft;
  const squat = calculateSquat(speed);
  const dynamicDraft = Number((staticDraft + squat).toFixed(2));

  // Allowable draft at port = max permissible draft + tidal allowance - safety UKC
  const allowableDraft = Number(
    (port.maxPermissibleDraft + port.tidalAllowance - port.requiredUKC).toFixed(2)
  );
  const draftMargin = Number((allowableDraft - dynamicDraft).toFixed(2));
  const isDraftCompliant = draftMargin >= 0;

  // Sea voyage duration
  const seaHours = distanceNM / Math.max(8, speed);
  const seaDays = Number((seaHours / 24).toFixed(2));
  const portDays = inputs.estimatedPortWaitDays;
  const totalDays = Number((seaDays + portDays).toFixed(2));

  // Calculate ETA Date
  const depDate = new Date(inputs.departureDate);
  const etaTimestamp = depDate.getTime() + (seaDays + portDays) * 24 * 3600 * 1000;
  const etaDate = new Date(etaTimestamp).toISOString();

  // Fuel Consumption
  const dailyFuelSea = calculateDailyFuel(vessel.baseFuelConsumptionPerDay, speed, vessel.designSpeed);
  const totalSeaFuel = Number((dailyFuelSea * seaDays).toFixed(1));
  const totalPortFuel = Number((vessel.portAuxFuelConsumptionPerDay * portDays).toFixed(1));
  const totalFuelMT = Number((totalSeaFuel + totalPortFuel).toFixed(1));

  // Financials
  const bunkerFuelCostUSD = Math.round(totalFuelMT * inputs.fuelCostPerTonne);
  const charterCostUSD = Math.round(vessel.baseCharterRatePerDay * totalDays);
  const demurrageExposureUSD = Math.round(port.dailyDemurrageRate * portDays);

  // Lightering & draft breach penalties
  let lighteringRiskCostUSD = 0;
  let lighteringDelayDays = 0;
  if (!isDraftCompliant) {
    // Draft breached: requires lightering a portion of cargo offshore (approx 7,500 MT per 0.5m breach)
    const excessDraft = Math.abs(draftMargin);
    const lighteredTonnage = Math.min(
      inputs.cargoTonnage * 0.25,
      Math.max(6000, Math.round(excessDraft * 12500))
    );
    lighteringRiskCostUSD = Math.round(
      lighteredTonnage * port.lighteringCostPerTonne + 35000 // Mobilization barge fee
    );
    lighteringDelayDays = 3.5; // Additional port delay waiting for offshore barge ops and tidal cycle
  }

  const baseVoyageCostUSD = bunkerFuelCostUSD + charterCostUSD + demurrageExposureUSD;
  const extraDemurrageUSD = Math.round(lighteringDelayDays * port.dailyDemurrageRate);
  const riskAdjustedCostUSD = baseVoyageCostUSD + lighteringRiskCostUSD + extraDemurrageUSD;

  // Environmental Metrics
  const co2EmissionsMT = Number((totalFuelMT * IMO_CO2_FACTOR).toFixed(1));
  const noise = calculateUnderwaterNoise(speed);

  // Dynamic CII calculation (g CO2 / DWT * NM)
  const transportWork = vessel.dwt * distanceNM;
  const attainedAER = (co2EmissionsMT * 1e6) / transportWork;
  let ciiRating: "A" | "B" | "C" | "D" | "E" = "C";
  if (attainedAER < 4.2) ciiRating = "A";
  else if (attainedAER < 5.0) ciiRating = "B";
  else if (attainedAER < 6.2) ciiRating = "C";
  else if (attainedAER < 7.5) ciiRating = "D";
  else ciiRating = "E";

  // Risk Scores (0 - 100)
  // Draft risk: 0 if draftMargin >= 0.5m; 100 if breach < 0
  let draftRiskScore = 0;
  if (draftMargin < 0) {
    draftRiskScore = Math.min(100, 75 + Math.abs(draftMargin) * 35);
  } else if (draftMargin < 0.3) {
    draftRiskScore = 45; // Marginal clearance
  } else {
    draftRiskScore = 10;
  }

  // Weather risk based on port and sea conditions
  const weatherRiskScore = port.activeRiskZones.includes("zone_bay_monsoon") ? 42 : 18;

  // Port Congestion & Demurrage Risk
  let portCongestionRiskScore = Math.min(95, Math.round(portDays * 12));
  if (!isDraftCompliant) {
    portCongestionRiskScore = Math.min(100, portCongestionRiskScore + 35);
  }

  // Environmental risk
  const environmentalRiskScore = Math.round(
    noise.urnIndex * 0.5 + (ciiRating === "D" ? 30 : ciiRating === "E" ? 45 : 10)
  );

  // Total Composite Risk Score (Weighted 35% Draft + 25% Demurrage + 20% Weather + 20% Environmental)
  const totalRiskScore = Math.round(
    draftRiskScore * 0.35 +
      portCongestionRiskScore * 0.25 +
      weatherRiskScore * 0.2 +
      environmentalRiskScore * 0.2
  );

  let riskCategory: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
  if (totalRiskScore >= 75 || !isDraftCompliant) riskCategory = "CRITICAL";
  else if (totalRiskScore >= 50) riskCategory = "HIGH";
  else if (totalRiskScore >= 30) riskCategory = "MODERATE";

  return {
    vesselId: vessel.id,
    vesselName: vessel.name,
    vesselType: vessel.type,
    speedKnots: speed,
    voyageDistanceNM: distanceNM,
    seaDays,
    totalVoyageDays: Number((totalDays + lighteringDelayDays).toFixed(2)),
    etaDate,
    dynamicDraft,
    allowableDraft,
    draftMargin,
    isDraftCompliant,
    dailyFuelSea,
    totalSeaFuel,
    totalPortFuel,
    totalFuelMT,
    bunkerFuelCostUSD,
    charterCostUSD,
    demurrageExposureUSD: demurrageExposureUSD + extraDemurrageUSD,
    lighteringRiskCostUSD,
    baseVoyageCostUSD,
    riskAdjustedCostUSD,
    co2EmissionsMT,
    ciiRating,
    underwaterNoiseScore: noise.urnIndex,
    underwaterNoiseDB: noise.soundPressureDB,
    marineSanctuaryCaution: noise.isSanctuaryAlert,
    draftRiskScore: Math.round(draftRiskScore),
    weatherRiskScore,
    portCongestionRiskScore,
    environmentalRiskScore,
    totalRiskScore,
    riskCategory,
  };
}

/**
 * Compare two vessels and synthesize deterministic recommendation
 */
export function evaluateVesselComparison(
  resultA: VesselCalculationResult,
  resultB: VesselCalculationResult,
  port: PortData
): ComparisonVerdict {
  // If one fails draft compliance, the compliant vessel is strongly recommended
  let recommendedVesselId: "vesselA" | "vesselB" = "vesselB";
  let rationale = "";
  const bulletPoints: string[] = [];

  const costDiff = resultA.riskAdjustedCostUSD - resultB.riskAdjustedCostUSD;
  const fuelDiff = Number((resultA.totalFuelMT - resultB.totalFuelMT).toFixed(1));
  const co2Diff = Number((resultA.co2EmissionsMT - resultB.co2EmissionsMT).toFixed(1));
  const riskDiff = resultA.totalRiskScore - resultB.totalRiskScore;

  if (!resultA.isDraftCompliant && resultB.isDraftCompliant) {
    recommendedVesselId = "vesselB";
    rationale = `${resultB.vesselName} is overwhelmingly recommended. While ${resultA.vesselName} presents a deceptively lower base charter quote, its dynamic draft of ${resultA.dynamicDraft}m exceeds ${port.name}'s maximum safe threshold (${resultA.allowableDraft}m) by ${Math.abs(resultA.draftMargin)}m, triggering compulsory offshore lightering and tidal berth queuing.`;
    bulletPoints.push(
      `Draft Compliance: ${resultB.vesselName} complies cleanly with a +${resultB.draftMargin}m safety margin, whereas ${resultA.vesselName} breaches safe UKC by ${Math.abs(resultA.draftMargin)}m.`
    );
    bulletPoints.push(
      `Risk-Adjusted Economics: ${resultB.vesselName} delivers a net saving of $${Math.abs(costDiff).toLocaleString()} once lightering charges ($${resultA.lighteringRiskCostUSD.toLocaleString()}) and extended demurrage are factored.`
    );
    bulletPoints.push(
      `Decarbonization & ESG: ${resultB.vesselName} emits ${Math.abs(co2Diff)} MT less CO2 (CII Rating: ${resultB.ciiRating} vs ${resultA.ciiRating}) and operates at a quieter acoustic profile.`
    );
    bulletPoints.push(
      `Port Turnaround: Zero transshipment risk and guaranteed direct berthing window upon pilot boarding.`
    );
  } else if (resultA.isDraftCompliant && !resultB.isDraftCompliant) {
    recommendedVesselId = "vesselA";
    rationale = `${resultA.vesselName} is recommended because ${resultB.vesselName} fails draft compliance at ${port.name}.`;
    bulletPoints.push(`Draft Compliance: ${resultA.vesselName} is within safe draft limits.`);
  } else {
    // Both compliant or both non-compliant: compare risk adjusted cost
    if (resultA.riskAdjustedCostUSD < resultB.riskAdjustedCostUSD) {
      recommendedVesselId = "vesselA";
      rationale = `${resultA.vesselName} provides optimal risk-adjusted commercial efficiency with lower overall voyage cost and acceptable risk profile.`;
    } else {
      recommendedVesselId = "vesselB";
      rationale = `${resultB.vesselName} provides optimal risk-adjusted commercial efficiency with superior fuel economy and reduced environmental impact.`;
    }
  }

  return {
    recommendedVesselId,
    vesselAName: resultA.vesselName,
    vesselBName: resultB.vesselName,
    costDifferenceUSD: costDiff,
    fuelDifferenceMT: fuelDiff,
    co2DifferenceMT: co2Diff,
    riskScoreDifference: riskDiff,
    primaryRationale: rationale,
    bulletPoints,
  };
}

/**
 * Generate speed sensitivity curve data for real-time charting
 */
export function generateSpeedSensitivityCurve(
  vessel: VesselOption,
  inputs: SimulationInputs,
  port: PortData,
  distanceNM: number
) {
  const speeds = [10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0];
  return speeds.map((speed) => {
    const res = calculateVesselMetrics(
      vessel,
      { ...inputs, speedKnots: speed },
      port,
      distanceNM
    );
    return {
      speed,
      fuelMT: res.totalFuelMT,
      fuelCostUSD: res.bunkerFuelCostUSD,
      co2MT: res.co2EmissionsMT,
      seaDays: res.seaDays,
      noiseScore: res.underwaterNoiseScore,
      noiseDB: res.underwaterNoiseDB,
      dynamicDraft: res.dynamicDraft,
      isCompliant: res.isDraftCompliant,
    };
  });
}
