import jsPDF from 'jspdf';

/**
 * Ported from Python generate_contract()
 * Generates a structured Agricultural Purchase Contract PDF using jsPDF
 */
export const generateContractPDF = async (data) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);

    // Header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('AGRICULTURAL PRODUCE PURCHASE CONTRACT', pageWidth / 2, 15, { align: 'center' });

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Contract No: ${data.contract_number}`, margin, 25);
    pdf.text(`Date: ${data.contract_date}`, pageWidth - margin, 25, { align: 'right' });

    // Parties
    let y = 35;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PARTIES TO THIS CONTRACT:', margin, y);
    y += 7;

    pdf.setFontSize(9);
    pdf.text('A. PRODUCER (Farmer):', margin + 5, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${data.farmer_name}`, margin + 45, y);
    y += 5;
    pdf.text(`${data.farmer_location}`, margin + 45, y);
    y += 5;
    pdf.text(`Phone: ${data.farmer_phone || 'N/A'}  |  Land: ${data.farmer_land_size || 'N/A'} Hectares`, margin + 45, y);
    y += 8;

    pdf.setFont('helvetica', 'bold');
    pdf.text('B. BUYER (Company):', margin + 5, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${data.business_name}`, margin + 45, y);
    y += 5;
    pdf.text(`Contact: ${data.business_contact || 'N/A'}  |  GST: ${data.business_gst || 'N/A'}`, margin + 45, y);
    y += 10;

    // Contract Terms Table
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('CONTRACT TERMS:', margin, y);
    y += 6;

    // Table Header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, y, 60, 6, 'F');
    pdf.rect(margin + 60, y, contentWidth - 60, 6, 'F');
    pdf.setFontSize(8);
    pdf.text('Description', margin + 30, y + 4, { align: 'center' });
    pdf.text('Details', margin + 60 + (contentWidth - 60) / 2, y + 4, { align: 'center' });
    y += 6;

    const rows = [
      ['Crop Name', String(data.crop_name)],
      ['Quantity', `${data.quantity} Quintals`],
      ['Price per Quintal', `Rs. ${data.price}`],
      ['Total Contract Value', `Rs. ${(parseInt(data.quantity) * parseInt(data.price)).toLocaleString('en-IN')}`],
      ['Delivery Date', String(data.delivery_date)],
      ['Farming Methods', Array.isArray(data.farming_methods) ? data.farming_methods.join(', ') : data.farming_methods],
      ['Equipment Provided', String(data.equipment || 'None').substring(0, 80)]
    ];

    pdf.setFont('helvetica', 'normal');
    rows.forEach(row => {
      pdf.rect(margin, y, 60, 6);
      pdf.rect(margin + 60, y, contentWidth - 60, 6);
      pdf.text(row[0], margin + 2, y + 4);
      pdf.text(row[1], margin + 62, y + 4);
      y += 6;
    });

    y += 10;

    // Payment Structure
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('PAYMENT STRUCTURE:', margin, y);
    y += 6;

    const colWidth = contentWidth / 4;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const payments = [
      `Advance: ${data.advance_percent}%`,
      `On Delivery: ${data.delivery_percent}%`,
      `Quality Check: ${data.quality_percent}%`,
      `Mode: ${data.payment_mode || 'Bank Transfer'}`
    ];

    payments.forEach((text, i) => {
      pdf.rect(margin + (i * colWidth), y, colWidth, 6);
      pdf.text(text, margin + (i * colWidth) + (colWidth / 2), y + 4, { align: 'center' });
    });
    y += 12;

    // Obligations
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('Producer Obligations:', margin, y);
    pdf.text('Buyer Obligations:', margin + contentWidth / 2, y);
    y += 5;

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    const obs = [
      ['- Cultivate as per agreed farming methods', '- Provide equipment/inputs in time'],
      ['- Maintain cultivation records', '- Make payments as per schedule'],
      ['- Deliver produce on agreed date', '- Accept quality produce'],
      ['- Ensure quality standards are met', '- Honor contract in good faith']
    ];

    obs.forEach(pair => {
      pdf.text(pair[0], margin, y);
      pdf.text(pair[1], margin + contentWidth / 2, y);
      y += 4;
    });
    y += 6;

    // Clauses
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(7);
    pdf.text('Force Majeure: Neither party shall be liable for delays due to circumstances beyond their control including natural disasters, war, epidemics.', margin, y);
    y += 4;
    pdf.text('Dispute Resolution: Any dispute shall be resolved through mutual discussion within 30 days. Failing which, arbitration under Indian laws.', margin, y);
    y += 10;

    // Signatures
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRODUCER (Party A):', margin, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`Name: ${data.farmer_name}`, margin, y);
    y += 5;
    pdf.text(`Location: ${data.farmer_location}`, margin, y);
    y += 12;

    pdf.line(margin, y, margin + 80, y);
    pdf.text('Signature', margin, y + 5);
    pdf.text('Date: ____________', margin + 80, y + 5, { align: 'right' });
    y += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BUYER (Party B):', margin, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`Company: ${data.business_name}`, margin, y);
    y += 5;
    pdf.text(`Contact Person: ${data.business_contact || 'N/A'}`, margin, y);
    y += 12;

    pdf.line(margin, y, margin + 80, y);
    pdf.text('Signature', margin, y + 5);
    pdf.text('Date: ____________', margin + 80, y + 5, { align: 'right' });
    y += 15;

    pdf.setFontSize(8);
    pdf.text('Witness 1: _________________________', margin, y);
    pdf.text('Witness 2: _________________________', margin + contentWidth / 2, y);
    y += 10;

    // Footer
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(6);
    pdf.setTextColor(128, 128, 128);
    const dateStr = new Date().toLocaleString();
    pdf.text(`Generated on ${dateStr} | Agriance - Agricultural Contract Platform`, pageWidth / 2, y, { align: 'center' });

    // Save the PDF
    const filename = `Contract_${data.contract_number || Date.now()}.pdf`;
    pdf.save(filename);

    return { success: true, filename };
  } catch (error) {
    console.error('Contract generation error:', error);
    throw error;
  }
};

/**
 * Maps UI form data to the data structure expected by the PDF generator
 */
export const contractDataFromForm = (formData) => {
  return {
    contract_number: formData.contract_number || `CRT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
    contract_date: formData.contract_date || new Date().toISOString().split('T')[0],
    crop_name: formData.cropName,
    quantity: formData.quantity,
    price: formData.price,
    delivery_date: formData.deliveryDate,
    farmer_name: formData.farmerName,
    farmer_location: formData.farmerLocation,
    farmer_phone: formData.farmerPhone,
    farmer_land_size: formData.farmerLandSize,
    business_name: formData.businessName,
    business_contact: formData.businessContact,
    business_gst: formData.businessGst,
    farming_methods: formData.farmingMethods || [],
    equipment: formData.equipment || 'No additional equipment provided.',
    advance_percent: formData.advancePercent || '30',
    delivery_percent: formData.deliveryPercent || '50',
    quality_percent: formData.qualityPercent || '20',
    payment_mode: formData.paymentMode || 'Bank Transfer',
  };
};
