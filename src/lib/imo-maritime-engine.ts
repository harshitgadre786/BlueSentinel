/**
 * ============================================================================
 * BlueSentinel - IMO Maritime Calculations Engine
 * Standards:
 *  - IMO Resolution MEPC.337(76) & MEPC.353(78) (CII Calculation Guidelines)
 *  - MARPOL Annex VI Reg 26 & 28 (Carbon Intensity of International Shipping)
 *  - SOLAS Ch. VI Reg 2 (Verified Gross Mass)
 *  - IMO FAL Convention (Standardized Forms 1-7)
 * ============================================================================
 */

import {
  ImoPort,
  ImoCargoType,
  ImoVessel,
  IMO_PORTS,
  IMO_CARGO_TYPES,
  IMO_VESSELS,
} from "@/data/imo-shipment-data";
import { getVoyageDistance } from "./maritime-calculator";

export interface DynamicVoyageCalculation {
  originPort: ImoPort;
  destPort: ImoPort;
  cargo: ImoCargoType;
  vessel: ImoVessel;
  cargoTonnageMT: number;
  laycanDate: string;
  // Nautical Routing & Transit
  distanceNM: number;
  transitHours: number;
  transitDays: number;
  departureDate: string;
  etaPilotStation: string;
  etaBerthArrival: string; // includes pre-berthing wait queue
  preBerthingWaitHours: number;
  // Emissions & Decarbonization
  seaFuelBurnMT: number;
  portFuelBurnMT: number;
  totalFuelBurnMT: number;
  totalCo2EmissionsMT: number;
  soxEmissionsMT: number;
  marpolSoxLimit: string;
  // IMO Carbon Intensity Indicator (CII)
  attainedCII: number; // g CO2 / DWT-NM
  requiredCII: number;
  ciiRatio: number;
  ciiRating: "A" | "B" | "C" | "D" | "E";
  ciiVerdict: string;
  marpolAnnexViStatus: string;
  // Local Port Tariffs & Landed Breakdown
  tariffsUSD: {
    pilotage: number;
    berthHire: number;
    portDues: number;
    tugAssistance: number;
    wharfageHandling: number;
    greenIncentiveCredit: number;
    totalPortTariffUSD: number;
    totalPortTariffINR: number;
  };
  // Statutory Documents & Declarations
  statutoryDocs: {
    vgmCertificate: {
      certificateNumber: string;
      verifiedGrossMassMT: number;
      method: string;
      scaleTicketId: string;
      authorizedSignatory: string;
    };
    dgManifest: {
      manifestNumber: string;
      unNumber: string;
      properShippingName: string;
      imdgClass: string;
      packingGroup: string;
      flashpoint: string;
      emergencyScheduleEmS: string;
      marinePollutant: boolean;
    };
    sdsSummary: {
      casNumber: string;
      ergGuideNumber: number;
      firefightingAgent: string;
      spillMitigation: string;
    };
    billOfLading: {
      blNumber: string;
      carrier: string;
      shipper: string;
      consignee: string;
      portOfLoading: string;
      portOfDischarge: string;
      freightStatus: string;
    };
    ispsAndHealth: {
      ispsSecurityLevel: "Level 1 (Normal)" | "Level 2 (Heightened)";
      maritimeHealthDeclaration: string;
      portStateControlRiskTier: "Low Risk" | "Standard Risk" | "High Risk";
    };
  };
}

/**
 * Calculates official IMO CII Rating (A through E) according to MEPC.337(76)
 */
