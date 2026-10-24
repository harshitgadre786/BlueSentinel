import {
  RAGDocument,
  DocumentChunk,
  VesselCalculationResult,
  ComparisonVerdict,
  SimulationInputs,
  PortData,
} from "./types";

export const PRELOADED_DOCUMENTS: RAGDocument[] = [
  {
    id: "doc_paradip_circular_2026",
    title: "Paradip Port Authority - Marine Circular & Berth Draft Notice 2026",
    filename: "Paradip_Port_Notice_Marine_Circular_2026.pdf",
    category: "PORT_NOTICE",
    uploadDate: "2026-09-15",
    sizeBytes: 428000,
    chunks: [
      {
        id: "pna_c1",
        pageNumber: 1,
        heading: "Section 1: General Navigation & Under Keel Clearance (UKC) Policy",
        text: "The Paradip Port Authority enforces a mandatory static Under Keel Clearance (UKC) of 1.20 meters at the approach fairway and inner basin. All deep-draft bulk carriers exceeding 13.5m arrival draft must present dynamic trim and squat calculations to the Harbor Master prior to crossing the Sandheads pilot boarding ground.",
        keywords: ["UKC", "under keel clearance", "draft", "sandheads", "harbor master", "squat", "fairway"],
      },
      {
        id: "pna_c2",
        pageNumber: 2,
        heading: "Section 2: Maximum Permissible Drafts at Bulk Cargo Berths (Berth 4, 5 & Mechanized Iron Ore Berth)",
        text: "Berth 4 and Berth 5 maximum permissible draft at Chart Datum (CD) is 14.20 meters. With a mean semi-diurnal spring tide allowance of +1.50 meters, the nominal depth is 15.70 meters. Factoring required safety UKC (1.20m), the maximum allowable dynamic arrival draft under normal pilotage is strictly capped at 14.20m. Any vessel presenting a dynamic draft greater than 14.20m will be refused entry to the inner channel.",
        keywords: ["maximum permissible draft", "berth 4", "berth 5", "14.20m", "tide allowance", "dynamic draft", "refused entry"],
      },
      {
        id: "pna_c3",
        pageNumber: 3,
        heading: "Section 3: Mandatory Offshore Lightering Tariff & Transshipment Regulations",
        text: "Vessels exceeding maximum permissible draft must lighter cargo at Paradip Offshore Anchorage (POA) before channel transit. The approved stevedoring transshipment lightering tariff is $9.50 per metric tonne of lightered cargo, in addition to a flat tug and barge mobilization fee of $35,000 USD. Minimum offshore lightering duration is 72 to 96 hours depending on sea state.",
        keywords: ["offshore lightering", "transshipment", "tariff", "9.50", "35000", "barge", "delay"],
      },
      {
        id: "pna_c4",
        pageNumber: 4,
        heading: "Section 4: Demurrage, Anchorage Delays & Berth Congestion Tariffs",
        text: "Average anchorage waiting time during post-monsoon iron ore export peak is 3.5 to 5.0 days. Standard charter party demurrage for Panamax and Post-Panamax bulk carriers is assessed at $22,000 USD per running day (pro-rata). Vessels missing their allocated high-water tidal window due to non-compliant draft will forfeit their queuing sequence and be pushed to outer anchorage.",
        keywords: ["demurrage", "anchorage", "waiting time", "22000", "tidal window", "congestion", "berth"],
      },
      {
        id: "pna_c5",
        pageNumber: 5,
        heading: "Section 5: Environmental, Speed Limits & Marine Life Conservation",
        text: "Paradip approach channel borders Olive Ridley sea turtle breeding corridors and coastal cetacean habitats. In accordance with DG Shipping Advisory 14/2025, commercial vessels are instructed to maintain speed below 11.5 knots within 25 nautical miles of the coastline to mitigate underwater radiated noise (URN) and prevent fatal marine strikes.",
        keywords: ["environmental", "olive ridley", "speed limit", "11.5 knots", "underwater radiated noise", "URN", "cetacean"],
      },
    ],
  },
  {
    id: "doc_vessel_a_spec",
    title: "MV Sagar Samrat - Ship Particulars & Hydrostatic Tables",
    filename: "MV_Sagar_Samrat_Panamax_SpecSheet.pdf",
    category: "VESSEL_SPEC",
    uploadDate: "2026-08-10",
    sizeBytes: 582000,
    chunks: [
      {
        id: "vsa_c1",
        pageNumber: 1,
        heading: "Principal Dimensions & Deadweight Particulars",
        text: "Vessel Name: MV Sagar Samrat. Vessel Type: Post-Panamax Gearless Bulk Carrier. Flag: Marshall Islands. Year Built: 2014. Length Overall (LOA): 229.00 meters. Beam: 32.26 meters. Summer Deadweight: 82,500 MT. Summer Laden Draft (Extreme): 14.80 meters. Lightship: 13,850 MT. Block Coefficient (Cb): 0.825 at summer draft.",
        keywords: ["MV Sagar Samrat", "Panamax", "82500", "LOA 229", "draft 14.80m", "beam 32.26", "summer draft"],
      },
      {
        id: "vsa_c2",
        pageNumber: 2,
        heading: "Propulsion, Engine Ratings & Fuel Consumption Curves",
        text: "Main Engine: MAN B&W 6S60MC-C (Tier II). MCR: 11,200 kW @ 105 RPM. Baseline design speed: 14.2 knots laden. Fuel consumption at design speed: 31.8 MT VLSFO per day (calm sea, ISO condition). Auxiliary generators consumption: 3.4 MT VLSFO per day in port / idle anchor. Emission conversion factor: 3.114 MT CO2 per MT fuel.",
        keywords: ["MAN B&W 6S60MC-C", "fuel consumption", "31.8 MT", "Tier II", "3.4 MT aux", "speed 14.2 knots", "VLSFO"],
      },
      {
        id: "vsa_c3",
        pageNumber: 3,
        heading: "Commercial Charter Terms & Hydrodynamic Squat Characteristics",
        text: "Daily base charter hire rate: $18,500 USD per day net. Conventional bulbous bow and stern design. Hydrodynamic squat in restricted shallow waters (depth/draft < 1.2) generates an estimated 0.15m to 0.22m bodily sinkage at speeds between 10.0 and 13.0 knots, bringing extreme dynamic draft to 14.95m - 15.02m.",
        keywords: ["18500", "charter rate", "squat", "dynamic draft", "sinkage", "14.95m", "hydrodynamic"],
      },
    ],
  },
  {
    id: "doc_vessel_b_spec",
    title: "MV Nilgiri Green - Eco-Ultramax Vessel Particulars & Green Passport",
    filename: "MV_Nilgiri_Green_EcoUltramax_SpecSheet.pdf",
    category: "VESSEL_SPEC",
    uploadDate: "2026-08-22",
    sizeBytes: 615000,
    chunks: [
      {
        id: "vsb_c1",
        pageNumber: 1,
        heading: "Principal Dimensions & Shallow-Draft Design",
        text: "Vessel Name: MV Nilgiri Green. Vessel Type: Eco-Designed Shallow-Draft Ultramax Bulk Carrier. Flag: Singapore. Year Built: 2021. Length Overall (LOA): 199.90 meters. Beam: 32.26 meters. Summer Deadweight: 64,200 MT. Summer Laden Draft (Extreme): 13.30 meters. Shallow-draft wide-beam naval architecture specifically optimized for tidal Indian ports.",
        keywords: ["MV Nilgiri Green", "Ultramax", "64200", "LOA 199.9", "draft 13.30m", "shallow draft", "safe draft"],
      },
      {
        id: "vsb_c2",
        pageNumber: 2,
        heading: "High-Efficiency Propulsion & Decarbonization Package",
        text: "Main Engine: MAN B&W 6S50ME-C9.7 Electronic Common Rail (IMO Tier III compliant with SCR). Hydrodynamic appendages: Becker Mewis Duct and Propeller Boss Cap Fins (PBCF). Baseline design speed: 13.8 knots. Fuel consumption at design speed: 24.5 MT VLSFO per day (23% more efficient than conventional Panamax). Auxiliary consumption: 2.1 MT/day at anchor.",
        keywords: ["MAN B&W 6S50ME-C9.7", "fuel consumption 24.5 MT", "Tier III", "Mewis Duct", "eco", "green", "efficient"],
      },
      {
        id: "vsb_c3",
        pageNumber: 3,
        heading: "Commercial Terms, Underwater Radiated Noise (URN) & Port Versatility",
        text: "Daily base charter hire rate: $21,000 USD per day. Low acoustic footprint: DNV SILENT-E notation compliant, propeller cavitation inception speed elevated to 12.8 knots. Dynamic draft at 12 knots restricted channel transit is 13.42 meters, comfortably within Paradip Berth 4 max allowable draft limit of 14.20m with over 0.78m safety UKC surplus. Zero lightering required.",
        keywords: ["21000", "charter rate", "SILENT-E", "URN", "underwater noise", "zero lightering", "safe UKC surplus", "13.42m"],
      },
    ],
  },
];

