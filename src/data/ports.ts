export type CargoCategory =
  | "Dry Bulk (Thermal Coal / Iron Ore / Grain)"
  | "Liquid Bulk / Crude / Chemicals"
  | "Containerized Goods"
  | "Breakbulk / Heavy Lift & Ro-Ro";

export interface MajorPort {
  id: string;
  name: string;
  code: string; // UN/LOCODE
  state: string;
  coast: "East Coast" | "West Coast";
  maxBerthDraftM: number;
  maxLOAM: number;
  distanceFromSingaporeNM: number;
  allowedCargoTypes: CargoCategory[];
  topCommodities: string[];
  rejectionReasonIfIncompatible?: string;
  suggestedAlternativeCodes?: string[];
  imoStandard: string;
  berthType: string;
}

export const INDIAN_MAJOR_PORTS: MajorPort[] = [
  // --- EAST COAST (Bay of Bengal) ---
  {
    id: "in-paradip",
    name: "Paradip Port",
    code: "INPRT",
    state: "Odisha",
    coast: "East Coast",
    maxBerthDraftM: 14.5,
    maxLOAM: 260.0,
    distanceFromSingaporeNM: 1650,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Liquid Bulk / Crude / Chemicals"
    ],
    topCommodities: ["Thermal Coal", "Iron Ore Pellets", "Crude Oil", "Fertilizers"],
    rejectionReasonIfIncompatible: "Terminal Berth Incompatibility: Paradip Port operates dedicated mechanized IMSBC dry bulk and SPM crude berths. It does not operate commercial container transshipment handling terminals.",
    suggestedAlternativeCodes: ["in-visakhapatnam", "in-chennai"],
    imoStandard: "SOLAS Reg. VI/2, IMSBC Group B (Thermal Coal & MHB), BLU Code",
    berthType: "Deep-water Mechanized Bulk & SPM Oil Berth",
  },
  {
    id: "in-visakhapatnam",
    name: "Visakhapatnam Port",
    code: "INVTZ",
    state: "Andhra Pradesh",
    coast: "East Coast",
    maxBerthDraftM: 18.1,
    maxLOAM: 300.0,
    distanceFromSingaporeNM: 1580,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Liquid Bulk / Crude / Chemicals",
      "Containerized Goods"
    ],
    topCommodities: ["Coking Coal", "Iron Ore", "Petroleum Crude", "Containerized Cargo"],
    imoStandard: "SOLAS Ch. XII Bulk Safety, Outer Harbour Capesize Clearance",
    berthType: "Deep Natural Outer Harbour & VCTPL Container Terminal",
  },
  {
    id: "in-kamarajar",
    name: "Kamarajar Port (Ennore)",
    code: "INENR",
    state: "Tamil Nadu",
    coast: "East Coast",
    maxBerthDraftM: 16.0,
    maxLOAM: 320.0,
    distanceFromSingaporeNM: 1540,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Breakbulk / Heavy Lift & Ro-Ro",
      "Liquid Bulk / Crude / Chemicals"
    ],
    topCommodities: ["Thermal Coal (TANGEDCO)", "Automobile Exports (Ro-Ro)", "LNG", "POL Products"],
    rejectionReasonIfIncompatible: "Terminal Incompatibility: Ennore specializes in mechanized thermal coal and automotive Ro-Ro. High-volume general container traffic should route to Chennai or JNPA.",
    suggestedAlternativeCodes: ["in-chennai", "in-voc"],
    imoStandard: "SOLAS VI/VII, BLU Code Safe Loading, IGC Code LNG Safeguards",
    berthType: "Dedicated Mechanized Bulk & Car Carrier Terminal",
  },
  {
    id: "in-chennai",
    name: "Chennai Port",
    code: "INMAA",
    state: "Tamil Nadu",
    coast: "East Coast",
    maxBerthDraftM: 15.5,
    maxLOAM: 305.0,
    distanceFromSingaporeNM: 1530,
    allowedCargoTypes: [
      "Containerized Goods",
      "Breakbulk / Heavy Lift & Ro-Ro"
    ],
    topCommodities: ["Manufactured Containers", "Automobile CBU Exports (Ro-Ro)", "Machinery"],
    rejectionReasonIfIncompatible: "Statutory Environmental Restriction: Open handling of dirty dry bulk (Thermal Coal and Iron Ore) is strictly banned at Chennai Port under Madras High Court / NGT environmental mandates. Only clean containers and Ro-Ro cargo are accepted.",
    suggestedAlternativeCodes: ["in-kamarajar", "in-voc"],
    imoStandard: "SOLAS VGM & CTU Code Container Safety Standards",
    berthType: "All-Weather Artificial Container & Ro-Ro Harbour",
  },
  {
    id: "in-voc",
    name: "V.O. Chidambaranar Port (Tuticorin)",
    code: "INTUT",
    state: "Tamil Nadu",
    coast: "East Coast",
    maxBerthDraftM: 14.2,
    maxLOAM: 245.0,
    distanceFromSingaporeNM: 1520,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Containerized Goods"
    ],
    topCommodities: ["Thermal Coal", "Copper Concentrates", "Containers", "Rock Phosphate"],
    imoStandard: "IMO BLU Code, Under Keel Clearance (UKC) 1.2m Mandatory",
    berthType: "Artificial Deep-Sea Coal & Container Basin",
  },
  {
    id: "in-smp-haldia",
    name: "Syama Prasad Mookerjee Port (Haldia Dock)",
    code: "INHAL",
    state: "West Bengal",
    coast: "East Coast",
    maxBerthDraftM: 10.5,
    maxLOAM: 230.0,
    distanceFromSingaporeNM: 1720,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Liquid Bulk / Crude / Chemicals"
    ],
    topCommodities: ["Coking Coal", "POL Products", "Petroleum Coke", "Raw Fertilizers"],
    imoStandard: "Riverine Tide Bulletin Navigation, Daily Pilotage UKC Directive",
    berthType: "Impounded Wet Dock River Basin",
  },
  {
    id: "in-smp-kolkata",
    name: "Syama Prasad Mookerjee Port (Kolkata Dock)",
    code: "INCCU",
    state: "West Bengal",
    coast: "East Coast",
    maxBerthDraftM: 8.0,
    maxLOAM: 172.0,
    distanceFromSingaporeNM: 1780,
    allowedCargoTypes: [
      "Containerized Goods",
      "Breakbulk / Heavy Lift & Ro-Ro"
    ],
    topCommodities: ["Jute", "Tea", "Transit Containers (Nepal/Bhutan)", "Project Cargo"],
    rejectionReasonIfIncompatible: "Vessel Draft & Terminal Block: Kolkata Dock System's shallow riverine tidal basin (max draft ~8.0m) cannot accommodate heavy dry bulk or deep-sea crude tankers. Route bulk tonnage to Haldia or Paradip.",
    suggestedAlternativeCodes: ["in-smp-haldia", "in-paradip"],
    imoStandard: "Hooghly River Navigation Act & IMO Shallow Water Squat Rules",
    berthType: "Riverine Tidal Lock Basins (Netaji Subhash / Kidderpore Docks)",
  },

  // --- WEST COAST (Arabian Sea) ---
  {
    id: "in-jnpa",
    name: "Jawaharlal Nehru Port (JNPA / Nhava Sheva)",
    code: "INNSA",
    state: "Maharashtra",
    coast: "West Coast",
    maxBerthDraftM: 15.0,
    maxLOAM: 370.0,
    distanceFromSingaporeNM: 2150,
    allowedCargoTypes: [
      "Containerized Goods",
      "Liquid Bulk / Crude / Chemicals"
    ],
    topCommodities: ["Containerized Freight", "Electronics", "Automotive Parts", "Chemicals"],
    rejectionReasonIfIncompatible: "Terminal Incompatibility: JNPA is India's dedicated container gateway and specialized chemical terminal. It does not operate open dry bulk coal handling infrastructure.",
    suggestedAlternativeCodes: ["in-deendayal", "in-mormugao"],
    imoStandard: "SOLAS Reg. VI/2 VGM Method 1 & 2 Electronic Weighbridge Mandate",
    berthType: "High-Throughput Deepwater Container Gateway",
  },
  {
    id: "in-deendayal",
    name: "Deendayal Port (Kandla)",
    code: "INIXY",
    state: "Gujarat",
    coast: "West Coast",
    maxBerthDraftM: 13.0,
    maxLOAM: 260.0,
    distanceFromSingaporeNM: 2420,
    allowedCargoTypes: [
      "Liquid Bulk / Crude / Chemicals",
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Breakbulk / Heavy Lift & Ro-Ro"
    ],
    topCommodities: ["Crude Oil", "Edible Oil", "Chemicals", "Grains", "Fertilizers"],
    imoStandard: "Gulf of Kutch Tidal Passage Window & MARPOL Annex I POL Protocol",
    berthType: "Tidal Oil Jetties & Dry Cargo Berths (Kandla & Vadinar)",
  },
  {
    id: "in-mumbai",
    name: "Mumbai Port",
    code: "INBOM",
    state: "Maharashtra",
    coast: "West Coast",
    maxBerthDraftM: 11.0,
    maxLOAM: 225.0,
    distanceFromSingaporeNM: 2140,
    allowedCargoTypes: [
      "Liquid Bulk / Crude / Chemicals",
      "Breakbulk / Heavy Lift & Ro-Ro"
    ],
    topCommodities: ["Crude Oil (Jawahar Dweep)", "POL Products", "Vehicles (Ro-Ro)", "Heavy Project Machinery"],
    rejectionReasonIfIncompatible: "Environmental Restriction: Open dusty dry bulk handling (Coal/Ore) is prohibited at Mumbai Port due to urban emission rules. Route dry bulk to Deendayal or Mormugao.",
    suggestedAlternativeCodes: ["in-deendayal", "in-mormugao"],
    imoStandard: "SOLAS Navigation in Congested Harbours & MARPOL Annex I",
    berthType: "Historic Deep Natural Harbour & Offshore Jetties",
  },
  {
    id: "in-mormugao",
    name: "Mormugao Port",
    code: "INMRM",
    state: "Goa",
    coast: "West Coast",
    maxBerthDraftM: 14.1,
    maxLOAM: 292.0,
    distanceFromSingaporeNM: 1980,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Breakbulk / Heavy Lift & Ro-Ro"
    ],
    topCommodities: ["Iron Ore Fines/Pellets", "Metallurgical Coal", "Heavy Breakbulk"],
    rejectionReasonIfIncompatible: "Terminal Incompatibility: Mormugao is an IMSBC mineral bulk handling harbor. Commercial container freight must route through JNPA or Cochin ICTT.",
    suggestedAlternativeCodes: ["in-jnpa", "in-cochin"],
    imoStandard: "IMSBC Code Group A Liquefaction Safety & Moisture Limit Rules",
    berthType: "Zuari River Deep Water Bulk Cargo Berths",
  },
  {
    id: "in-new-mangalore",
    name: "New Mangalore Port",
    code: "INNML",
    state: "Karnataka",
    coast: "West Coast",
    maxBerthDraftM: 14.0,
    maxLOAM: 260.0,
    distanceFromSingaporeNM: 1890,
    allowedCargoTypes: [
      "Liquid Bulk / Crude / Chemicals",
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)"
    ],
    topCommodities: ["Crude Oil (MRPL)", "LPG", "Iron Ore Pellets", "Coffee", "Cashews"],
    imoStandard: "MARPOL Annex I/II, ISGOTT Liquid Discharge Standards",
    berthType: "Deep All-Weather Lagoon Harbour",
  },
  {
    id: "in-cochin",
    name: "Cochin Port (Kochi)",
    code: "INCOK",
    state: "Kerala",
    coast: "West Coast",
    maxBerthDraftM: 14.5,
    maxLOAM: 335.0,
    distanceFromSingaporeNM: 1750,
    allowedCargoTypes: [
      "Containerized Goods",
      "Liquid Bulk / Crude / Chemicals"
    ],
    topCommodities: ["Transshipment Containers (ICTT)", "LNG", "Crude Oil", "Marine Bunkers"],
    rejectionReasonIfIncompatible: "Terminal Incompatibility: Cochin Vallarpadam ICTT is optimized for transshipment containers and IGC cryogenic gas. Route dirty solid bulk to New Mangalore or Tuticorin.",
    suggestedAlternativeCodes: ["in-new-mangalore", "in-voc"],
    imoStandard: "SOLAS Ch. VII, IGC Code Cryogenic Gas Handling Rules",
    berthType: "ICTT Vallarpadam Transshipment Terminal",
  },
];

