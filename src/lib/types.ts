export interface PortData {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  maxPermissibleDraft: number; // in meters (CD - Chart Datum)
  tidalAllowance: number; // in meters average high tide
  requiredUKC: number; // Under Keel Clearance in meters
  fairwayDraftLimit: number;
  dailyDemurrageRate: number; // USD per day
  lighteringCostPerTonne: number; // USD per tonne to lighter offshore
  description: string;
  activeRiskZones: string[];
}

export interface OriginPort {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  cargoTypes: string[];
}

export interface VesselOption {
  id: "vesselA" | "vesselB";
  name: string;
  type: string;
  dwt: number; // Deadweight tonnage
  loa: number; // Length overall in meters
  beam: number; // Beam in meters
  staticDraft: number; // Static laden draft in meters
  designSpeed: number; // knots
  baseCharterRatePerDay: number; // USD
  baseFuelConsumptionPerDay: number; // MT at design speed
  portAuxFuelConsumptionPerDay: number; // MT per day at berth/anchor
  flag: string;
  yearBuilt: number;
  engineType: string;
  baselineCII: "A" | "B" | "C" | "D" | "E";
  vesselNotes: string;
}

export interface SimulationInputs {
  cargoType: string;
  cargoTonnage: number; // Metric tonnes
  originId: string;
  destinationId: string;
  departureDate: string; // ISO date string
  speedKnots: number; // dynamic slider (e.g. 10.0 to 18.0)
  fuelCostPerTonne: number; // USD / MT (VLSFO)
  estimatedPortWaitDays: number; // Days at anchorage
  vesselDraftOverrideA?: number;
  vesselDraftOverrideB?: number;
}

export interface VesselCalculationResult {
  vesselId: "vesselA" | "vesselB";
  vesselName: string;
  vesselType: string;
  speedKnots: number;
  voyageDistanceNM: number;
  seaDays: number;
  totalVoyageDays: number; // seaDays + estimatedPortWaitDays
  etaDate: string;
  dynamicDraft: number; // static draft + speed squat effect
  allowableDraft: number; // port max draft + tidal allowance - UKC
  draftMargin: number; // allowable - dynamicDraft (negative = breach)
  isDraftCompliant: boolean;
  
  // Fuel & Emissions (Deterministic)
  dailyFuelSea: number; // MT/day at current speed
  totalSeaFuel: number; // MT
  totalPortFuel: number; // MT
  totalFuelMT: number; // MT
  bunkerFuelCostUSD: number;
  charterCostUSD: number;
  demurrageExposureUSD: number;
  lighteringRiskCostUSD: number; // Incurred if draft breached
  baseVoyageCostUSD: number; // Fuel + Charter + Base Demurrage
  riskAdjustedCostUSD: number; // Base + Lightering + Contingency penalties
  
  // Emissions & Environmental
  co2EmissionsMT: number;
  ciiRating: "A" | "B" | "C" | "D" | "E";
  underwaterNoiseScore: number; // 0-100 URN index
  underwaterNoiseDB: number; // estimated acoustic power level dB re 1uPa@1m
  marineSanctuaryCaution: boolean;
  
  // Risk Composite Breakdown (0 - 100)
  draftRiskScore: number; // 0-100 (high if breach)
  weatherRiskScore: number; // 0-100
  portCongestionRiskScore: number; // 0-100
  environmentalRiskScore: number; // 0-100
  totalRiskScore: number; // weighted composite 0-100
  riskCategory: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
}

export interface ComparisonVerdict {
  recommendedVesselId: "vesselA" | "vesselB";
  vesselAName: string;
  vesselBName: string;
  costDifferenceUSD: number; // riskAdjustedCost(A) - riskAdjustedCost(B)
  fuelDifferenceMT: number;
  co2DifferenceMT: number;
  riskScoreDifference: number;
  primaryRationale: string;
  bulletPoints: string[];
}

export interface RiskZone {
  id: string;
  name: string;
  type: "SHALLOW_DRAFT" | "CYCLONE_MONSOON" | "CETACEAN_CORRIDOR" | "TRAFFIC_SEPARATION";
  severity: "caution" | "warning" | "danger";
  description: string;
  coordinates: [number, number][]; // Polygon coords [lat, lng]
  mitigationRequirement: string;
}

export interface RAGDocument {
  id: string;
  title: string;
  filename: string;
  category: "VESSEL_SPEC" | "PORT_NOTICE" | "REGULATORY" | "CHARTERPARTY";
  uploadDate: string;
  sizeBytes: number;
  chunks: DocumentChunk[];
}

export interface DocumentChunk {
  id: string;
  pageNumber: number;
  heading: string;
  text: string;
  keywords: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "blueai" | "system";
  timestamp: string;
  content: string;
  citations?: {
    filename: string;
    pageNumber: number;
    section: string;
    excerpt: string;
  }[];
  deterministicMetrics?: {
    label: string;
    value: string;
  }[];
}
