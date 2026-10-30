/**
 * ============================================================================
 * BlueSentinel - IMO Relational Data Service
 * Connects Supabase relational tables:
 *  - ports
 *  - cargo_types
 *  - vessels
 *  - regulations
 *  - shipments
 * With robust offline/demo fallbacks to `src/data/imo-shipment-data.ts`.
 * ============================================================================
 */

import { supabase, isSupabaseConfigured } from "./supabase-client";
import {
  ImoPort,
  ImoCargoType,
  ImoVessel,
  IMO_PORTS,
  IMO_CARGO_TYPES,
  IMO_VESSELS,
} from "@/data/imo-shipment-data";
import {
  calculateDynamicImoShipment,
  DynamicVoyageCalculation,
} from "./imo-maritime-engine";

export interface ShipmentRecord {
  id: string;
  origin_port_id: string;
  destination_port_id: string;
  cargo_type_id: string;
  vessel_id: string;
  cargo_tonnage_mt: number;
  laycan_date: string;
  distance_nm: number;
  transit_hours: number;
  eta_berth: string;
  attained_cii: number;
  cii_rating: string;
  total_co2_mt: number;
  total_port_tariff_usd: number;
  status: string;
  created_at: string;
}

const LOCAL_STORAGE_ACTIVE_SHIPMENT_KEY = "bluesentinel_active_imo_shipment";

/**
 * Fetch all available ports from Supabase or local master
 */
export async function getImoPorts(): Promise<ImoPort[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("ports").select("*");
      if (!error && data && data.length > 0) {
        return data as ImoPort[];
      }
    } catch (err) {
      console.warn("Supabase ports query fallback:", err);
    }
  }
  return Object.values(IMO_PORTS);
}

/**
 * Fetch all available IMO cargo types from Supabase or local master
 */
export async function getImoCargoTypes(): Promise<ImoCargoType[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("cargo_types").select("*");
      if (!error && data && data.length > 0) {
        return data as ImoCargoType[];
      }
    } catch (err) {
      console.warn("Supabase cargo_types query fallback:", err);
    }
  }
  return Object.values(IMO_CARGO_TYPES);
}

/**
 * Fetch all candidate vessels from Supabase or local master
 */
export async function getImoVessels(): Promise<ImoVessel[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("vessels").select("*");
      if (!error && data && data.length > 0) {
        return data as ImoVessel[];
      }
    } catch (err) {
      console.warn("Supabase vessels query fallback:", err);
    }
  }
  return Object.values(IMO_VESSELS);
}

/**
 * Save an active IMO shipment calculation to Supabase and LocalStorage
 */
export async function persistImoShipment(
  calc: DynamicVoyageCalculation
): Promise<{ success: boolean; id: string }> {
  const shipmentId = "shp_" + Date.now();

  if (isSupabaseConfigured && supabase) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from("shipments")
          .insert([
            {
              user_id: session.user.id,
              origin_port_id: calc.originPort.id,
              destination_port_id: calc.destPort.id,
              cargo_type_id: calc.cargo.id,
              vessel_id: calc.vessel.id,
              cargo_tonnage_mt: calc.cargoTonnageMT,
              laycan_date: new Date(calc.laycanDate).toISOString(),
              distance_nm: calc.distanceNM,
              transit_hours: calc.transitHours,
              eta_pilot: new Date(calc.etaPilotStation).toISOString(),
              eta_berth: new Date(calc.etaBerthArrival).toISOString(),
              pre_berthing_wait_hours: calc.preBerthingWaitHours,
              sea_fuel_mt: calc.seaFuelBurnMT,
              total_co2_mt: calc.totalCo2EmissionsMT,
              attained_cii: calc.attainedCII,
              cii_rating: calc.ciiRating,
              total_port_tariff_usd: calc.tariffsUSD.totalPortTariffUSD,
              statutory_documents: calc.statutoryDocs,
              status: "ACTIVE",
            },
          ])
          .select();

        if (!error && data && data.length > 0) {
          return { success: true, id: data[0].id || shipmentId };
        }
      }
    } catch (err) {
      console.warn("Supabase persist shipment fallback:", err);
    }
  }

  // Local storage persistence
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_ACTIVE_SHIPMENT_KEY,
        JSON.stringify({
          originPortId: calc.originPort.id,
          destPortId: calc.destPort.id,
          cargoTypeId: calc.cargo.id,
          vesselId: calc.vessel.id,
          cargoTonnageMT: calc.cargoTonnageMT,
          laycanDate: calc.laycanDate,
        })
      );
    } catch {
      // ignore quota limits
    }
  }

  return { success: true, id: shipmentId };
}

/**
 * Get active shipment selection from localStorage or fallback defaults
 */
export function getSavedImoShipmentParams(): {
  originPortId: string;
  destPortId: string;
  cargoTypeId: string;
  vesselId: string;
  cargoTonnageMT: number;
  laycanDate: string;
} {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_ACTIVE_SHIPMENT_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
  }

  return {
    originPortId: "singapore",
    destPortId: "in-paradip",
    cargoTypeId: "dry_bulk_imsbc",
    vesselId: "vesselB",
    cargoTonnageMT: 75000,
    laycanDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
  };
}