export interface InternationalHub {
  id: string;
  name: string;
  code: string; // UN/LOCODE
  country: string;
  defaultDistanceNM: number;
}


export interface InternationalDestinationPort {
  id: string;
  name: string;
  code: string; // UN/LOCODE
  country: string;
  maxBerthDraftM: number;
  maxLOAM: number;
  defaultDistanceNM: number;
}

export const INTERNATIONAL_DESTINATION_PORTS: InternationalDestinationPort[] = [
  { id: "rotterdam", name: "Port of Rotterdam", code: "NLRTM", country: "Netherlands", maxBerthDraftM: 24.0, maxLOAM: 420.0, defaultDistanceNM: 6850 },
  { id: "singapore", name: "Port of Singapore", code: "SGSIN", country: "Singapore", maxBerthDraftM: 18.5, maxLOAM: 400.0, defaultDistanceNM: 1650 },
  { id: "shanghai", name: "Port of Shanghai", code: "CNSHA", country: "China", maxBerthDraftM: 17.5, maxLOAM: 400.0, defaultDistanceNM: 3100 },
  { id: "jebel_ali", name: "Jebel Ali / Dubai", code: "AEJEA", country: "UAE", maxBerthDraftM: 17.0, maxLOAM: 400.0, defaultDistanceNM: 1550 },
  { id: "antwerp_bruges", name: "Port of Antwerp-Bruges", code: "BEANR", country: "Belgium", maxBerthDraftM: 17.5, maxLOAM: 400.0, defaultDistanceNM: 6920 },
  { id: "busan", name: "Port of Busan", code: "KRBUS", country: "South Korea", maxBerthDraftM: 18.0, maxLOAM: 400.0, defaultDistanceNM: 3500 },
  { id: "los_angeles", name: "Port of Los Angeles", code: "USLAX", country: "USA", maxBerthDraftM: 18.5, maxLOAM: 400.0, defaultDistanceNM: 8200 },
  { id: "hamburg", name: "Port of Hamburg", code: "DEHAM", country: "Germany", maxBerthDraftM: 15.1, maxLOAM: 400.0, defaultDistanceNM: 7100 },
  { id: "tanjung_pelepas", name: "Port of Tanjung Pelepas", code: "MYTPP", country: "Malaysia", maxBerthDraftM: 18.5, maxLOAM: 400.0, defaultDistanceNM: 1680 },
];

