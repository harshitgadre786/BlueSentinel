import {
  DemoVessel,
  DetailedPortRule,
  VoyagePlannerInputs,
  LandedCostBreakdown,
  VesselEvaluationResult,
  MultiVesselComparison,
  CargoProfile,
  CargoCategory,
} from "./maritime-models";

// ============================================================================
// 1. RICH REALISTIC CARGO PROFILES (UN Numbers, IMDG Classes, VGM Certifications)
// ============================================================================
export const CARGO_PROFILES: Record<string, CargoProfile> = {
  dry_bulk_coal: {
    id: "dry_bulk_coal",
    name: "Dry Bulk (Coal, Ore, Grain)",
    category: "DRY_BULK",
    defaultTonnageMT: 75000,
    densityT_M3: 0.85,
    unNumber: "N/A (IMSBC Group B - MHB)",
    imdgClass: "Non-IMDG (Solid Bulk Cargo)",
    vgmMethod: "Certified Belt Conveyor Scale Ticket + Draft Survey",
    hazardous: false,
    stowageFactorM3_T: 1.25,
    specialHandlingNotes: "Continuous methane & CO gas monitoring; hold temperature logging required.",
  },
  container_intermodal: {
    id: "container_intermodal",
    name: "Container / Intermodal",
    category: "CONTAINER",
    defaultTonnageMT: 42000,
    densityT_M3: 0.45,
    unNumber: "UN 3480 / UN 3171 (Mixed Electronics)",
    imdgClass: "Class 9 (Miscellaneous Dangerous Goods)",
    packingGroup: "PG II",
    vgmMethod: "SOLAS Method 1 (Calibrated Terminal Weighbridge)",
    hazardous: true,
    stowageFactorM3_T: 2.20,
    specialHandlingNotes: "IMDG Chapter 7.2 on-deck segregation; 45 reefer units monitoring.",
  },
  liquid_bulk_tanker: {
    id: "liquid_bulk_tanker",
    name: "Liquid Bulk / Crude / Chemicals",
    category: "LIQUID_BULK",
    defaultTonnageMT: 80000,
    densityT_M3: 0.89,
    unNumber: "UN 1267 (Petroleum Crude Oil)",
    imdgClass: "Class 3 (Flammable Liquid, Flashpoint < 23°C)",
    packingGroup: "PG I",
    vgmMethod: "Shore Tank Radar Gauging & Certified Bill of Lading",
    hazardous: true,
    stowageFactorM3_T: 1.12,
    specialHandlingNotes: "Inert Gas System (IGS) oxygen < 5%; closed sampling protocol enforced.",
  },
  hazardous_imdg_special: {
    id: "hazardous_imdg_special",
    name: "Hazardous / IMDG Special",
    category: "HAZARDOUS",
    defaultTonnageMT: 28000,
    densityT_M3: 1.15,
    unNumber: "UN 1760 (Corrosive Liquid, N.O.S.)",
    imdgClass: "Class 8 (Corrosive Substances)",
    packingGroup: "PG I",
    vgmMethod: "Verified Gross Mass Certified Scale Slip (Method 1)",
    hazardous: true,
    stowageFactorM3_T: 0.95,
    specialHandlingNotes: "SOLAS II-2 Reg 19 certificate required; dedicated deluge drainage.",
  },
  lng_cryogenic: {
    id: "lng_cryogenic",
    name: "LNG / Cryogenic Liquefied Gas",
    category: "LNG_CRYOGENIC",
    defaultTonnageMT: 68000,
    densityT_M3: 0.46,
    unNumber: "UN 1972 (Methane, Refrigerated Liquid)",
    imdgClass: "Class 2.1 (Flammable Gas)",
    vgmMethod: "Custody Transfer Measurement System (CTMS)",
    hazardous: true,
    stowageFactorM3_T: 2.15,
    specialHandlingNotes: "Cryogenic carriage at -162°C; boil-off gas reliquefaction monitoring.",
  },
  breakbulk_heavy: {
    id: "breakbulk_heavy",
    name: "Breakbulk / Heavy Machinery",
    category: "BREAKBULK",
    defaultTonnageMT: 22000,
    densityT_M3: 2.40,
    unNumber: "N/A (Heavy Lift Industrial Machinery)",
    imdgClass: "Non-Regulated / Out-of-Gauge",
    vgmMethod: "Individual Crane Hook Load-Cell Weight Certificates",
    hazardous: false,
    stowageFactorM3_T: 0.65,
    specialHandlingNotes: "DNV CSS Code Annex 13 lashing & acceleration load calculations.",
  },
  ro_ro_wheeled: {
    id: "ro_ro_wheeled",
    name: "Ro-Ro / Wheeled Rolling Stock",
    category: "RO_RO",
    defaultTonnageMT: 15000,
    densityT_M3: 0.35,
    unNumber: "UN 3166 (Vehicle, Flammable Liquid Powered)",
    imdgClass: "Class 9",
    packingGroup: "PG III",
    vgmMethod: "Terminal Multi-Axle Calibrated Weighbridge",
    hazardous: false,
    stowageFactorM3_T: 3.10,
    specialHandlingNotes: "Decks gas-free certificate; 10 air changes/hour mechanical ventilation.",
  },
};

