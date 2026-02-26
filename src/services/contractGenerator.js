const CONTRACT_API_URL = 'https://your-render-app-name.onrender.com';

export const generateContractPDF = async (contractData) => {
  try {
    const response = await fetch(`${CONTRACT_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contractData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate contract');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Contract_${contractData.contract_number || Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (error) {
    console.error('Contract generation error:', error);
    throw error;
  }
};

export const contractDataFromForm = (formData) => {
  return {
    contract_number: formData.contract_number || `CRT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    contract_date: formData.contract_date || new Date().toISOString().split('T')[0],
    crop_name: formData.cropName,
    quantity: parseInt(formData.quantity),
    price: parseInt(formData.price),
    delivery_date: formData.deliveryDate,
    farmer_name: formData.farmerName,
    farmer_location: formData.farmerLocation,
    farmer_phone: formData.farmerPhone,
    farmer_land_size: formData.farmerLandSize,
    business_name: formData.businessName,
    business_contact: formData.businessContact,
    business_gst: formData.businessGst,
    farming_methods: formData.farmingMethods || [],
    equipment: formData.equipment || 'None',
    advance_percent: formData.advancePercent || '30',
    delivery_percent: formData.deliveryPercent || '50',
    quality_percent: formData.qualityPercent || '20',
    payment_mode: formData.paymentMode || 'Bank Transfer',
  };
};
