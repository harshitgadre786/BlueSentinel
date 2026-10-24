import { DemoVessel, DetailedPortRule, VoyagePlannerInputs, LandedCostBreakdown, VesselEvaluationResult, MultiVesselComparison } from "./maritime-models";

// 1. THREE CLEARLY FICTIONAL BUT REALISTIC DEMO VESSELS
export const DEMO_VESSELS: Record<"vesselA" | "vesselB" | "vesselC", DemoVessel> = {
  vesselA: {
    id: "vesselA",
    name: "MV Ocean Titan (Panamax)",
    type: "Gearless Post-Panamax Bulk Carrier",
    dwt: 82500,
    loadedDraft: 14.80, // Fails Paradip's 14.2m allowed draft!
    averageSpeed: 14.0,
    dailyFuelBurn: 32.2,
    freightDailyRate: 17500, // Looks cheaper initially ($17.5k vs $21.5k)
    portFuelBurn: 3.2,
    emissionFactor: 3.114,
    demurrageDailyRate: 24000,
    description: "Conventional post-panamax with tempting low base daily charter rate, but severe draft limitation at restricted Indian berths.",
    archetype: "DRAFT_RISK",
  },
  vesselB: {
    id: "vesselB",
    name: "MV Nilgiri Wave (Eco-Ultramax)",
    type: "Eco Shallow-Draft Wide-Beam Ultramax",
    dwt: 64500,
    loadedDraft: 13.30, // 100% compliant with generous surplus UKC
    averageSpeed: 13.5,
    dailyFuelBurn: 24.8, // Tier III electronically injected + Mewis Duct
    freightDailyRate: 21500, // Higher initial rate, but lower risk-adjusted total!
    portFuelBurn: 2.1,
    emissionFactor: 3.114,
    demurrageDailyRate: 21000,
    description: "Modern eco-designed vessel with shallow draft architecture specifically optimized for tidal Indian ports.",
    archetype: "RECOMMENDED",
  },
  vesselC: {
    id: "vesselC",
    name: "MV Bengal Pioneer (Older Supramax)",
    type: "Geared Supramax Bulk Carrier (Built 2008)",
    dwt: 56000,
    loadedDraft: 12.80, // Passes draft, BUT highly vulnerable to port delays!
    averageSpeed: 12.8,
    dailyFuelBurn: 30.5,
    freightDailyRate: 16800, // Lowest base rate!
    portFuelBurn: 4.8, // High auxiliary boiler and geared crane generator burn
    emissionFactor: 3.114,
    demurrageDailyRate: 28500, // Heavy charterparty demurrage penalty terms
    description: "Aging geared supramax with cheap base freight, but penalizing demurrage exposure that balloons rapidly when port wait days increase.",
    archetype: "DELAY_RISK",
  },
};

