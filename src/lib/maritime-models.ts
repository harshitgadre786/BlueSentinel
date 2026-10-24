import { PortData } from "./types";

export interface DemoVessel {
  id: "vesselA" | "vesselB" | "vesselC";
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
  cargoQuantityMT: number;
  originPortId: string;
  destinationPortId: string;
  laycanDate: string;
  fuelPriceUSD: number;
  usdToInrRate: number;
  portWaitingDays: number;
  selectedTideState?: "NEAP" | "NORMAL" | "SPRING";
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
  results: Record<"vesselA" | "vesselB" | "vesselC", VesselEvaluationResult>;
  recommendedVesselId: "vesselA" | "vesselB" | "vesselC";
  executiveRationale: string;
}