export const INTERNATIONAL_MAJOR_PORTS: MajorPort[] = [
  {
    id: "rotterdam",
    name: "Port of Rotterdam",
    code: "NLRTM",
    state: "South Holland, Netherlands",
    coast: "East Coast",
    maxBerthDraftM: 24.0,
    maxLOAM: 420.0,
    distanceFromSingaporeNM: 8288,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Liquid Bulk / Crude / Chemicals",
      "Containerized Goods",
      "Breakbulk / Heavy Lift & Ro-Ro",
    ],
    topCommodities: ["Crude Oil", "Containers", "LNG", "Chemicals"],
    imoStandard: "IMO SOLAS, MARPOL Annex VI ECA (0.10% Sulphur Limit), ISPS Level 1",
    berthType: "Maasvlakte 2 Deepwater Automated Terminal",
  },
  {
    id: "singapore",
    name: "Port of Singapore",
    code: "SGSIN",
    state: "Singapore",
    coast: "East Coast",
    maxBerthDraftM: 18.5,
    maxLOAM: 400.0,
    distanceFromSingaporeNM: 0,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Liquid Bulk / Crude / Chemicals",
      "Containerized Goods",
      "Breakbulk / Heavy Lift & Ro-Ro",
    ],
    topCommodities: ["Containers", "Bunkers", "Refined Products", "Electronics"],
    imoStandard: "SOLAS Reg VI/2 VGM Verified, Global 0.50% Sulphur Cap, MPA Circulars",
    berthType: "Tuas Mega Port & Pasir Panjang Terminals",
  },
  {
    id: "shanghai",
    name: "Port of Shanghai",
    code: "CNSHA",
    state: "Shanghai, China",
    coast: "East Coast",
    maxBerthDraftM: 17.5,
    maxLOAM: 400.0,
    distanceFromSingaporeNM: 2210,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Liquid Bulk / Crude / Chemicals",
      "Containerized Goods",
      "Breakbulk / Heavy Lift & Ro-Ro",
    ],
    topCommodities: ["Manufactured Electronics", "Machinery", "Containers", "Iron Ore"],
    imoStandard: "China Domestic Emission Control Area (DECA), SOLAS Container Safety",
    berthType: "Yangshan Deepwater Automated Terminal",
  },
  {
    id: "jebel_ali",
    name: "Jebel Ali / Dubai",
    code: "AEJEA",
    state: "Dubai, UAE",
    coast: "West Coast",
    maxBerthDraftM: 17.0,
    maxLOAM: 400.0,
    distanceFromSingaporeNM: 3120,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Liquid Bulk / Crude / Chemicals",
      "Containerized Goods",
      "Breakbulk / Heavy Lift & Ro-Ro",
    ],
    topCommodities: ["Petroleum Products", "Re-exports", "Aluminium", "General Cargo"],
    imoStandard: "SOLAS Chapter VI/VII, MARPOL Annex I, DP World Terminal Safety Code",
    berthType: "DP World Deepwater Container & Bulk Wharves",
  },
  {
    id: "antwerp_bruges",
    name: "Port of Antwerp-Bruges",
    code: "BEANR",
    state: "Flanders, Belgium",
    coast: "East Coast",
    maxBerthDraftM: 17.5,
    maxLOAM: 400.0,
    distanceFromSingaporeNM: 8350,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Liquid Bulk / Crude / Chemicals",
      "Containerized Goods",
      "Breakbulk / Heavy Lift & Ro-Ro",
    ],
    topCommodities: ["Specialty Polymers", "Steel Products", "Pharmaceuticals", "Containers"],
    imoStandard: "North Sea ECA 0.10% Sulphur Limit, IMO Tier III NOx Regulations",
    berthType: "Deurganckdock Deepwater Tidal Container Basin",
  },
  {
    id: "busan",
    name: "Port of Busan",
    code: "KRBUS",
    state: "Busan, South Korea",
    coast: "East Coast",
    maxBerthDraftM: 18.0,
    maxLOAM: 400.0,
    distanceFromSingaporeNM: 2500,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Liquid Bulk / Crude / Chemicals",
      "Containerized Goods",
      "Breakbulk / Heavy Lift & Ro-Ro",
    ],
    topCommodities: ["Automobiles", "Ships", "High-Tech Electronics", "Containers"],
    imoStandard: "Korea Emission Control Area (SOx 0.10%), SOLAS Safe Loading Protocol",
    berthType: "Busan New Port Deepwater Automated Quays",
  },
  {
    id: "los_angeles",
    name: "Port of Los Angeles",
    code: "USLAX",
    state: "California, USA",
    coast: "East Coast",
    maxBerthDraftM: 18.5,
    maxLOAM: 400.0,
    distanceFromSingaporeNM: 7800,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Liquid Bulk / Crude / Chemicals",
      "Containerized Goods",
      "Breakbulk / Heavy Lift & Ro-Ro",
    ],
    topCommodities: ["Furniture", "Apparel", "Electronics", "Heavy Equipment"],
    imoStandard: "North American ECA 0.10% Sulphur Limit, CARB Shore Power Mandate",
    berthType: "Pier 400 Deepwater Container & Bulk Facility",
  },
  {
    id: "hamburg",
    name: "Port of Hamburg",
    code: "DEHAM",
    state: "Hamburg, Germany",
    coast: "East Coast",
    maxBerthDraftM: 15.1,
    maxLOAM: 400.0,
    distanceFromSingaporeNM: 8450,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Liquid Bulk / Crude / Chemicals",
      "Containerized Goods",
      "Breakbulk / Heavy Lift & Ro-Ro",
    ],
    topCommodities: ["Automotive Equipment", "Specialized Machinery", "Chemicals"],
    imoStandard: "Elbe River Navigation Directive, IMO ECA 0.10% Sulphur Limit",
    berthType: "HHLA Container Terminal Altenwerder (CTA)",
  },
  {
    id: "tanjung_pelepas",
    name: "Port of Tanjung Pelepas",
    code: "MYTPP",
    state: "Johor, Malaysia",
    coast: "East Coast",
    maxBerthDraftM: 18.5,
    maxLOAM: 400.0,
    distanceFromSingaporeNM: 30,
    allowedCargoTypes: [
      "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
      "Liquid Bulk / Crude / Chemicals",
      "Containerized Goods",
      "Breakbulk / Heavy Lift & Ro-Ro",
    ],
    topCommodities: ["Containerized Freight", "Palm Oil Derivatives", "Electronics"],
    imoStandard: "SOLAS Reg VI/2 VGM Verification, Malacca Strait Traffic Separation Scheme",
    berthType: "Linear Wharf Deepwater Container Facility",
  },
];