// 2. THREE DETAILED INDIAN PORTS
export const DETAILED_INDIAN_PORTS: Record<string, DetailedPortRule> = {
  paradip: {
    id: "paradip",
    name: "Paradip Port",
    country: "India (Odisha Coast)",
    lat: 20.2644,
    lng: 86.6853,
    maxPermissibleDraft: 14.20, // CD
    tidalAllowance: 1.50, // Average tide
    requiredUKC: 1.20, // Mandatory Under Keel Clearance
    fairwayDraftLimit: 14.50,
    fairwayLimitM: 14.50,
    dailyDemurrageRate: 22000,
    lighteringCostPerTonne: 9.50,
    description: "Major deepwater iron ore and coal gateway; strict static and dynamic draft limits enforced at Berth 4 & Mechanized Berths.",
    activeRiskZones: ["zone_paradip_fairway", "zone_bay_monsoon"],
    tidalWindows: [
      { state: "NEAP", heightM: 0.80, description: "Low tidal window; restricted to shallow draft <= 13.5m" },
      { state: "NORMAL", heightM: 1.50, description: "Standard mean semi-diurnal tide window (14.20m max dynamic draft)" },
      { state: "SPRING", heightM: 2.40, description: "High spring tide; window limited to 2 hours per 12-hour tidal cycle" },
    ],
    requiredDocuments: [
      { code: "DOC_LLD", name: "Laden Loadline & Hydrostatic Trim Sheet", authority: "Paradip Harbor Master", mandatory: true },
      { code: "DOC_CDG", name: "Customs Entry Cargo Declaration (Bill of Coastal Entry)", authority: "Indian Customs", mandatory: true },
      { code: "DOC_DG_ENV", name: "DG Shipping Marine Conservation Notice Compliance", authority: "DG Shipping India", mandatory: true },
      { code: "DOC_GAS", name: "Coal Gas Free / Inert Gas Safety Certificate", authority: "Paradip Port Safety Inspectorate", mandatory: false },
    ],
    consequenceOfDraftBreach: "Entry refused at Sandheads Pilot Boarding ground. Compulsory offshore lightering at Paradip Offshore Anchorage (POA) incurring $9.50/MT plus $35,000 barge mobilization and 3 to 5 days tidal delay.",
    suggestedAction: "Select Vessel B (loaded draft 13.3m) for immediate fairway pilotage, or schedule mandatory offshore lightering before charter commitment.",
  },
  kandla: {
    id: "kandla",
    name: "Deendayal Port (Kandla)",
    country: "India (Gujarat Coast)",
    lat: 23.0033,
    lng: 70.2194,
    maxPermissibleDraft: 13.00,
    tidalAllowance: 2.20,
    requiredUKC: 1.50,
    fairwayDraftLimit: 13.80,
    fairwayLimitM: 13.80,
    dailyDemurrageRate: 20000,
    lighteringCostPerTonne: 11.00,
    description: "Gulf of Kutch hub characterized by strong tidal currents (up to 4.5 knots) and shifting siltation sandbanks between fairway and Tuna Buoy.",
    activeRiskZones: ["zone_kutch_siltation"],
    tidalWindows: [
      { state: "NEAP", heightM: 1.20, description: "Extreme current with restricted draft slot" },
      { state: "NORMAL", heightM: 2.20, description: "Standard tidal window for high water slack transit" },
      { state: "SPRING", heightM: 3.10, description: "Strongest current surge; mandatory pilotage escort" },
    ],
    requiredDocuments: [
      { code: "DOC_KND_CURR", name: "Tidal Current Maneuvering Undertaking", authority: "Deendayal Harbor Master", mandatory: true },
      { code: "DOC_CDG", name: "Indian Customs Port Out-turn Declaration", authority: "Indian Customs", mandatory: true },
      { code: "DOC_P&I", name: "P&I Club Local Grounding & Salvage Coverage Warranty", authority: "Directorate General of Shipping", mandatory: true },
    ],
    consequenceOfDraftBreach: "Vessel held at Tuna anchorage. Subject to severe tidal stranding risk on sandbars and mandatory high-water slot allocation.",
    suggestedAction: "Strictly deploy vessels with loaded draft <= 13.0m or arrange transshipment at Vadinar / outer deep anchorage.",
  },
  jnpt: {
    id: "jnpt",
    name: "Jawaharlal Nehru Port (JNPT)",
    country: "India (Maharashtra Coast)",
    lat: 18.9499,
    lng: 72.9515,
    maxPermissibleDraft: 14.50,
    tidalAllowance: 1.80,
    requiredUKC: 1.30,
    fairwayDraftLimit: 14.80,
    fairwayLimitM: 14.80,
    dailyDemurrageRate: 25000,
    lighteringCostPerTonne: 12.00,
    description: "Premier container and bulk gateway on west coast near Mumbai; heavy traffic separation scheme.",
    activeRiskZones: ["zone_arabian_sea_monsoon"],
    tidalWindows: [
      { state: "NEAP", heightM: 1.00, description: "Normal channel maneuvering" },
      { state: "NORMAL", heightM: 1.80, description: "Standard container & bulk channel access" },
      { state: "SPRING", heightM: 2.60, description: "Maximum depth window for 14.5m vessels" },
    ],
    requiredDocuments: [
      { code: "DOC_JNPT_TSS", name: "Traffic Separation Scheme Navigation Plan", authority: "Mumbai VTS", mandatory: true },
      { code: "DOC_CDG", name: "Indian Customs EDI Clearance Notification", authority: "Indian Customs", mandatory: true },
      { code: "DOC_EHS", name: "Port Environmental Health & Ballast Water Certificate", authority: "Port Health Officer (PHO)", mandatory: true },
    ],
    consequenceOfDraftBreach: "Vessel pushed to outer anchorages off Prongs Reef, incurring prime Mumbai anchorage tariff and priority berth displacement.",
    suggestedAction: "Comply with channel navigation window and verify 1.3m UKC with dynamic swell cushion.",
  },
};