export function calculateImoCiiRating(
  attainedCII: number,
  requiredCII: number
): {
  rating: "A" | "B" | "C" | "D" | "E";
  verdict: string;
  marpolAnnexViStatus: string;
} {
  if (requiredCII <= 0) {
    return {
      rating: "C",
      verdict: "Compliant Baseline",
      marpolAnnexViStatus: "MARPOL Annex VI Valid",
    };
  }

  const ratio = attainedCII / requiredCII;

  // IMO Boundaries d1, d2, d3, d4:
  // Superior A: ratio < 0.83
  // Minor Superior B: 0.83 <= ratio < 0.94
  // Target C: 0.94 <= ratio < 1.06
  // Minor Inferior D: 1.06 <= ratio < 1.19
  // Inferior E: ratio >= 1.19
  if (ratio < 0.83) {
    return {
      rating: "A",
      verdict: "Superior Carbon Intensity (Grade A) - High Eco-Efficiency; qualifies for green port tariff rebates.",
      marpolAnnexViStatus: "Fully MARPOL Annex VI Compliant - Exceeds IMO 2030 decarbonization trajectory.",
    };
  }
  if (ratio < 0.94) {
    return {
      rating: "B",
      verdict: "Minor Superior Carbon Intensity (Grade B) - Above standard operational energy efficiency.",
      marpolAnnexViStatus: "MARPOL Annex VI Compliant - Positive SEEMP Part III performance rating.",
    };
  }
  if (ratio < 1.06) {
    return {
      rating: "C",
      verdict: "Moderate Target Compliance (Grade C) - Meets statutory IMO MARPOL annual reduction baseline.",
      marpolAnnexViStatus: "MARPOL Annex VI Compliant - Standard trading authorization maintained.",
    };
  }
  if (ratio < 1.19) {
    return {
      rating: "D",
      verdict: "Minor Inferior (Grade D) - 3 consecutive Grade D ratings triggers mandatory corrective action plan.",
      marpolAnnexViStatus: "Conditional Compliance - Requires operational speed reduction and trim optimization.",
    };
  }
  return {
    rating: "E",
    verdict: "Inferior Carbon Intensity (Grade E) - Breaches IMO baseline. Corrective action plan mandatory under SEEMP.",
    marpolAnnexViStatus: "Non-Compliant Risk - Immediate corrective action plan (CAP) must be submitted to flag administration.",
  };
}

/**
 * Main dynamic calculation function evaluating distinct parameters for any Origin, Destination, Cargo, and Vessel
 */
