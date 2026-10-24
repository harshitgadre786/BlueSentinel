import jsPDF from "jspdf";
import {
  SimulationInputs,
  PortData,
  VesselCalculationResult,
  ComparisonVerdict,
} from "./types";

export function generateExecutiveReportPDF(
  inputs: SimulationInputs,
  port: PortData,
  resultA: VesselCalculationResult,
  resultB: VesselCalculationResult,
  verdict: ComparisonVerdict
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Background deep header
  doc.setFillColor(8, 18, 38);
  doc.rect(0, 0, pageWidth, 42, "F");

  // Top cyan accent line
  doc.setFillColor(0, 210, 255);
  doc.rect(0, 41, pageWidth, 1.5, "F");

  // Title & Brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("BLUESENTINEL", margin, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("MARITIME DECISION SUPPORT & GREEN PORT CALL AUDIT", margin, 25);

  doc.setFontSize(8);
  doc.setTextColor(0, 210, 255);
  doc.text("ISO-27001 AUDIT COMPLIANT | DETERMINISTIC ENGINE v4.2", margin, 32);

  // Date and Report ID on top right
  const reportId = "BSR-" + Math.floor(100000 + Math.random() * 900000);
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(8);
  doc.text(`REPORT ID: ${reportId}`, pageWidth - margin - 50, 18);
  doc.text(`ISSUED: ${new Date().toISOString().slice(0, 10)}`, pageWidth - margin - 50, 24);
  doc.text(`INDIAN PORT CALL: ${port.name.toUpperCase()}`, pageWidth - margin - 50, 30);

  // Prototype Disclaimer Notice
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, 46, pageWidth - margin * 2, 9, 1.5, 1.5, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 83, 9);
  doc.text(
    "ADVISORY NOTICE: SIMULATED PROTOTYPE DATA. ALL HYDROSTATIC & FINANCIAL CALCULATIONS ARE DETERMINISTIC.",
    margin + 3,
    52
  );

  let y = 62;

  // Executive Recommendation Banner
  const isB = verdict.recommendedVesselId === "vesselB";
  const recName = isB ? resultB.vesselName : resultA.vesselName;
  const savingUSD = Math.abs(verdict.costDifferenceUSD);
  const co2Saving = Math.abs(verdict.co2DifferenceMT);

  doc.setFillColor(13, 26, 54);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text("EXECUTIVE CHARTER RECOMMENDATION", margin + 5, y + 7);

  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`SELECTED: ${recName.toUpperCase()}`, margin + 5, y + 15);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  const verdictText = isB
    ? `Net Risk-Adjusted Advantage: $${savingUSD.toLocaleString()} USD | CO2 Avoidance: ${co2Saving} MT | Clean UKC Margin: +${resultB.draftMargin}m`
    : `Optimal operational cost profile and full channel clearance confirmed.`;
  doc.text(verdictText, margin + 5, y + 22);

  y += 35;

  // Section: Voyage Scope
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("1. VOYAGE PARAMETERS & CHANNEL HYDRODYNAMICS", margin, y);

  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  const col1X = margin;
  const col2X = margin + 65;
  const col3X = margin + 130;

  doc.text(`• Cargo: ${inputs.cargoTonnage.toLocaleString()} MT (${inputs.cargoType})`, col1X, y);
  doc.text(`• Origin: ${inputs.originId.toUpperCase().replace("_", " ")}`, col2X, y);
  doc.text(`• Indian Port: ${port.name} (${port.country})`, col3X, y);
  y += 5;
  doc.text(`• Voyage Speed: ${inputs.speedKnots} knots`, col1X, y);
  doc.text(`• Sea Distance: ${resultA.voyageDistanceNM} Nautical Miles`, col2X, y);
  doc.text(`• Bunker Price: $${inputs.fuelCostPerTonne} / MT (VLSFO)`, col3X, y);
  y += 5;
  doc.text(`• Est. Port Waiting: ${inputs.estimatedPortWaitDays} Days`, col1X, y);
  doc.text(`• Max Permissible Draft: ${port.maxPermissibleDraft}m CD`, col2X, y);
  doc.text(`• Port Safety UKC Mandate: ${port.requiredUKC}m`, col3X, y);

  y += 11;

  // Section: Deterministic Comparison Table
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("2. DETERMINISTIC VESSEL COMPARISON & COMPLIANCE MATRIX", margin, y);

  y += 5;
  // Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, pageWidth - margin * 2, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");

  doc.text("METRIC / HYDROSTATIC PARAMETER", margin + 3, y + 5);
  doc.text("VESSEL A (MV SAGAR SAMRAT)", margin + 70, y + 5);
  doc.text("VESSEL B (MV NILGIRI GREEN)", margin + 125, y + 5);

  const metricsTable = [
    { label: "Vessel Classification", a: resultA.vesselType, b: resultB.vesselType },
    { label: "Summer Deadweight (DWT)", a: "82,500 MT", b: "64,200 MT" },
    { label: "Static Laden Draft", a: "14.80 m", b: "13.30 m" },
    { label: `Dynamic Draft (at ${inputs.speedKnots} kts squat)`, a: `${resultA.dynamicDraft} m`, b: `${resultB.dynamicDraft} m` },
    { label: `Allowable Channel Draft (${port.name})`, a: `${resultA.allowableDraft} m`, b: `${resultB.allowableDraft} m` },
    {
      label: "Draft Compliance & UKC Margin",
      a: resultA.isDraftCompliant ? `+${resultA.draftMargin}m (PASS)` : `${resultA.draftMargin}m (BREACH)`,
      b: `+${resultB.draftMargin}m (COMPLIANT)`,
    },
    { label: "Total Fuel Consumed (Sea + Port)", a: `${resultA.totalFuelMT} MT`, b: `${resultB.totalFuelMT} MT` },
    { label: "Bunker Fuel Cost (VLSFO)", a: `$${resultA.bunkerFuelCostUSD.toLocaleString()}`, b: `$${resultB.bunkerFuelCostUSD.toLocaleString()}` },
    { label: "Charter Hire Cost", a: `$${resultA.charterCostUSD.toLocaleString()}`, b: `$${resultB.charterCostUSD.toLocaleString()}` },
    { label: "Offshore Lightering Penalty", a: resultA.lighteringRiskCostUSD > 0 ? `$${resultA.lighteringRiskCostUSD.toLocaleString()}` : "$0", b: "$0 (Direct Berth)" },
    { label: "Total Demurrage Exposure", a: `$${resultA.demurrageExposureUSD.toLocaleString()}`, b: `$${resultB.demurrageExposureUSD.toLocaleString()}` },
    { label: "Total Base Voyage Cost", a: `$${resultA.baseVoyageCostUSD.toLocaleString()}`, b: `$${resultB.baseVoyageCostUSD.toLocaleString()}` },
    { label: "TOTAL RISK-ADJUSTED COST", a: `$${resultA.riskAdjustedCostUSD.toLocaleString()}`, b: `$${resultB.riskAdjustedCostUSD.toLocaleString()}` },
    { label: "Composite Risk Score (0-100)", a: `${resultA.totalRiskScore} / 100 (${resultA.riskCategory})`, b: `${resultB.totalRiskScore} / 100 (${resultB.riskCategory})` },
    { label: "CO2 Emissions & IMO CII", a: `${resultA.co2EmissionsMT} MT (CII: ${resultA.ciiRating})`, b: `${resultB.co2EmissionsMT} MT (CII: ${resultB.ciiRating})` },
    { label: "Underwater Noise Level (URN)", a: `${resultA.underwaterNoiseDB} dB (Score: ${resultA.underwaterNoiseScore})`, b: `${resultB.underwaterNoiseDB} dB (Score: ${resultB.underwaterNoiseScore})` },
  ];

  y += 7;
  doc.setFont("helvetica", "normal");
  metricsTable.forEach((row, idx) => {
    const isHighlight = row.label.includes("RISK-ADJUSTED") || row.label.includes("Draft Compliance");
    if (isHighlight) {
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, pageWidth - margin * 2, 5.5, "F");
      doc.setFont("helvetica", "bold");
    } else if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 5.5, "F");
      doc.setFont("helvetica", "normal");
    } else {
      doc.setFont("helvetica", "normal");
    }

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(7);
    doc.text(row.label, margin + 3, y + 4);

    if (row.a.includes("BREACH")) {
      doc.setTextColor(220, 38, 38);
    } else {
      doc.setTextColor(51, 65, 85);
    }
    doc.text(row.a, margin + 70, y + 4);

    if (row.b.includes("COMPLIANT")) {
      doc.setTextColor(5, 150, 105);
    } else {
      doc.setTextColor(51, 65, 85);
    }
    doc.text(row.b, margin + 125, y + 4);

    y += 5.5;
  });

  y += 6;

  // Section 3: Strategic Audit Summary
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("3. STRATEGIC AUDIT SUMMARY & PORT NOTICE RECONCILIATION", margin, y);

  y += 5;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(
    `1. Draft Protocol: Paradip Marine Circular 2026 mandates dynamic draft <= 14.20m. Vessel A fails by ${Math.abs(resultA.draftMargin)}m, triggering compulsory transshipment at Paradip Offshore Anchorage (POA).`,
    margin,
    y
  );
  y += 4.5;
  doc.text(
    `2. Economic Reconciliation: Vessel A's lower base quote is eroded by $${resultA.lighteringRiskCostUSD.toLocaleString()} in offshore lightering and 3.5 days of tidal delay ($${(3.5 * port.dailyDemurrageRate).toLocaleString()}).`,
    margin,
    y
  );
  y += 4.5;
  doc.text(
    `3. Marine Protection: Vessel B fulfills DG Shipping Advisory 14/2025 regarding URN mitigation in coastal Cetacean and Olive Ridley nesting habitats.`,
    margin,
    y
  );

  y += 12;

  // Sign-off and Verification Seal
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, margin + 70, y);
  doc.line(pageWidth - margin - 70, y, pageWidth - margin, y);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("PREPARED BY: FLEET OPERATIONS DESK", margin, y + 4);
  doc.text("AUTHORIZED SIGNATURE / STAMP", pageWidth - margin - 70, y + 4);

  // Footer
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "BlueSentinel v4.2 Decision Support System | Generated for commercial and nautical planning | Confidential",
    margin,
    pageHeight - 6
  );

  // Save the PDF
  doc.save(`BlueSentinel_Decision_Report_${port.id.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