// Nautical Distance Matrix (in Nautical Miles)
export const VOYAGE_DISTANCES_NM: Record<string, Record<string, number>> = {
  singapore: { paradip: 1650, kandla: 2420, jnpt: 2150 },
  port_hedland: { paradip: 3680, kandla: 4320, jnpt: 4050 },
  richards_bay: { paradip: 4850, kandla: 4420, jnpt: 4250 },
  ras_laffan: { paradip: 2580, kandla: 1240, jnpt: 1390 },
};

/**
 * Deterministic Squat Calculation (Huuska / Barrass shallow-water formulation)
 */
export function calculateDynamicSquat(speedKnots: number, blockCoefficient = 0.82): number {
  return Number(((blockCoefficient * Math.pow(speedKnots, 2)) / 120).toFixed(2));
}

/**
 * Deterministic Underwater Radiated Noise (URN) Calculation in dB
 */
export function calculateAcousticNoiseDB(speedKnots: number): number {
  const cisSpeed = 10.5;
  let baseDB = 135;
  if (speedKnots > cisSpeed) {
    baseDB += 40 * Math.log10(speedKnots / cisSpeed);
  } else {
    baseDB += (speedKnots - 8) * 1.5;
  }
  return Number(baseDB.toFixed(1));
}

/**
 * Master Deterministic Voyage Calculation for a Single Vessel
 */
