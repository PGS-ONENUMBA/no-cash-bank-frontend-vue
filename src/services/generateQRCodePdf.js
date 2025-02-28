import { jsPDF } from "jspdf";

export default function downloadQrCode(user) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Define spacing values
  const marginTop = 20;
  const lineSpacing = 10;

  // Add Business Logo (Centered)
  const logoSize = 40; // Increased for visibility
  const logoX = (pageWidth - logoSize) / 2;
  const logoY = marginTop; // Start at marginTop
  doc.addImage("/spar_logo.png", "PNG", logoX, logoY, logoSize, logoSize);

  // Add Horizontal Line (Positioned Below Logo)
  const lineY = logoY + logoSize + lineSpacing; // Space below logo
  doc.setDrawColor(0);
  doc.setLineWidth(0.1);
  doc.line(10, lineY, pageWidth - 10, lineY);

  // Add "Scan to Pay" Text (Below Line)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  const scanToPayText = "Scan To Pay";
  const scanTextWidth = doc.getTextWidth(scanToPayText);
  const scanTextY = lineY + lineSpacing + 10; // More space after line
  doc.text(scanToPayText, (pageWidth - scanTextWidth) / 2, scanTextY);

  // Load and Add QR Code Image (Centered)
  const qrSize = 100; // Large QR code
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = scanTextY + 20; // Space after "Scan to Pay"

  const img = new Image();
  img.src = user.vendor_details.qr_code;
  img.onload = () => {
    doc.addImage(img, "PNG", qrX, qrY, qrSize, qrSize);

    // Add "Thank You" Text (Below QR Code)
    doc.setFontSize(40);
    const thankYouText = "Thank you!";
    const thankYouWidth = doc.getTextWidth(thankYouText);
    const thankYouY = qrY + qrSize + 20; // More space below QR code
    doc.text(thankYouText, (pageWidth - thankYouWidth) / 2, thankYouY);

    // Save the PDF with the business name
    doc.save(`${user.vendor_details.business_name}_ScanToPay.pdf`);
  };
}
