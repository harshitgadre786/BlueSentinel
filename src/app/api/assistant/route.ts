import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateDynamicImoShipment, DynamicVoyageCalculation } from "@/lib/imo-maritime-engine";
import { PRELOADED_DOCUMENTS } from "@/lib/rag-knowledge-base";
import { IMO_PORTS, IMO_CARGO_TYPES } from "@/data/imo-shipment-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, shipmentContext, conversationHistory = [] } = body;

    const userQuery = (message || "").toString().trim();
    if (!userQuery) {
      return NextResponse.json(
        { success: false, error: "Query message is required." },
        { status: 400 }
      );
    }

    // 1. DYNAMIC SHIPMENT CONTEXT RETRIEVAL
    const originId = shipmentContext?.originPortId || "singapore";
    const destId = shipmentContext?.destPortId || "in-paradip";
    const cargoId = shipmentContext?.cargoTypeId || "dry_bulk_imsbc";
    const vesselId = shipmentContext?.vesselId || "vesselB";
    const cargoTonnage = Number(shipmentContext?.cargoTonnageMT) || 75000;
    const laycanDate = shipmentContext?.laycanDate || new Date().toISOString().slice(0, 10);

    const calculation: DynamicVoyageCalculation = calculateDynamicImoShipment({
      originPortId: originId,
      destPortId: destId,
      cargoTypeId: cargoId,
      vesselId,
      cargoTonnageMT: cargoTonnage,
      laycanDate,
    });

    // 2. KNOWLEDGE BASE RAG RETRIEVAL (Top matching document chunks)
    const queryTokens = userQuery.toLowerCase().split(/\W+/).filter((t: string) => t.length > 2);
    const scoredChunks: { chunkHeading: string; docTitle: string; pageNumber: number; text: string; score: number }[] = [];

    for (const doc of PRELOADED_DOCUMENTS) {
      for (const chunk of doc.chunks) {
        let score = 0;
        const chunkLower = chunk.text.toLowerCase();
        const headingLower = chunk.heading.toLowerCase();

        for (const token of queryTokens) {
          if (headingLower.includes(token)) score += 5;
          if (chunkLower.includes(token)) score += 2;
          if (chunk.keywords.some((k) => k.toLowerCase().includes(token))) score += 4;
        }

        // Boost destination port relevant documents
        if (destId.includes("paradip") && doc.id.includes("paradip")) score += 3;

        if (score > 0) {
          scoredChunks.push({
            chunkHeading: chunk.heading,
            docTitle: doc.title,
            pageNumber: chunk.pageNumber,
            text: chunk.text,
            score,
          });
        }
      }
    }

    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 3);

    // 3. COMPILE STRUCTURED RAG CONTEXT
    const structuredContext = `
================================================================================
ACTIVE SHIPMENT CONTEXT (REAL-TIME IMO PARAMETERS):
================================================================================
- Route: ${calculation.originPort.name} [UN/LOCODE: ${calculation.originPort.locode}] ➔ ${calculation.destPort.name} [UN/LOCODE: ${calculation.destPort.locode}]
- Distance & Routing: ${calculation.distanceNM.toLocaleString()} Nautical Miles (Transit: ${calculation.transitDays} Days / ${calculation.transitHours}h sea leg @ ${calculation.vessel.serviceSpeedKnots} kts)
- Departure Laycan: ${calculation.departureDate}
- Dynamic ETA:
  * Pilot Boarding Station: ${calculation.etaPilotStation}
  * Berth Arrival (includes queue): ${calculation.etaBerthArrival} (+${calculation.preBerthingWaitHours}h wait queue)
- Destination Port Details:
  * Max Permissible Berth Draft: ${calculation.destPort.maxBerthDraftM}m CD (Max LOA: ${calculation.destPort.maxLOAM}m)
  * Berth Congestion: ${calculation.destPort.congestion.status} (${calculation.destPort.congestion.queuedVesselsCount} queued vessels, ${calculation.destPort.congestion.avgPreBerthingHours}h avg delay)
  * Weather & Sea State: Significant Wave ${calculation.destPort.weatherSeaState.waveHeightM}m, Swell: ${calculation.destPort.weatherSeaState.swellDirection}, Wind: ${calculation.destPort.weatherSeaState.windSpeedKnots} kts (${calculation.destPort.weatherSeaState.windDirection}), Beaufort Scale: ${calculation.destPort.weatherSeaState.beaufortDescription}
  * Total Port Tariff: $${calculation.tariffsUSD.totalPortTariffUSD.toLocaleString()} USD (₹${calculation.tariffsUSD.totalPortTariffINR.toLocaleString()} INR)
  * Green Regulations: ${calculation.destPort.greenCorridor.marpolAnnexViZone}, Shore Power: ${calculation.destPort.greenCorridor.shorePowerAvailable ? "Available" : "Not Available"}
- Cargo Profile:
  * Commodity: ${calculation.cargo.name} (${calculation.cargoTonnageMT.toLocaleString()} MT)
  * IMO Convention: ${calculation.cargo.imoConvention}
  * Hazard Classification: ${calculation.cargo.hazardClassification}
  * UN Number: ${calculation.cargo.unNumber} | IMDG Class: ${calculation.cargo.imdgClass} | Packing Group: ${calculation.cargo.packingGroup || "N/A"}
  * Stowage & Segregation: ${calculation.cargo.stowageSegregationProtocol}
  * Target Storage Temp/Pressure: ${calculation.cargo.targetStorageTempPressure}
  * SDS Emergency Schedule (EmS): ${calculation.cargo.sds.emergencyScheduleEmS} | CAS: ${calculation.cargo.sds.casNumber} | ERG Guide: #${calculation.cargo.sds.ergGuideNumber}
  * Firefighting Agent: ${calculation.cargo.sds.firefightingAgent}
  * Spill Mitigation: ${calculation.cargo.sds.spillMitigation}
- Chartered Vessel:
  * Name: ${calculation.vessel.name} [IMO: ${calculation.vessel.imoNumber}, MMSI: ${calculation.vessel.mmsi}, Flag: ${calculation.vessel.flag}]
  * Dimensions: DWT ${calculation.vessel.dwt.toLocaleString()} MT, Design Draft: ${calculation.vessel.designDraftM}m, Beam: ${calculation.vessel.beamM}m, LOA: ${calculation.vessel.loaM}m
  * Fuel Type: ${calculation.vessel.fuelType} (Sea Daily Burn: ${calculation.vessel.seaDailyFuelBurnMT} MT/day)
- Decarbonization & IMO Carbon Intensity Indicator (CII):
  * Total Fuel Consumed: ${calculation.totalFuelBurnMT} MT
  * Total GHG CO2 Emitted: ${calculation.totalCo2EmissionsMT} MT CO2
  * Attained CII: ${calculation.attainedCII} g CO2/DWT·NM
  * Required Reference CII: ${calculation.requiredCII} g CO2/DWT·NM (Ratio: ${calculation.ciiRatio})
  * Official IMO CII Rating: GRADE ${calculation.ciiRating} (${calculation.ciiVerdict})
  * MARPOL Annex VI Status: ${calculation.marpolAnnexViStatus}
  * SOx Emissions: ${calculation.soxEmissionsMT} MT (${calculation.marpolSoxLimit})
- Statutory IMO Documentation:
  * SOLAS VGM Certificate: #${calculation.statutoryDocs.vgmCertificate.certificateNumber} (${calculation.statutoryDocs.vgmCertificate.verifiedGrossMassMT.toLocaleString()} MT via ${calculation.statutoryDocs.vgmCertificate.method})
  * Dangerous Goods Manifest (FAL Form 7): #${calculation.statutoryDocs.dgManifest.manifestNumber}
  * Clean Ocean Bill of Lading: #${calculation.statutoryDocs.billOfLading.blNumber}
  * ISPS Security: ${calculation.statutoryDocs.ispsAndHealth.ispsSecurityLevel}
  * Health Declaration: ${calculation.statutoryDocs.ispsAndHealth.maritimeHealthDeclaration}

================================================================================
RETRIEVED IMO REGULATORY & PORT CIRCULAR CITATIONS:
================================================================================
${
  topChunks.length > 0
    ? topChunks
        .map(
          (c, idx) =>
            `[Citation ${idx + 1}] Source: "${c.docTitle}", Page ${c.pageNumber} (${c.chunkHeading}):\n"${c.text}"`
        )
        .join("\n\n")
    : "No external port circulars required. Standard statutory IMO conventions apply directly."
}
================================================================================
`;

    const systemInstruction =
      "You are BlueSentinel AI, an expert maritime logistics and IMO compliance assistant. Always answer the user's questions grounded strictly in the provided shipment context and official IMO conventions (SOLAS, MARPOL, IMDG Code). If context is unavailable for a specific detail, state so clearly rather than hallucinating.";

    // 4. GEMINI GENERATION
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey) {
      try {
        let replyText = "";

        // Attempt generation using @google/genai SDK
        try {
          const ai = new GoogleGenAI({ apiKey: geminiApiKey });
          const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${structuredContext}\n\nUSER QUESTION:\n${userQuery}`,
                  },
                ],
              },
            ],
            config: {
              systemInstruction,
              temperature: 0.2,
              maxOutputTokens: 1024,
            },
          });
          replyText = response.text || "";
        } catch (genAiSdkErr) {
          console.warn("Attempting fallback to @google/generative-ai SDK:", genAiSdkErr);
          const genAI = new GoogleGenerativeAI(geminiApiKey);
          const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1024,
            },
          });
          const result = await model.generateContent(
            `${structuredContext}\n\nUSER QUESTION:\n${userQuery}`
          );
          replyText = result.response.text();
        }

        if (replyText) {
          return NextResponse.json({
            success: true,
            provider: "gemini-1.5-flash",
            reply: replyText,
            citations: topChunks.map((c) => ({
              source: c.docTitle,
              section: c.chunkHeading,
              page: c.pageNumber,
            })),
            shipmentSummary: {
              origin: `${calculation.originPort.name} [${calculation.originPort.locode}]`,
              destination: `${calculation.destPort.name} [${calculation.destPort.locode}]`,
              cargo: calculation.cargo.name,
              tonnage: calculation.cargoTonnageMT,
              ciiRating: calculation.ciiRating,
              eta: calculation.etaBerthArrival,
            },
          });
        }
      } catch (geminiError: unknown) {
        console.error("Gemini API invocation error:", geminiError);
        // Fall through to deterministic zero-hallucination grounded RAG fallback
      }
    }

    // 5. DETERMINISTIC ZERO-HALLUCINATION GROUNDED RAG FALLBACK
    // Guarantees immediate, accurate answer even if GEMINI_API_KEY is unset or experiencing API limits
    const lowerQuery = userQuery.toLowerCase();
    let groundedResponse = "";

    if (lowerQuery.includes("hazard") || lowerQuery.includes("imdg") || lowerQuery.includes("imsbc") || lowerQuery.includes("un number") || lowerQuery.includes("sds")) {
      groundedResponse = `### IMO Hazard & Regulatory Classification for ${calculation.cargo.name}

- **Statutory Framework:** ${calculation.cargo.imoConvention}
- **UN Number & IMDG Class:** \`${calculation.cargo.unNumber}\` | **${calculation.cargo.imdgClass}** (Packing Group: ${calculation.cargo.packingGroup || "N/A"})
- **Hazard Classification:** ${calculation.cargo.hazardClassification}
- **Stowage & Segregation Protocol:** ${calculation.cargo.stowageSegregationProtocol}
- **Target Storage Parameters:** ${calculation.cargo.targetStorageTempPressure}
- **Safety Data Sheet (SDS) Profile:**
  - **CAS Registry:** \`${calculation.cargo.sds.casNumber}\` | **ERG Guide:** #${calculation.cargo.sds.ergGuideNumber}
  - **Emergency Schedule (EmS):** \`${calculation.cargo.sds.emergencyScheduleEmS}\`
  - **Firefighting Protocol:** ${calculation.cargo.sds.firefightingAgent}
  - **Spill Mitigation:** ${calculation.cargo.sds.spillMitigation}
- **Mandatory IMO Declarations:**
  ${calculation.cargo.requiredDeclarations.map((d) => `  * ✓ ${d}`).join("\n")}`;
    } else if (lowerQuery.includes("cii") || lowerQuery.includes("carbon") || lowerQuery.includes("emission") || lowerQuery.includes("marpol") || lowerQuery.includes("co2") || lowerQuery.includes("sox")) {
      groundedResponse = `### IMO Carbon Intensity Indicator (CII) & MARPOL Annex VI Audit

- **Official IMO CII Rating:** **GRADE ${calculation.ciiRating}** (${calculation.ciiVerdict})
- **Attained CII:** **${calculation.attainedCII} g CO₂/DWT·NM** vs Required Reference: **${calculation.requiredCII} g CO₂/DWT·NM**
- **CII Ratio:** **${calculation.ciiRatio}** (Boundary compliance according to IMO MEPC.337(76))
- **Total Fuel Consumed:** **${calculation.totalFuelBurnMT} MT** of ${calculation.vessel.fuelType} (${calculation.seaFuelBurnMT} MT sea leg + ${calculation.portFuelBurnMT} MT port stay)
- **Total GHG Emissions:** **${calculation.totalCo2EmissionsMT} MT CO₂**
- **SOx Emissions:** **${calculation.soxEmissionsMT} MT** (${calculation.marpolSoxLimit})
- **Regulatory Verdict:** ${calculation.marpolAnnexViStatus}`;
    } else if (lowerQuery.includes("document") || lowerQuery.includes("vgm") || lowerQuery.includes("manifest") || lowerQuery.includes("bill of lading") || lowerQuery.includes("isps") || lowerQuery.includes("clearance")) {
      groundedResponse = `### Required IMO Documentation & Declarations for Port Call at ${calculation.destPort.name}

1. **SOLAS Verified Gross Mass (VGM):**
   - Certificate: \`${calculation.statutoryDocs.vgmCertificate.certificateNumber}\`
   - Certified Mass: **${calculation.statutoryDocs.vgmCertificate.verifiedGrossMassMT.toLocaleString()} MT**
   - Methodology: ${calculation.statutoryDocs.vgmCertificate.method} (Scale Ticket: \`${calculation.statutoryDocs.vgmCertificate.scaleTicketId}\`)
2. **IMO Dangerous Goods Manifest (FAL Form 7):**
   - Manifest: \`${calculation.statutoryDocs.dgManifest.manifestNumber}\`
   - Proper Shipping Name: **${calculation.statutoryDocs.dgManifest.properShippingName}** (\`${calculation.statutoryDocs.dgManifest.unNumber}\`)
   - EmS: \`${calculation.statutoryDocs.dgManifest.emergencyScheduleEmS}\` | Marine Pollutant: ${calculation.statutoryDocs.dgManifest.marinePollutant ? "YES" : "NO"}
3. **Clean On-Board Ocean Bill of Lading:**
   - Serial: \`${calculation.statutoryDocs.billOfLading.blNumber}\` (Carrier: ${calculation.statutoryDocs.billOfLading.carrier})
4. **ISPS Security & Maritime Health:**
   - Security Status: **${calculation.statutoryDocs.ispsAndHealth.ispsSecurityLevel}**
   - Health Declaration: ${calculation.statutoryDocs.ispsAndHealth.maritimeHealthDeclaration}`;
    } else if (lowerQuery.includes("port") || lowerQuery.includes("berth") || lowerQuery.includes("tariff") || lowerQuery.includes("congestion") || lowerQuery.includes("weather") || lowerQuery.includes("draft") || lowerQuery.includes("eta")) {
      groundedResponse = `### Port Intelligence & Nautical Status: ${calculation.destPort.name} [${calculation.destPort.locode}]

- **Routing Distance:** **${calculation.distanceNM.toLocaleString()} NM** from ${calculation.originPort.name} [${calculation.originPort.locode}]
- **Transit Schedule:** ${calculation.transitDays} Days (${calculation.transitHours}h @ ${calculation.vessel.serviceSpeedKnots} kts)
- **Departure:** ${calculation.departureDate}
- **Pilot Boarding Station ETA:** **${calculation.etaPilotStation}**
- **Berth Arrival ETA:** **${calculation.etaBerthArrival}** (Includes +${calculation.preBerthingWaitHours}h pre-berthing queue delay)
- **Berth Congestion Status:** **${calculation.destPort.congestion.status}** (${calculation.destPort.congestion.queuedVesselsCount} queued vessels)
- **Maximum Permissible Draft:** **${calculation.destPort.maxBerthDraftM}m CD** (Vessel Arrival Draft: ${calculation.vessel.designDraftM}m)
- **Weather & Sea State:** Wave Height **${calculation.destPort.weatherSeaState.waveHeightM}m**, Swell: **${calculation.destPort.weatherSeaState.swellDirection}**, Wind: **${calculation.destPort.weatherSeaState.windSpeedKnots} kts (${calculation.destPort.weatherSeaState.windDirection})**, **${calculation.destPort.weatherSeaState.beaufortDescription}**
- **Local Port Tariff:** **$${calculation.tariffsUSD.totalPortTariffUSD.toLocaleString()} USD** (₹${calculation.tariffsUSD.totalPortTariffINR.toLocaleString()} INR)
- **Green Corridor Policy:** ${calculation.destPort.greenCorridor.marpolAnnexViZone} | Shore Power: ${calculation.destPort.greenCorridor.shorePowerAvailable ? "Equipped" : "Not Equipped"}`;
    } else {
      groundedResponse = `### BlueSentinel AI Grounded Maritime Briefing

**Active Voyage Overview:**
- **Vessel & Cargo:** **${calculation.vessel.name}** carrying **${calculation.cargoTonnageMT.toLocaleString()} MT** of **${calculation.cargo.name}** (\`${calculation.cargo.unNumber}\` / ${calculation.cargo.imdgClass})
- **Voyage Corridor:** ${calculation.originPort.name} [${calculation.originPort.locode}] ➔ ${calculation.destPort.name} [${calculation.destPort.locode}] (${calculation.distanceNM.toLocaleString()} NM)
- **Arrival ETA:** **${calculation.etaBerthArrival}** (+${calculation.preBerthingWaitHours}h berth queue accounted)
- **CII Compliance:** **GRADE ${calculation.ciiRating}** (${calculation.attainedCII} g CO₂/DWT·NM vs ${calculation.requiredCII} baseline)
- **Weather Condition at POD:** Significant wave ${calculation.destPort.weatherSeaState.waveHeightM}m, ${calculation.destPort.weatherSeaState.beaufortDescription}
- **Port Tariff:** $${calculation.tariffsUSD.totalPortTariffUSD.toLocaleString()} USD (₹${calculation.tariffsUSD.totalPortTariffINR.toLocaleString()} INR)

*Tip: Ask specific questions regarding IMO hazard protocols, SDS emergency measures, CII decarbonization, or port entry clearance documentation.*`;
    }

    return NextResponse.json({
      success: true,
      provider: "rag-grounded-maritime-engine",
      reply: groundedResponse,
      citations: topChunks.map((c) => ({
        source: c.docTitle,
        section: c.chunkHeading,
        page: c.pageNumber,
      })),
      shipmentSummary: {
        origin: `${calculation.originPort.name} [${calculation.originPort.locode}]`,
        destination: `${calculation.destPort.name} [${calculation.destPort.locode}]`,
        cargo: calculation.cargo.name,
        tonnage: calculation.cargoTonnageMT,
        ciiRating: calculation.ciiRating,
        eta: calculation.etaBerthArrival,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error processing assistant request";
    console.error("Assistant API route exception:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