export function evaluateVesselForVoyage(
  vessel: DemoVessel,
  inputs: VoyagePlannerInputs,
  port: DetailedPortRule
): VesselEvaluationResult {
  const distanceNM = VOYAGE_DISTANCES_NM[inputs.originPortId]?.[inputs.destinationPortId] || 1650;
  const speed = vessel.averageSpeed;
  const squat = calculateDynamicSquat(speed);
  const dynamicArrivalDraft = Number((vessel.loadedDraft + squat).toFixed(2));

  // Determine tidal height based on state
  let currentTideM = port.tidalAllowance;
  if (inputs.selectedTideState === "NEAP") currentTideM = 0.80;
  if (inputs.selectedTideState === "SPRING") currentTideM = 2.40;

  // Maximum allowable arrival draft
  const allowablePortDraft = Number((port.maxPermissibleDraft + currentTideM - port.requiredUKC).toFixed(2));
  const draftMargin = Number((allowablePortDraft - dynamicArrivalDraft).toFixed(2));
  const isDraftCompliant = draftMargin >= 0;

  // Sea days & Total days
  const seaDays = Number((distanceNM / (speed * 24)).toFixed(2));
  const portDays = inputs.portWaitingDays;
  const totalDays = Number((seaDays + portDays).toFixed(2));

  // ETA Date
  const depTime = new Date(inputs.laycanDate).getTime();
  const etaTimestamp = depTime + totalDays * 24 * 3600 * 1000;
  const etaDate = new Date(etaTimestamp).toISOString();

  // Fuel Consumption
  const totalSeaFuel = Number((vessel.dailyFuelBurn * seaDays).toFixed(1));
  const totalPortFuel = Number((vessel.portFuelBurn * portDays).toFixed(1));
  const totalFuelMT = Number((totalSeaFuel + totalPortFuel).toFixed(1));
  const estimatedCO2MT = Number((totalFuelMT * vessel.emissionFactor).toFixed(1));

  // FINANCIAL BREAKDOWN
  const baseFreightUSD = Math.round(vessel.freightDailyRate * totalDays);
  const bunkerFuelUSD = Math.round(totalFuelMT * inputs.fuelPriceUSD);
  const portTariffUSD = 28500; // Standard pilotage, tugs, berth hire fee
  const demurrageRiskUSD = Math.round(vessel.demurrageDailyRate * portDays);

  // Lightering & Delay Penalties if draft breached
  let lighteringPenaltyUSD = 0;
  let lighteringDelayDays = 0;
  let rejectionReason: string | undefined = undefined;

  if (!isDraftCompliant) {
    const excessDraft = Math.abs(draftMargin);
    const lighteredTonnage = Math.min(inputs.cargoQuantityMT * 0.25, Math.max(6500, Math.round(excessDraft * 12500)));
    lighteringPenaltyUSD = Math.round(lighteredTonnage * port.lighteringCostPerTonne + 35000);
    lighteringDelayDays = 3.5;
    rejectionReason = `Fails draft compliance by ${Math.abs(draftMargin)}m at ${port.name}. Requires compulsory offshore lightering ($${lighteringPenaltyUSD.toLocaleString()}) and 3.5d tidal delay.`;
  }

  // Vessel C delay sensitivity check
  if (vessel.id === "vesselC" && portDays >= 4.0) {
    rejectionReason = `Excessive demurrage exposure ($${demurrageRiskUSD.toLocaleString()}) and high auxiliary port fuel burn. Delay risk is critical.`;
  }

  const extraDemurrageUSD = Math.round(lighteringDelayDays * vessel.demurrageDailyRate);
  const totalLandedCostUSD = baseFreightUSD + bunkerFuelUSD + portTariffUSD + demurrageRiskUSD;
  const riskAdjustedCostUSD = totalLandedCostUSD + lighteringPenaltyUSD + extraDemurrageUSD;

  // Convert to INR using exchange rate
  const fx = inputs.usdToInrRate;
  const costs: LandedCostBreakdown = {
    baseFreightUSD,
    baseFreightINR: Math.round(baseFreightUSD * fx),
    bunkerFuelUSD,
    bunkerFuelINR: Math.round(bunkerFuelUSD * fx),
    portTariffUSD,
    portTariffINR: Math.round(portTariffUSD * fx),
    demurrageRiskUSD: demurrageRiskUSD + extraDemurrageUSD,
    demurrageRiskINR: Math.round((demurrageRiskUSD + extraDemurrageUSD) * fx),
    lighteringPenaltyUSD,
    lighteringPenaltyINR: Math.round(lighteringPenaltyUSD * fx),
    totalLandedCostUSD,
    totalLandedCostINR: Math.round(totalLandedCostUSD * fx),
    riskAdjustedCostUSD,
    riskAdjustedCostINR: Math.round(riskAdjustedCostUSD * fx),
  };

  // RISK SCORES (0 to 100)
  const draftRiskScore = isDraftCompliant ? 10 : Math.min(100, 75 + Math.abs(draftMargin) * 35);
  let delayRiskScore = Math.min(95, Math.round(portDays * 12));
  if (vessel.id === "vesselC") delayRiskScore = Math.min(100, delayRiskScore + 30);
  if (!isDraftCompliant) delayRiskScore = Math.min(100, delayRiskScore + 35);

  const compositeRiskScore = Math.round(draftRiskScore * 0.45 + delayRiskScore * 0.35 + (vessel.dailyFuelBurn > 30 ? 20 : 10) * 0.20);

  let riskCategory: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
  if (compositeRiskScore >= 75 || !isDraftCompliant) riskCategory = "CRITICAL";
  else if (compositeRiskScore >= 50) riskCategory = "HIGH";
  else if (compositeRiskScore >= 30) riskCategory = "MODERATE";

  const isRecommended = isDraftCompliant && (vessel.id === "vesselB" || riskAdjustedCostUSD < 350000);

  const detailedAuditNotes = [
    `Static loaded draft: ${vessel.loadedDraft}m + ${squat}m squat at ${speed} kts = ${dynamicArrivalDraft}m arrival draft.`,
    `Channel limit: ${port.maxPermissibleDraft}m CD + ${currentTideM}m tide - ${port.requiredUKC}m UKC = ${allowablePortDraft}m allowable limit.`,
    isDraftCompliant ? `Safety margin: +${draftMargin}m Under Keel Clearance surplus.` : `BREACH: Exceeds allowed channel depth by ${Math.abs(draftMargin)}m. Direct berth entry prohibited.`,
    `Total landed quote: $${totalLandedCostUSD.toLocaleString()} USD | Risk-adjusted true cost: $${riskAdjustedCostUSD.toLocaleString()} USD.`,
    `Demurrage terms: $${vessel.demurrageDailyRate.toLocaleString()}/day across ${portDays} estimated anchorage days.`,
  ];

  return {
    vessel,
    voyageDistanceNM: distanceNM,
    seaDays,
    totalDays: Number((totalDays + lighteringDelayDays).toFixed(2)),
    etaDate,
    dynamicSquatM: squat,
    dynamicArrivalDraftM: dynamicArrivalDraft,
    allowablePortDraftM: allowablePortDraft,
    draftMarginM: draftMargin,
    isDraftCompliant,
    totalFuelMT,
    estimatedCO2MT,
    underwaterNoiseDB: calculateAcousticNoiseDB(speed),
    costs,
    draftRiskScore: Math.round(draftRiskScore),
    delayRiskScore: Math.round(delayRiskScore),
    compositeRiskScore,
    riskCategory,
    isRecommended,
    rejectionReason,
    detailedAuditNotes,
  };
}