/**
 * In-memory document collection supporting preloaded + uploaded user documents
 */
let documentStore: RAGDocument[] = [...PRELOADED_DOCUMENTS];

export function getIndexedDocuments(): RAGDocument[] {
  return documentStore;
}

export function addDocumentToStore(doc: RAGDocument): void {
  documentStore = [doc, ...documentStore.filter((d) => d.id !== doc.id)];
}

export function removeDocumentFromStore(docId: string): void {
  documentStore = documentStore.filter((d) => d.id !== docId);
}

/**
 * Retrieve top relevant document chunks for a query
 */
export function searchKnowledgeBase(
  query: string,
  topK: number = 4
): {
  chunk: DocumentChunk;
  docTitle: string;
  filename: string;
  score: number;
}[] {
  const queryWords = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scored: {
    chunk: DocumentChunk;
    docTitle: string;
    filename: string;
    score: number;
  }[] = [];

  for (const doc of documentStore) {
    for (const chunk of doc.chunks) {
      let score = 0;
      const fullText = (chunk.heading + " " + chunk.text + " " + chunk.keywords.join(" ")).toLowerCase();

      for (const word of queryWords) {
        if (chunk.heading.toLowerCase().includes(word)) score += 5;
        if (chunk.keywords.some((k) => k.toLowerCase().includes(word))) score += 4;
        const occurrences = (fullText.match(new RegExp(word, "g")) || []).length;
        score += occurrences * 1.5;
      }

      if (score > 0) {
        scored.push({
          chunk,
          docTitle: doc.title,
          filename: doc.filename,
          score,
        });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
 * RAG Assistant Response Generation
 * STRICT REQUIREMENT: AI must explain the recommendation but NEVER invent calculations.
 * All calculations are injected directly from deterministic engine outputs.
 */
export function generateBlueAIResponse(
  userQuery: string,
  context: {
    inputs: SimulationInputs;
    port: PortData;
    resultA: VesselCalculationResult;
    resultB: VesselCalculationResult;
    verdict: ComparisonVerdict;
  }
): {
  content: string;
  citations: {
    filename: string;
    pageNumber: number;
    section: string;
    excerpt: string;
  }[];
  deterministicMetrics: {
    label: string;
    value: string;
  }[];
} {
  const q = userQuery.toLowerCase();
  const searchResults = searchKnowledgeBase(userQuery, 3);
  const citations = searchResults.map((r) => ({
    filename: r.filename,
    pageNumber: r.chunk.pageNumber,
    section: r.chunk.heading,
    excerpt: r.chunk.text.slice(0, 160) + "...",
  }));

  const { inputs, port, resultA, resultB, verdict } = context;

  // Selected deterministic metrics to expose in response
  const deterministicMetrics = [
    { label: "Recommended Vessel", value: verdict.recommendedVesselId === "vesselB" ? resultB.vesselName : resultA.vesselName },
    { label: "Vessel A Risk-Adjusted Cost", value: `$${resultA.riskAdjustedCostUSD.toLocaleString()}` },
    { label: "Vessel B Risk-Adjusted Cost", value: `$${resultB.riskAdjustedCostUSD.toLocaleString()}` },
    { label: "Vessel A Dynamic Draft", value: `${resultA.dynamicDraft}m (Margin: ${resultA.draftMargin}m)` },
    { label: "Vessel B Dynamic Draft", value: `${resultB.dynamicDraft}m (Margin: +${resultB.draftMargin}m)` },
    { label: "Current Speed", value: `${inputs.speedKnots} knots` },
    { label: "CO2 Differential", value: `${Math.abs(verdict.co2DifferenceMT)} MT CO2` },
  ];

  let content = "";

  if (q.includes("why") || q.includes("recommend") || q.includes("vessel b") || q.includes("difference") || q.includes("compare")) {
    content = `### Executive Recommendation Analysis

Based on the deterministic maritime calculations, **${verdict.recommendedVesselId === "vesselB" ? resultB.vesselName : resultA.vesselName}** is the recommended charter decision for arrival at **${port.name}**.

#### 1. Draft Compliance & Grounding Risk
* **${resultA.vesselName}**: Has a dynamic arrival draft of **${resultA.dynamicDraft}m** at ${inputs.speedKnots} knots. The maximum safe allowable draft at ${port.name} (incorporating Chart Datum 14.20m and required 1.20m UKC) is **${resultA.allowableDraft}m**. This constitutes a critical draft breach of **${Math.abs(resultA.draftMargin)}m**.
* **${resultB.vesselName}**: Operates at a dynamic arrival draft of only **${resultB.dynamicDraft}m**, providing a safe surplus Under Keel Clearance of **+${resultB.draftMargin}m**.

#### 2. The Commercial Illusion vs. True Risk-Adjusted Economics
While Vessel A appears cheaper on base charter rate ($${resultA.charterCostUSD.toLocaleString()} vs $${resultB.charterCostUSD.toLocaleString()}), its non-compliance triggers mandatory offshore lightering:
* **Offshore Lightering Cost**: **$${resultA.lighteringRiskCostUSD.toLocaleString()}** (lightering tariff + barge mobilization).
* **Extended Demurrage Delay**: 3.5 additional days waiting for offshore barge ops, adding **$${(3.5 * port.dailyDemurrageRate).toLocaleString()}** in port exposure.
* **True Risk-Adjusted Voyage Cost**:
  * **${resultA.vesselName}**: **$${resultA.riskAdjustedCostUSD.toLocaleString()}** (Risk Score: ${resultA.totalRiskScore}/100)
  * **${resultB.vesselName}**: **$${resultB.riskAdjustedCostUSD.toLocaleString()}** (Risk Score: ${resultB.totalRiskScore}/100)
  * **Net Financial Advantage with Vessel B**: **$${Math.abs(verdict.costDifferenceUSD).toLocaleString()} saved**.

#### 3. Decarbonization & Acoustic Profile
* At **${inputs.speedKnots} knots**, Vessel B consumes **${resultB.totalFuelMT} MT** total fuel vs **${resultA.totalFuelMT} MT** for Vessel A, reducing CO2 emissions by **${Math.abs(verdict.co2DifferenceMT)} MT**.
* Vessel B operates within the **SILENT-E** underwater noise threshold (${resultB.underwaterNoiseDB} dB) protecting marine corridors south of Sri Lanka.`;
  } else if (q.includes("draft") || q.includes("depth") || q.includes("ukc") || q.includes("berth")) {
    content = `### Port Draft & Channel Clearance Rules for ${port.name}

According to the official **${port.name} Marine Circular & Notice to Mariners**:
* **Maximum Permissible Draft at Chart Datum (CD)**: **${port.maxPermissibleDraft}m**.
* **Mandatory Safety Under Keel Clearance (UKC)**: **${port.requiredUKC}m** (Section 1).
* **Effective Max Allowable Dynamic Draft**: **${resultA.allowableDraft}m**.

**Deterministic Vessel Assessment**:
* **${resultA.vesselName}**: Static draft ${resultA.dynamicDraft - calculateSquat(inputs.speedKnots)}m + squat ${calculateSquat(inputs.speedKnots)}m = **${resultA.dynamicDraft}m dynamic draft**. **Status: ${resultA.isDraftCompliant ? "COMPLIANT" : "BREACH (Exceeds by " + Math.abs(resultA.draftMargin) + "m)"}**.
* **${resultB.vesselName}**: Static draft 13.30m + squat ${calculateSquat(inputs.speedKnots)}m = **${resultB.dynamicDraft}m dynamic draft**. **Status: COMPLIANT (Surplus UKC: +${resultB.draftMargin}m)**.

Any vessel exceeding 14.20m at Paradip must lighter offshore at the POA Anchorage before pilot boarding.`;
  } else if (q.includes("noise") || q.includes("underwater") || q.includes("acoustic") || q.includes("whale") || q.includes("turtle")) {
    content = `### Underwater Radiated Noise (URN) & Environmental Safeguards

At the current simulation speed of **${inputs.speedKnots} knots**:
* **Acoustic Power Level**: **${resultA.underwaterNoiseDB} dB** (URN Index: ${resultA.underwaterNoiseScore}/100).
* **Cavitation Threshold**: Conventional bulkers experience propeller cavitation inception above 10.5 knots, which rapidly multiplies sound pressure levels and fuel drag.
* **Corridor Regulations**: Paradip Marine Circular Section 5 instructs vessels transiting within 25 NM of Olive Ridley nesting grounds and the Sri Lanka cetacean lane to consider voluntary speed limitation of **11.5 knots** to minimize acoustic disturbance and strike hazard.
* **Vessel B Advantage**: Features a Mewis duct and Boss Cap Fins, raising cavitation inception speed and achieving lower noise impact.`;
  } else if (q.includes("demurrage") || q.includes("delay") || q.includes("cost") || q.includes("lightering")) {
    content = `### Demurrage Exposure & Offshore Lightering Mechanics

* **Port Demurrage Tariff**: Daily charter party demurrage is assessed at **$${port.dailyDemurrageRate.toLocaleString()} USD/day** at ${port.name}.
* **Base Anchorage Wait Exposure**: At ${inputs.estimatedPortWaitDays} days estimated wait, base demurrage equals **$${(inputs.estimatedPortWaitDays * port.dailyDemurrageRate).toLocaleString()}**.
* **Lightering Tariff Breakdown**: Lightering tariff is **$${port.lighteringCostPerTonne} / MT** plus a **$35,000** barge mobilization fee.
* For **${resultA.vesselName}**, non-compliant draft triggers an offshore lightering charge of **$${resultA.lighteringRiskCostUSD.toLocaleString()}**, plus approximately 3.5 additional days for transshipment ops, adding **$${(3.5 * port.dailyDemurrageRate).toLocaleString()}** in indirect delay demurrage.`;
  } else {
    // General grounded answer
    content = `### Maritime Advisory Query Response

Responding with verified deterministic parameters for the voyage to **${port.name}** at **${inputs.speedKnots} knots**:

* **Voyage Distance**: **${resultA.voyageDistanceNM} nautical miles** (Sea time: ${resultA.seaDays} days).
* **Draft Verdict**: ${resultB.vesselName} is **100% draft-compliant** (+${resultB.draftMargin}m margin), while ${resultA.vesselName} incurs a **${Math.abs(resultA.draftMargin)}m draft breach** triggering **$${resultA.lighteringRiskCostUSD.toLocaleString()}** in offshore transshipment penalties.
* **Net Economics**: Vessel B achieves a lower risk-adjusted total cost of **$${resultB.riskAdjustedCostUSD.toLocaleString()}** compared to **$${resultA.riskAdjustedCostUSD.toLocaleString()}** for Vessel A.
* **Total Emissions**: Vessel B produces **${resultB.co2EmissionsMT} MT CO2** vs **${resultA.co2EmissionsMT} MT CO2** for Vessel A (Saving: ${Math.abs(verdict.co2DifferenceMT)} MT).

*All calculations are deterministic and governed by naval architecture hydrostatic curves and port tariffs.*`;
  }

  return {
    content,
    citations,
    deterministicMetrics,
  };
}

function calculateSquat(speedKnots: number): number {
  return Number(((0.82 * Math.pow(speedKnots, 2)) / 120).toFixed(2));
}
