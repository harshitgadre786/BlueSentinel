import { PortData } from "./types";

export type CargoCategory =
  | "DRY_BULK"
  | "CONTAINER"
  | "LIQUID_BULK"
  | "LNG_CRYOGENIC"
  | "BREAKBULK"
  | "RO_RO"
  | "HAZARDOUS";

export interface CargoProfile {
  id: string;
  name: string;
  category: CargoCategory;
  defaultTonnageMT: number;
  densityT_M3: number;
  unNumber: string; // e.g. "UN 3480" or "UN 1267" or "N/A"
  imdgClass: string; // e.g. "Class 9", "Class 3", "N/A"
  packingGroup?: string; // e.g. "PG II", "PG I", "N/A"
  vgmMethod: string; // e.g. "SOLAS Method 1 (Weighbridge Scale Ticket)"
  hazardous: boolean;
  stowageFactorM3_T: number;
  specialHandlingNotes: string;
}

export interface DemoVessel {
  id: "vesselA" | "vesselB" | "vesselC" | string;
  name: string;
  type: string;
  dwt: number; // Cargo capacity DWT
  loadedDraft: number; // Loaded draft in meters
  averageSpeed: number; // knots
  dailyFuelBurn: number; // MT/day at sea
  freightDailyRate: number; // USD/day
  portFuelBurn: number; // MT/day in port
  emissionFactor: number; // MT CO2 per MT fuel (IMO standard = 3.114)
  demurrageDailyRate: number; // Charterparty demurrage USD/day
  description: string;
  archetype: "DRAFT_RISK" | "RECOMMENDED" | "DELAY_RISK";
  // Accurate IMO Specifications
  imoNumber: string;
  mmsi: string;
  flag: string;
  beam: number; // meters
  loa: number; // length overall in meters
  cargoCapabilities: CargoCategory[];
  currentPort: string;
  coordinates: { lat: number; lng: number };
  capacityDetail?: string; // e.g. "5,400 TEU", "174,000 m³", "6,500 CEU"
  hazardCertifications?: string[];
  permissiblePayloadMT?: number;
}

export interface DetailedPortRule extends PortData {
  fairwayLimitM: number;
  tidalWindows: {
    state: "NEAP" | "NORMAL" | "SPRING";
    heightM: number;
    description: string;
  }[];
  requiredDocuments: {
    code: string;
    name: string;
    authority: string;
    mandatory: boolean;
  }[];
  consequenceOfDraftBreach: string;
  suggestedAction: string;
}

export interface VoyagePlannerInputs {
  cargoType: string;
  cargoCategory?: CargoCategory;
  cargoQuantityMT: number;
  originPortId: string;
  destinationPortId: string;
  laycanDate: string;
  fuelPriceUSD: number;
  usdToInrRate: number;
  portWaitingDays: number;
  selectedTideState?: "NEAP" | "NORMAL" | "SPRING";
  // Dynamic Vessel & Cargo Reactivity parameters
  selectedVesselId?: string;
  unNumber?: string;
  imdgClass?: string;
  vgmMethod?: string;
  targetDraftM?: number;
  vesselBeamM?: number;
  vesselDwtMT?: number;
  permissiblePayloadMT?: number;
}

export interface LandedCostBreakdown {
  baseFreightUSD: number;
  baseFreightINR: number;
  bunkerFuelUSD: number;
  bunkerFuelINR: number;
  portTariffUSD: number;
  portTariffINR: number;
  demurrageRiskUSD: number;
  demurrageRiskINR: number;
  lighteringPenaltyUSD: number;
  lighteringPenaltyINR: number;
  totalLandedCostUSD: number;
  totalLandedCostINR: number;
  riskAdjustedCostUSD: number;
  riskAdjustedCostINR: number;
}

export interface VesselEvaluationResult {
  vessel: DemoVessel;
  voyageDistanceNM: number;
  seaDays: number;
  totalDays: number;
  etaDate: string;
  dynamicSquatM: number;
  dynamicArrivalDraftM: number;
  allowablePortDraftM: number;
  draftMarginM: number;
  isDraftCompliant: boolean;
  totalFuelMT: number;
  estimatedCO2MT: number;
  underwaterNoiseDB: number;
  costs: LandedCostBreakdown;
  draftRiskScore: number;
  delayRiskScore: number;
  compositeRiskScore: number;
  riskCategory: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  isRecommended: boolean;
  rejectionReason?: string;
  detailedAuditNotes: string[];
}

export interface MultiVesselComparison {
  inputs: VoyagePlannerInputs;
  port: DetailedPortRule;
  results: Record<string, VesselEvaluationResult>;
  recommendedVesselId: string;
  executiveRationale: string;
}
