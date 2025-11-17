// src/services/generateQRCodePdf.js

// Frontend only QR and PDF generation
// Install dependencies first:
//   npm install qrcode jspdf

import QRCode from "qrcode";
import { jsPDF } from "jspdf";

/**
 * Generate a QR code from the given value and download as PDF.
 *
 * @param {Object} params
 * @param {string} params.qrValue - The URL or text to encode in the QR code.
 * @param {string} [params.vendorName] - Vendor name to show in the PDF title and filename.
 */
export default async function downloadQrCode({ qrValue, vendorName }) {
  if (!qrValue) {
    throw new Error("qrValue is required for QR generation");
  }

  // Generate QR as a data URL (PNG)
  const qrDataUrl = await QRCode.toDataURL(qrValue, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
  });

  // Create a new A4 PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Title text at top
  const titleText = vendorName
    ? `${vendorName} Scan2Pay QR`
    : "Scan2Pay QR Code";

  doc.setFontSize(16);
  doc.text(titleText, pageWidth / 2, 40, { align: "center" });

  // Centered QR image
  const qrSize = 250;
  const x = (pageWidth - qrSize) / 2;
  const y = 80;

  doc.addImage(qrDataUrl, "PNG", x, y, qrSize, qrSize);

  // Show the encoded URL/text below the QR
  doc.setFontSize(10);
  doc.text(qrValue, pageWidth / 2, y + qrSize + 30, {
    align: "center",
    maxWidth: pageWidth - 80,
  });

  // Build a safe filename from vendor name
  const safeVendorName =
    vendorName?.toLowerCase().replace(/[^a-z0-9]+/gi, "_") || "vendor";

  doc.save(`${safeVendorName}_scan2pay_qr.pdf`);
}