export const INTERNATIONAL_LOADING_HUBS: InternationalHub[] = [
  { id: "singapore", name: "Port of Singapore", code: "SGSIN", country: "Singapore", defaultDistanceNM: 1650 },
  { id: "port_hedland", name: "Port Hedland", code: "AUPHE", country: "Australia", defaultDistanceNM: 3680 },
  { id: "richards_bay", name: "Richards Bay", code: "ZARCB", country: "South Africa", defaultDistanceNM: 4850 },
  { id: "ras_laffan", name: "Ras Laffan", code: "QARLF", country: "Qatar", defaultDistanceNM: 2580 },
  { id: "rotterdam", name: "Port of Rotterdam", code: "NLRTM", country: "Netherlands", defaultDistanceNM: 6850 },
];

/**
 * Sequential nautical mile distances along the Indian coastline from East to West (Kolkata -> Kandla)
 * Used to compute precise coastal cabotage distances between any two domestic Indian ports.
 */
export const INDIAN_COASTAL_CHAIN_NM: Record<string, number> = {
  "in-smp-kolkata": 0,
  "in-smp-haldia": 50,
  "in-paradip": 200,
  "in-visakhapatnam": 460,
  "in-kamarajar": 770,
  "in-chennai": 790,
  "in-voc": 1140,
  "in-cochin": 1340,
  "in-new-mangalore": 1540,
  "in-mormugao": 1710,
  "in-mumbai": 1950,
  "in-jnpa": 1950,
  "in-deendayal": 2290,
};