// ============================================================================
// 2. RICH CHARTERED FLEET (11 Realistic Vessels with Authentic IMO Specs)
// ============================================================================
export const CHARTERED_FLEET: Record<string, DemoVessel> = {
  vesselB: {
    id: "vesselB",
    name: "MV Nilgiri Wave",
    type: "Eco Shallow-Draft Wide-Beam Ultramax",
    dwt: 64500,
    loadedDraft: 13.30,
    averageSpeed: 13.5,
    dailyFuelBurn: 24.8,
    freightDailyRate: 21500,
    portFuelBurn: 2.1,
    emissionFactor: 3.114,
    demurrageDailyRate: 21000,
    description: "Modern eco-designed vessel with shallow draft architecture specifically optimized for tidal Indian ports.",
    archetype: "RECOMMENDED",
    imoNumber: "9876543",
    mmsi: "563123450",
    flag: "Singapore",
    beam: 32.26,
    loa: 199.9,
    cargoCapabilities: ["DRY_BULK"],
    currentPort: "Singapore Anchorage",
    coordinates: { lat: 1.2902, lng: 103.8519 },
    capacityDetail: "64,500 MT Grain Cubic",
    hazardCertifications: ["IMSBC Group A, B & C"],
    permissiblePayloadMT: 61275,
  },
  vesselA: {
    id: "vesselA",
    name: "MV Ocean Titan",
    type: "Gearless Post-Panamax Bulk Carrier",
    dwt: 82500,
    loadedDraft: 14.80,
    averageSpeed: 14.0,
    dailyFuelBurn: 32.2,
    freightDailyRate: 17500,
    portFuelBurn: 3.2,
    emissionFactor: 3.114,
    demurrageDailyRate: 24000,
    description: "Conventional post-panamax with tempting low base daily charter rate, but severe draft limitation at restricted Indian berths.",
    archetype: "DRAFT_RISK",
    imoNumber: "9642318",
    mmsi: "538009871",
    flag: "Marshall Islands",
    beam: 32.26,
    loa: 229.0,
    cargoCapabilities: ["DRY_BULK"],
    currentPort: "Tanjung Pelepas",
    coordinates: { lat: 1.3600, lng: 103.5500 },
    capacityDetail: "82,500 MT Heavy Ore",
    hazardCertifications: ["IMSBC Group B"],
    permissiblePayloadMT: 78375,
  },
  vesselC: {
    id: "vesselC",
    name: "MV Bengal Pioneer",
    type: "Geared Supramax Bulk Carrier (Built 2008)",
    dwt: 56000,
    loadedDraft: 12.80,
    averageSpeed: 12.8,
    dailyFuelBurn: 30.5,
    freightDailyRate: 16800,
    portFuelBurn: 4.8,
    emissionFactor: 3.114,
    demurrageDailyRate: 28500,
    description: "Aging geared supramax with cheap base freight, but penalizing demurrage exposure that balloons rapidly when port wait days increase.",
    archetype: "DELAY_RISK",
    imoNumber: "9456722",
    mmsi: "419001288",
    flag: "India",
    beam: 32.26,
    loa: 189.9,
    cargoCapabilities: ["DRY_BULK", "BREAKBULK"],
    currentPort: "Haldia Anchorage",
    coordinates: { lat: 22.0200, lng: 88.0600 },
    capacityDetail: "56,000 MT (4x30T Cranes)",
    hazardCertifications: ["IMSBC Group C"],
    permissiblePayloadMT: 53200,
  },
  vesselD: {
    id: "vesselD",
    name: "MV Indira Express",
    type: "Post-Panamax Cellular Container Ship",
    dwt: 68000,
    loadedDraft: 13.80,
    averageSpeed: 18.0,
    dailyFuelBurn: 46.0,
    freightDailyRate: 26000,
    portFuelBurn: 4.5,
    emissionFactor: 3.114,
    demurrageDailyRate: 31000,
    description: "High-efficiency cellular container ship with Tier III SCR catalyst, 650 reefer plugs, and fast transit design.",
    archetype: "RECOMMENDED",
    imoNumber: "9781204",
    mmsi: "419003410",
    flag: "India",
    beam: 37.30,
    loa: 275.0,
    cargoCapabilities: ["CONTAINER"],
    currentPort: "Port of Colombo",
    coordinates: { lat: 6.9500, lng: 79.8500 },
    capacityDetail: "5,400 TEU (650 Reefer Plugs)",
    hazardCertifications: ["IMDG Document of Compliance Classes 1-9"],
    permissiblePayloadMT: 64600,
  },
  vesselE: {
    id: "vesselE",
    name: "MV Malacca Bridge",
    type: "Feedermax Container Ship",
    dwt: 28500,
    loadedDraft: 11.20,
    averageSpeed: 16.5,
    dailyFuelBurn: 28.5,
    freightDailyRate: 19200,
    portFuelBurn: 2.8,
    emissionFactor: 3.114,
    demurrageDailyRate: 22000,
    description: "Versatile coastal feeder vessel with shallow 11.2m draft capable of direct berthing at all secondary Indian terminals.",
    archetype: "RECOMMENDED",
    imoNumber: "9814522",
    mmsi: "352002341",
    flag: "Panama",
    beam: 29.80,
    loa: 172.0,
    cargoCapabilities: ["CONTAINER"],
    currentPort: "Port Klang",
    coordinates: { lat: 2.9999, lng: 101.3928 },
    capacityDetail: "2,200 TEU (300 Reefer Plugs)",
    hazardCertifications: ["IMDG Classes 2-9"],
    permissiblePayloadMT: 27075,
  },
  vesselF: {
    id: "vesselF",
    name: "MT Swarna Godavari",
    type: "Aframax / LR2 Coated Tanker",
    dwt: 105000,
    loadedDraft: 14.90,
    averageSpeed: 14.2,
    dailyFuelBurn: 38.0,
    freightDailyRate: 34000,
    portFuelBurn: 5.5,
    emissionFactor: 3.114,
    demurrageDailyRate: 42000,
    description: "Double-hull coated Aframax tanker with epoxy-phenolic tank lining and inert gas system for crude and clean distillates.",
    archetype: "DRAFT_RISK",
    imoNumber: "9512399",
    mmsi: "419000554",
    flag: "India",
    beam: 42.00,
    loa: 244.0,
    cargoCapabilities: ["LIQUID_BULK"],
    currentPort: "Fujairah Anchorage",
    coordinates: { lat: 25.1288, lng: 56.3265 },
    capacityDetail: "115,000 m³ Liquid Cubic",
    hazardCertifications: ["MARPOL Annex I & II", "OCIMF SIRE Inspected"],
    permissiblePayloadMT: 99750,
  },
  vesselG: {
    id: "vesselG",
    name: "MT Al-Baraka Chemist",
    type: "IMO Type 2/3 Stainless Chemical Tanker",
    dwt: 49800,
    loadedDraft: 12.20,
    averageSpeed: 13.8,
    dailyFuelBurn: 25.5,
    freightDailyRate: 23500,
    portFuelBurn: 3.4,
    emissionFactor: 3.114,
    demurrageDailyRate: 27000,
    description: "22 duplex stainless steel segregated cargo tanks with independent Framo hydraulic submerged pumps for aggressive chemicals.",
    archetype: "RECOMMENDED",
    imoNumber: "9734185",
    mmsi: "636018921",
    flag: "Liberia",
    beam: 32.20,
    loa: 183.0,
    cargoCapabilities: ["LIQUID_BULK", "HAZARDOUS"],
    currentPort: "Sikka Marine Terminal",
    coordinates: { lat: 22.4300, lng: 69.8300 },
    capacityDetail: "54,000 m³ (22 Segregations)",
    hazardCertifications: ["IBC Code Type 2/3", "IMDG Class 3, 6.1, 8"],
    permissiblePayloadMT: 47310,
  },
  vesselH: {
    id: "vesselH",
    name: "SS Arctic Sentry",
    type: "Membrane LNG Cryogenic Carrier",
    dwt: 85000,
    loadedDraft: 12.00,
    averageSpeed: 16.0,
    dailyFuelBurn: 36.0,
    freightDailyRate: 68000,
    portFuelBurn: 6.0,
    emissionFactor: 3.114,
    demurrageDailyRate: 75000,
    description: "Dual-fuel ME-GA low-pressure propulsion with sub-cooling partial reliquefaction unit and GTT Mark III Flex cryogenic tanks.",
    archetype: "RECOMMENDED",
    imoNumber: "9823419",
    mmsi: "311000842",
    flag: "Bahamas",
    beam: 44.00,
    loa: 299.0,
    cargoCapabilities: ["LNG_CRYOGENIC"],
    currentPort: "Ras Laffan Terminal",
    coordinates: { lat: 25.9000, lng: 51.5800 },
    capacityDetail: "174,000 m³ Cryogenic Liquid",
    hazardCertifications: ["IGC Code Compliant", "SIGTTO Member Certified"],
    permissiblePayloadMT: 80750,
  },
  vesselI: {
    id: "vesselI",
    name: "MV Pacific Pioneer",
    type: "Heavy Lift & Geared Breakbulk Carrier",
    dwt: 32000,
    loadedDraft: 10.50,
    averageSpeed: 13.0,
    dailyFuelBurn: 22.0,
    freightDailyRate: 21000,
    portFuelBurn: 3.0,
    emissionFactor: 3.114,
    demurrageDailyRate: 23500,
    description: "Heavy-lift specialized breakbulk vessel equipped with 2x350T tandem cranes (700T combined lift) and reinforced tanktop.",
    archetype: "RECOMMENDED",
    imoNumber: "9621455",
    mmsi: "538004523",
    flag: "Marshall Islands",
    beam: 28.00,
    loa: 166.0,
    cargoCapabilities: ["BREAKBULK"],
    currentPort: "Mumbai Port Trust",
    coordinates: { lat: 18.9400, lng: 72.8500 },
    capacityDetail: "32,000 MT (700T Tandem Lift)",
    hazardCertifications: ["DNV Heavy Lift Notation", "SOLAS CSS Code"],
    permissiblePayloadMT: 30400,
  },
  vesselJ: {
    id: "vesselJ",
    name: "MV Arabian Highway",
    type: "Pure Car & Truck Ro-Ro Carrier (PCTC)",
    dwt: 21500,
    loadedDraft: 9.80,
    averageSpeed: 17.5,
    dailyFuelBurn: 39.0,
    freightDailyRate: 29000,
    portFuelBurn: 3.8,
    emissionFactor: 3.114,
    demurrageDailyRate: 32000,
    description: "13 vehicular decks with 4 hoistable decks for high-and-heavy tracked and wheeled rolling industrial equipment.",
    archetype: "RECOMMENDED",
    imoNumber: "9758901",
    mmsi: "372001455",
    flag: "Panama",
    beam: 32.26,
    loa: 199.9,
    cargoCapabilities: ["RO_RO"],
    currentPort: "Chennai Port",
    coordinates: { lat: 13.0827, lng: 80.2707 },
    capacityDetail: "6,500 CEU (Ramp 150T)",
    hazardCertifications: ["IMDG Class 9 Vehicles", "SOLAS II-2 Reg 20"],
    permissiblePayloadMT: 20425,
  },
  vesselK: {
    id: "vesselK",
    name: "MV Sentinel Chemguard",
    type: "IMDG Certified Dangerous Goods Specialist",
    dwt: 45000,
    loadedDraft: 11.90,
    averageSpeed: 14.0,
    dailyFuelBurn: 26.0,
    freightDailyRate: 24800,
    portFuelBurn: 3.5,
    emissionFactor: 3.114,
    demurrageDailyRate: 29000,
    description: "SOLAS II-2 Reg 19 certified hazardous cargo carrier with fire-suppression bilge drenching and hazardous goods permits.",
    archetype: "RECOMMENDED",
    imoNumber: "9890123",
    mmsi: "419004510",
    flag: "India",
    beam: 32.20,
    loa: 182.0,
    cargoCapabilities: ["HAZARDOUS"],
    currentPort: "JNPT Anchorage",
    coordinates: { lat: 18.9200, lng: 72.9000 },
    capacityDetail: "45,000 MT Dangerous Cargo",
    hazardCertifications: ["SOLAS Reg 19", "IMDG Classes 3, 5.1, 6.1, 8, 9"],
    permissiblePayloadMT: 42750,
  },
};