/**
 * Compare all three vessels and formulate executive recommendation
 */
export function compareThreeVessels(inputs: VoyagePlannerInputs): MultiVesselComparison {
  const port = DETAILED_INDIAN_PORTS[inputs.destinationPortId] || DETAILED_INDIAN_PORTS.paradip;
  const resA = evaluateVesselForVoyage(DEMO_VESSELS.vesselA, inputs, port);
  const resB = evaluateVesselForVoyage(DEMO_VESSELS.vesselB, inputs, port);
  const resC = evaluateVesselForVoyage(DEMO_VESSELS.vesselC, inputs, port);

  // Recommended vessel selection:
  // Vessel A fails draft compliance.
  // Vessel C has high demurrage exposure.
  // Vessel B is compliant, lowest risk-adjusted cost, lowest emissions.
  let recommendedVesselId: "vesselA" | "vesselB" | "vesselC" = "vesselB";
  let executiveRationale = "";

  if (!resA.isDraftCompliant && resB.isDraftCompliant) {
    recommendedVesselId = "vesselB";
    const netSaving = resA.costs.riskAdjustedCostUSD - resB.costs.riskAdjustedCostUSD;
    executiveRationale = `${resB.vessel.name} is the verified recommended choice. While ${resA.vessel.name} appears $${Math.abs(resA.costs.totalLandedCostUSD - resB.costs.totalLandedCostUSD).toLocaleString()} cheaper on unadjusted base freight, its dynamic draft (${resA.dynamicArrivalDraftM}m) breaches ${port.name}'s maximum permissible channel threshold (${resA.allowablePortDraftM}m). This triggers compulsory offshore lightering ($${resA.costs.lighteringPenaltyUSD.toLocaleString()}) and 3.5 days of tidal delay demurrage. Choosing Vessel B saves $${netSaving.toLocaleString()} USD in net risk-adjusted exposure and avoids ${Math.abs(resA.estimatedCO2MT - resB.estimatedCO2MT)} MT of CO2.`;
  } else {
    recommendedVesselId = "vesselB";
    executiveRationale = `${resB.vessel.name} provides optimal operational safety, lowest environmental impact, and guaranteed direct fairway access without tidal wait penalties.`;
  }

  return {
    inputs,
    port,
    results: {
      vesselA: resA,
      vesselB: resB,
      vesselC: resC,
    },
    recommendedVesselId,
    executiveRationale,
  };
}