export function getInternationalHub(idOrCode: string): InternationalHub | undefined {
  if (!idOrCode) return undefined;
  const clean = idOrCode.toLowerCase().trim();
  return INTERNATIONAL_LOADING_HUBS.find(
    (h) => h.id.toLowerCase() === clean || h.code.toLowerCase() === clean || h.name.toLowerCase().includes(clean)
  );
}

/**
 * Normalizes user-selected cargo string into one of the 4 statutory CargoCategory types
 */
export function normalizeCargoCategory(cargo: string): CargoCategory {
  const lower = cargo.toLowerCase();
  if (lower.includes("container")) {
    return "Containerized Goods";
  }
  if (lower.includes("liquid") || lower.includes("crude") || lower.includes("chemical") || lower.includes("lng")) {
    return "Liquid Bulk / Crude / Chemicals";
  }
  if (lower.includes("breakbulk") || lower.includes("ro-ro") || lower.includes("machinery") || lower.includes("rolling")) {
    return "Breakbulk / Heavy Lift & Ro-Ro";
  }
  // Default to Dry Bulk for coal, ore, grain, general solid bulk
  return "Dry Bulk (Thermal Coal / Iron Ore / Grain)";
}

/**
 * Retrieve a port by either its new id (e.g. "in-paradip") or legacy id ("paradip") or code ("INPRT")
 */