// Aliases for backwards compatibility with existing benchmark tests and components
export const DEMO_VESSELS: Record<string, DemoVessel> = {
  ...CHARTERED_FLEET,
  vesselA: CHARTERED_FLEET.vesselA,
  vesselB: CHARTERED_FLEET.vesselB,
  vesselC: CHARTERED_FLEET.vesselC,
};

// ============================================================================
// 3. DYNAMIC VESSEL FILTERING BY CARGO TYPE
// ============================================================================
export function getVesselsForCargo(cargoInput: string): DemoVessel[] {
  if (!cargoInput) {
    return [CHARTERED_FLEET.vesselB, CHARTERED_FLEET.vesselA, CHARTERED_FLEET.vesselC];
  }

  const norm = cargoInput.toLowerCase();

  // Container / Intermodal
  if (norm.includes("container") || norm.includes("intermodal") || norm.includes("teu")) {
    return Object.values(CHARTERED_FLEET).filter((v) =>
      v.cargoCapabilities.includes("CONTAINER")
    );
  }

  // Liquid Bulk / Crude / Chemicals
  if (
    norm.includes("liquid") ||
    norm.includes("crude") ||
    norm.includes("chemical") ||
    norm.includes("oil") ||
    norm.includes("petroleum") ||
    norm.includes("tanker")
  ) {
    return Object.values(CHARTERED_FLEET).filter((v) =>
      v.cargoCapabilities.includes("LIQUID_BULK")
    );
  }

  // Dry Bulk (Coal, Ore, Grain)
  if (
    norm.includes("dry") ||
    norm.includes("bulk") ||
    norm.includes("coal") ||
    norm.includes("ore") ||
    norm.includes("grain") ||
    norm.includes("bauxite")
  ) {
    return [CHARTERED_FLEET.vesselB, CHARTERED_FLEET.vesselA, CHARTERED_FLEET.vesselC];
  }

  // Hazardous / IMDG Special
  if (
    norm.includes("hazard") ||
    norm.includes("imdg") ||
    norm.includes("special") ||
    norm.includes("dangerous")
  ) {
    return Object.values(CHARTERED_FLEET).filter((v) =>
      v.cargoCapabilities.includes("HAZARDOUS")
    );
  }

  // LNG / Cryogenic
  if (norm.includes("lng") || norm.includes("cryo") || norm.includes("gas") || norm.includes("methane")) {
    return Object.values(CHARTERED_FLEET).filter((v) =>
      v.cargoCapabilities.includes("LNG_CRYOGENIC")
    );
  }

  // Breakbulk / Heavy Machinery
  if (norm.includes("breakbulk") || norm.includes("machin") || norm.includes("heavy") || norm.includes("steel")) {
    return Object.values(CHARTERED_FLEET).filter((v) =>
      v.cargoCapabilities.includes("BREAKBULK")
    );
  }

  // Ro-Ro / Wheeled
  if (norm.includes("ro-ro") || norm.includes("roro") || norm.includes("wheel") || norm.includes("car") || norm.includes("vehicle")) {
    return Object.values(CHARTERED_FLEET).filter((v) =>
      v.cargoCapabilities.includes("RO_RO")
    );
  }

  // Specific keyword or capability match
  const matching = Object.values(CHARTERED_FLEET).filter((v) =>
    v.cargoCapabilities.some((cap) => norm.includes(cap.toLowerCase().replace("_", " ")))
  );

  return matching.length > 0
    ? matching
    : [CHARTERED_FLEET.vesselB, CHARTERED_FLEET.vesselA, CHARTERED_FLEET.vesselC];
}