export function calculateDynamicImoShipment(params: {
  originPortId: string;
  destPortId: string;
  cargoTypeId: string;
  vesselId?: string;
  cargoTonnageMT?: number;
  laycanDate?: string;
}): DynamicVoyageCalculation {
  const originPort = IMO_PORTS[params.originPortId] || IMO_PORTS["singapore"];
  const destPort = IMO_PORTS[params.destPortId] || IMO_PORTS["in-paradip"];
  const cargo = IMO_CARGO_TYPES[params.cargoTypeId] || IMO_CARGO_TYPES["dry_bulk_imsbc"];

  // Select suitable vessel or default
  let vessel: ImoVessel;
  if (params.vesselId && IMO_VESSELS[params.vesselId]) {
    vessel = IMO_VESSELS[params.vesselId];
  } else if (cargo.category === "LIQUID_BULK" || cargo.category === "CHEMICAL_DG") {
    vessel = IMO_VESSELS["vesselTanker"];
  } else if (cargo.category === "LNG_CRYOGENIC") {
    vessel = IMO_VESSELS["vesselGas"];
  } else {
    vessel = IMO_VESSELS["vesselB"]; // MV Sentinel Carrier
  }

  const cargoTonnage = params.cargoTonnageMT || cargo.defaultTonnageMT;
  const departureDateStr = params.laycanDate || new Date().toISOString().slice(0, 10);
  const departureDate = new Date(departureDateStr);

  // 1. Dynamic Nautical Distance & Transit Time
  const distanceNM = getVoyageDistance(originPort.id, destPort.id);
  const transitHours = Math.max(12, Math.round(distanceNM / vessel.serviceSpeedKnots));
  const transitDays = Number((transitHours / 24).toFixed(1));

  // Dynamic ETA timestamps
  const pilotArrivalMs = departureDate.getTime() + transitHours * 3600 * 1000;
  const etaPilotDate = new Date(pilotArrivalMs);

  const preBerthingHours = destPort.congestion.avgPreBerthingHours;
  const berthArrivalMs = pilotArrivalMs + preBerthingHours * 3600 * 1000;
  const etaBerthDate = new Date(berthArrivalMs);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC";

  // 2. Realistic Fuel Consumption & Greenhouse Gas Estimations
  // Speed cubic hydrodynamics adjusting for displacement (cargoTonnage / vessel.dwt)
  const displacementFactor = 0.85 + 0.15 * Math.min(1.0, cargoTonnage / vessel.dwt);
  const seaFuelDailyBurn = vessel.seaDailyFuelBurnMT * displacementFactor;
  const seaFuelBurnMT = Number((transitDays * seaFuelDailyBurn).toFixed(1));

  // In-port fuel burn during berth stay + pre-berthing wait
  const portStayDays = Number(((preBerthingHours + 36) / 24).toFixed(1)); // berth ops ~ 36h
  const portFuelBurnMT = Number((portStayDays * vessel.portDailyFuelBurnMT).toFixed(1));
  const totalFuelBurnMT = Number((seaFuelBurnMT + portFuelBurnMT).toFixed(1));

  // CO2 calculation using vessel's specific carbon factor Cf (3.114 for VLSFO, 2.750 for LNG)
  const totalCo2EmissionsMT = Number((totalFuelBurnMT * vessel.carbonFactorCf).toFixed(1));

  // SOx emissions calculation based on MARPOL Annex VI regulations
  const isEcaZone = destPort.greenCorridor.marpolAnnexViZone.includes("ECA");
  const sulphurPercentage = isEcaZone ? 0.001 : 0.005; // 0.10% in ECA vs 0.50% global cap
  const soxEmissionsMT = Number((totalFuelBurnMT * sulphurPercentage * 2.0).toFixed(2));
  const marpolSoxLimit = isEcaZone ? "MARPOL Annex VI ECA 0.10% S Enforced" : "Global 0.50% Sulphur Cap (VLSFO Compliant)";

  // 3. IMO Carbon Intensity Indicator (CII)
  // Attained CII = Total CO2 grams / (DWT * Distance NM)
  const totalCo2Grams = totalCo2EmissionsMT * 1000000;
  const dwtDistanceWork = vessel.dwt * Math.max(100, distanceNM);
  const attainedCII = Number((totalCo2Grams / dwtDistanceWork).toFixed(2));

  // Required CII Reference line: CII_ref = a * DWT^(-c)
  const requiredCII = Number(
    (vessel.ciiReference_a * Math.pow(vessel.dwt, -vessel.ciiReference_c)).toFixed(2)
  );
  const ciiRatio = Number((attainedCII / requiredCII).toFixed(3));
  const { rating: ciiRating, verdict: ciiVerdict, marpolAnnexViStatus } = calculateImoCiiRating(
    attainedCII,
    requiredCII
  );

  // 4. Local Port Tariffs & Handling Charges
  const pilotage = destPort.tariffs.pilotageFeeUSD;
  const berthDays = Math.max(1.5, Math.ceil(cargoTonnage / 25000));
  const berthHire = Number(
    (destPort.tariffs.berthHireUSDPerGTDay * vessel.grossTonnage * berthDays).toFixed(0)
  );
  const portDues = destPort.tariffs.portDuesUSD;
  const tugAssistance = destPort.tariffs.tugChargesUSD;
  const wharfageHandling = Number((destPort.tariffs.wharfagePerMTUSD * cargoTonnage).toFixed(0));

  // Green rebate incentive if vessel achieves CII rating A or B
  let greenDiscount = 0;
  if (ciiRating === "A" && destPort.greenCorridor.esiTariffRebatePercent > 0) {
    greenDiscount = Number((portDues * (destPort.greenCorridor.esiTariffRebatePercent / 100)).toFixed(0));
  } else if (ciiRating === "B") {
    greenDiscount = Number((portDues * 0.05).toFixed(0));
  }

  const totalPortTariffUSD = pilotage + berthHire + portDues + tugAssistance + wharfageHandling - greenDiscount;
  const totalPortTariffINR = Math.round(totalPortTariffUSD * destPort.tariffs.currencyINRPerUSD);

  // 5. Official IMO Statutory Documents & Safety Data Sheets
  const nowSerial = Date.now().toString().slice(-6);
  const locodePrefix = destPort.locode;

  const statutoryDocs = {
    vgmCertificate: {
      certificateNumber: `VGM-${locodePrefix}-${nowSerial}`,
      verifiedGrossMassMT: Math.round(cargoTonnage * 1.018), // includes tare weight / dunnage
      method: "SOLAS VI/2 Method 1 (Calibrated Weighbridge & Certified Draft Survey)",
      scaleTicketId: `ST-${destPort.locode}-2026-${nowSerial}`,
      authorizedSignatory: "Master Mariner / Chief Officer & Terminal Surveyor",
    },
    dgManifest: {
      manifestNumber: `DG-${vessel.imoNumber.replace(/\D/g, "")}-${nowSerial}`,
      unNumber: cargo.unNumber,
      properShippingName: cargo.name,
      imdgClass: cargo.imdgClass,
      packingGroup: cargo.packingGroup || "N/A",
      flashpoint: cargo.sds.flashpointC !== undefined ? `${cargo.sds.flashpointC}°C (Closed Cup)` : "Non-Flammable Liquid / Solid",
      emergencyScheduleEmS: cargo.sds.emergencyScheduleEmS,
      marinePollutant: cargo.category === "LIQUID_BULK" || cargo.category === "CHEMICAL_DG",
    },
    sdsSummary: {
      casNumber: cargo.sds.casNumber,
      ergGuideNumber: cargo.sds.ergGuideNumber,
      firefightingAgent: cargo.sds.firefightingAgent,
      spillMitigation: cargo.sds.spillMitigation,
    },
    billOfLading: {
      blNumber: `BL-BST-${destPort.locode}-${nowSerial}`,
      carrier: `${vessel.name} (IMO ${vessel.imoNumber})`,
      shipper: `Global Energy & Commodities Ltd (${originPort.name})`,
      consignee: `To Order of Steel Authority / Terminal Operator (${destPort.name})`,
      portOfLoading: `${originPort.name} [${originPort.locode}]`,
      portOfDischarge: `${destPort.name} [${destPort.locode}]`,
      freightStatus: "Freight Prepaid as per Charterparty Agreement",
    },
    ispsAndHealth: {
      ispsSecurityLevel: "Level 1 (Normal)" as const,
      maritimeHealthDeclaration: `WHO/IHR-2005 Maritime Declaration of Health No. MDH-${nowSerial} (Clean Bill of Health)`,
      portStateControlRiskTier: destPort.congestion.status === "Low Congestion" ? ("Low Risk" as const) : ("Standard Risk" as const),
    },
  };

  return {
    originPort,
    destPort,
    cargo,
    vessel,
    cargoTonnageMT: cargoTonnage,
    laycanDate: departureDateStr,
    distanceNM,
    transitHours,
    transitDays,
    departureDate: formatDate(departureDate),
    etaPilotStation: formatDate(etaPilotDate),
    etaBerthArrival: formatDate(etaBerthDate),
    preBerthingWaitHours: preBerthingHours,
    seaFuelBurnMT,
    portFuelBurnMT,
    totalFuelBurnMT,
    totalCo2EmissionsMT,
    soxEmissionsMT,
    marpolSoxLimit,
    attainedCII,
    requiredCII,
    ciiRatio,
    ciiRating,
    ciiVerdict,
    marpolAnnexViStatus,
    tariffsUSD: {
      pilotage,
      berthHire,
      portDues,
      tugAssistance,
      wharfageHandling,
      greenIncentiveCredit: greenDiscount,
      totalPortTariffUSD,
      totalPortTariffINR,
    },
    statutoryDocs,
  };
}