export function getMajorPort(portIdOrCode: string): MajorPort | undefined {
  if (!portIdOrCode) return undefined;
  const clean = portIdOrCode.toLowerCase().trim();
  
  // Exact match in International or Indian ports
  const intlMatch = INTERNATIONAL_MAJOR_PORTS.find(
    (p) => p.id.toLowerCase() === clean || p.code.toLowerCase() === clean
  );
  if (intlMatch) return intlMatch;

  const direct = INDIAN_MAJOR_PORTS.find(
    (p) => p.id.toLowerCase() === clean || p.code.toLowerCase() === clean
  );
  if (direct) return direct;

  // Specific alias mappings
  const aliases: Record<string, string> = {
    paradip: "in-paradip",
    visakhapatnam: "in-visakhapatnam",
    vizag: "in-visakhapatnam",
    kamarajar: "in-kamarajar",
    ennore: "in-kamarajar",
    chennai: "in-chennai",
    maa: "in-chennai",
    voc: "in-voc",
    tuticorin: "in-voc",
    voc_chidambaranar: "in-voc",
    haldia: "in-smp-haldia",
    "in-haldia": "in-smp-haldia",
    kolkata: "in-smp-kolkata",
    "in-kolkata": "in-smp-kolkata",
    jnpa: "in-jnpa",
    jnpt: "in-jnpa",
    "in-jnpt": "in-jnpa",
    nhava_sheva: "in-jnpa",
    deendayal: "in-deendayal",
    kandla: "in-deendayal",
    "in-kandla": "in-deendayal",
    inixy: "in-deendayal",
    inixx: "in-deendayal",
    mumbai: "in-mumbai",
    mormugao: "in-mormugao",
    goa: "in-mormugao",
    new_mangalore: "in-new-mangalore",
    "new-mangalore": "in-new-mangalore",
    mangalore: "in-new-mangalore",
    cochin: "in-cochin",
    kochi: "in-cochin",
  };
  if (aliases[clean]) {
    return INDIAN_MAJOR_PORTS.find((p) => p.id === aliases[clean]);
  }

  return INDIAN_MAJOR_PORTS.find(
    (p) =>
      p.id.replace("in-", "").toLowerCase() === clean ||
      p.name.toLowerCase().includes(clean)
  );
}