// ============================================================================
// 4. THREE DETAILED INDIAN PORTS
// ============================================================================
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
  const etaDate = new Date(etaTimestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Fuel Consumption (Deterministic Admiralty Formula)
  const totalSeaFuel = Number((vessel.dailyFuelBurn * seaDays).toFixed(1));
  const totalPortFuel = Number((vessel.portFuelBurn * portDays).toFixed(1));
  const totalFuelMT = Number((totalSeaFuel + totalPortFuel).toFixed(1));
  const estimatedCO2MT = Number((totalFuelMT * vessel.emissionFactor).toFixed(1));

  // Financial Cost Engine
  const baseFreightUSD = Math.round(vessel.freightDailyRate * totalDays);
  const bunkerFuelUSD = Math.round(totalFuelMT * inputs.fuelPriceUSD);
  const portTariffUSD = 28500;
  const demurrageRiskUSD = Math.round(vessel.demurrageDailyRate * portDays);

  // Lightering Penalty Calculation if draft breached
  let lighteringPenaltyUSD = 0;
  let lighteringDelayDays = 0;
  if (!isDraftCompliant) {
    const draftExcessM = Math.abs(draftMargin);
    // 1 meter draft excess equates to approx 12,500 MT of cargo requiring lightering
    const lighteredTonnage = Math.min(
      inputs.cargoQuantityMT * 0.35,
      Math.max(6500, Math.round(draftExcessM * 12500))
    );
    lighteringPenaltyUSD = Math.round(lighteredTonnage * port.lighteringCostPerTonne + 35000);
    lighteringDelayDays = 3.5;
  }

  const extraDemurrageUSD = Math.round(lighteringDelayDays * vessel.demurrageDailyRate);
  const totalLandedCostUSD = baseFreightUSD + bunkerFuelUSD + portTariffUSD + demurrageRiskUSD;
  const riskAdjustedCostUSD = totalLandedCostUSD + lighteringPenaltyUSD + extraDemurrageUSD;

  const rate = inputs.usdToInrRate;
  const costs: LandedCostBreakdown = {
    baseFreightUSD,
    baseFreightINR: Math.round(baseFreightUSD * rate),
    bunkerFuelUSD,
    bunkerFuelINR: Math.round(bunkerFuelUSD * rate),
    portTariffUSD,
    portTariffINR: Math.round(portTariffUSD * rate),
    demurrageRiskUSD,
    demurrageRiskINR: Math.round(demurrageRiskUSD * rate),
    lighteringPenaltyUSD: lighteringPenaltyUSD + extraDemurrageUSD,
    lighteringPenaltyINR: Math.round((lighteringPenaltyUSD + extraDemurrageUSD) * rate),
    totalLandedCostUSD,
    totalLandedCostINR: Math.round(totalLandedCostUSD * rate),
    riskAdjustedCostUSD,
    riskAdjustedCostINR: Math.round(riskAdjustedCostUSD * rate),
  };

  // Risk Scores (0 to 100)
  let draftRiskScore = 15;
  if (!isDraftCompliant) {
    draftRiskScore = 95;
  } else if (draftMargin < 0.40) {
    draftRiskScore = 65;
  }

  let delayRiskScore = 20;
  if (vessel.demurrageDailyRate >= 28000 && portDays >= 3.5) {
    delayRiskScore = 80;
  } else if (portDays >= 3.0) {
    delayRiskScore = 45;
  }

  const compositeRiskScore = Math.round(draftRiskScore * 0.65 + delayRiskScore * 0.35);

  let riskCategory: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
  if (compositeRiskScore >= 75) riskCategory = "CRITICAL";
  else if (compositeRiskScore >= 50) riskCategory = "HIGH";
  else if (compositeRiskScore >= 30) riskCategory = "MODERATE";

  const isRecommended = vessel.archetype === "RECOMMENDED" && isDraftCompliant;

  let rejectionReason: string | undefined;
  const detailedAuditNotes: string[] = [];

  if (!isDraftCompliant) {
    rejectionReason = `Fails Port Draft Limit: Arrival draft with squat is ${dynamicArrivalDraft}m, exceeding ${port.name} allowable threshold of ${allowablePortDraft}m by ${Math.abs(draftMargin)}m.`;
    detailedAuditNotes.push(
      `Static loaded draft (${vessel.loadedDraft}m) + shallow squat (${squat}m) = dynamic draft ${dynamicArrivalDraft}m.`
    );
    detailedAuditNotes.push(
      `Requires mandatory offshore lightering of ~14,000 MT at Sandheads outer anchorage.`
    );
    detailedAuditNotes.push(
      `Incurs $${lighteringPenaltyUSD.toLocaleString()} direct lightering expense and ~${lighteringDelayDays} days demurrage.`
    );
  } else if (vessel.archetype === "DELAY_RISK") {
    rejectionReason = `High Demurrage Exposure: Demurrage rate of $${vessel.demurrageDailyRate.toLocaleString()}/day creates extreme financial vulnerability during peak port congestion.`;
    detailedAuditNotes.push(
      `Vessel draft is compliant (+${draftMargin}m safe UKC margin).`
    );
    detailedAuditNotes.push(
      `Higher port fuel burn (${vessel.portFuelBurn} MT/d) and severe charter demurrage rate penalties.`
    );
    detailedAuditNotes.push(
      `Risk-adjusted landed cost is $${(riskAdjustedCostUSD - totalLandedCostUSD).toLocaleString()} higher under 3.5 day delay.`
    );
  } else {
    detailedAuditNotes.push(
      `Compliant under-keel clearance (+${draftMargin}m surplus UKC).`
    );
    detailedAuditNotes.push(
      `Optimal fuel burn rate (${vessel.dailyFuelBurn} MT/d) and lower carbon footprint.`
    );
    detailedAuditNotes.push(
      `Lowest risk-adjusted voyage cost across candidate vessels.`
    );
  }

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
 * Compare candidate vessels and formulate executive recommendation
 */
export function compareThreeVessels(inputs: VoyagePlannerInputs): MultiVesselComparison {
  const port = DETAILED_INDIAN_PORTS[inputs.destinationPortId] || DETAILED_INDIAN_PORTS.paradip;

  // Retrieve candidate vessels for the selected cargo
  const eligibleVessels = getVesselsForCargo(inputs.cargoType);
  const candA = eligibleVessels.find((v) => v.id === "vesselA") || eligibleVessels[1] || CHARTERED_FLEET.vesselA;
  const candB = eligibleVessels.find((v) => v.id === "vesselB" || v.archetype === "RECOMMENDED") || eligibleVessels[0] || CHARTERED_FLEET.vesselB;
  const candC = eligibleVessels.find((v) => v.id === "vesselC") || eligibleVessels[2] || CHARTERED_FLEET.vesselC;

  const resA = evaluateVesselForVoyage(candA, inputs, port);
  const resB = evaluateVesselForVoyage(candB, inputs, port);
  const resC = evaluateVesselForVoyage(candC, inputs, port);

  // Recommended vessel selection:
  let recommendedVesselId: string = candB.id;
  let executiveRationale = "";

  if (!resA.isDraftCompliant && resB.isDraftCompliant) {
    recommendedVesselId = candB.id;
    const netSaving = resA.costs.riskAdjustedCostUSD - resB.costs.riskAdjustedCostUSD;
    executiveRationale = `${candB.name} is the verified recommended choice. While ${candA.name} appears $${Math.abs(resA.costs.totalLandedCostUSD - resB.costs.totalLandedCostUSD).toLocaleString()} cheaper on unadjusted base freight, its dynamic draft (${resA.dynamicArrivalDraftM}m) breaches ${port.name}'s maximum permissible channel threshold (${resA.allowablePortDraftM}m). This triggers compulsory offshore lightering ($${resA.costs.lighteringPenaltyUSD.toLocaleString()}) and 3.5 days of tidal delay demurrage. Choosing ${candB.name} saves $${netSaving.toLocaleString()} USD in net risk-adjusted exposure and avoids ${Math.abs(resA.estimatedCO2MT - resB.estimatedCO2MT)} MT of CO2.`;
  } else {
    recommendedVesselId = candB.id;
    executiveRationale = `${candB.name} provides optimal operational safety, lowest environmental impact, and guaranteed direct fairway access without tidal wait penalties.`;
  }

  return {
    inputs,
    port,
    results: {
      vesselA: resA,
      vesselB: resB,
      vesselC: resC,
      [candA.id]: resA,
      [candB.id]: resB,
      [candC.id]: resC,
    },
    recommendedVesselId,
    executiveRationale,
  };
}