export interface CompatibilityValidationResult {
  isCompatible: boolean;
  rejectionReason?: string;
  suggestedAlternatives: MajorPort[];
  normalizedCargoCategory: CargoCategory;
  port: MajorPort;
}

/**
 * Enforces terminal-cargo compatibility validation with clear rejection states
 */
export function validateTerminalCargoCompatibility(
  portIdOrCode: string,
  cargoType: string
): CompatibilityValidationResult {
  const port = getMajorPort(portIdOrCode) || INDIAN_MAJOR_PORTS[0]; // defaults to Paradip
  const normalizedCategory = normalizeCargoCategory(cargoType);

  const isCompatible = port.allowedCargoTypes.includes(normalizedCategory);

  if (isCompatible) {
    return {
      isCompatible: true,
      port,
      normalizedCargoCategory: normalizedCategory,
      suggestedAlternatives: [],
    };
  }

  // Find alternative ports that DO allow this cargo category
  const suggestedAlternatives: MajorPort[] = [];
  if (port.suggestedAlternativeCodes && port.suggestedAlternativeCodes.length > 0) {
    for (const altCode of port.suggestedAlternativeCodes) {
      const altPort = getMajorPort(altCode);
      if (altPort && altPort.allowedCargoTypes.includes(normalizedCategory)) {
        suggestedAlternatives.push(altPort);
      }
    }
  }

  // If specific suggestions did not match or none provided, find top matching ports by distance
  if (suggestedAlternatives.length === 0) {
    const fallbackAlts = INDIAN_MAJOR_PORTS.filter(
      (p) => p.id !== port.id && p.allowedCargoTypes.includes(normalizedCategory)
    ).sort((a, b) => a.distanceFromSingaporeNM - b.distanceFromSingaporeNM);
    suggestedAlternatives.push(...fallbackAlts.slice(0, 2));
  }

  const rejectionReason =
    port.rejectionReasonIfIncompatible ||
    `Terminal Incompatibility: ${port.name} does not operate authorized berths or handling equipment for ${normalizedCategory}.`;

  return {
    isCompatible: false,
    port,
    normalizedCargoCategory: normalizedCategory,
    rejectionReason,
    suggestedAlternatives,
  };
}
