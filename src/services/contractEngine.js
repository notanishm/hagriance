import { contractTemplates } from '../data/contractTemplates';

/**
 * Replaces placeholders in the format {{variableName}} with actual data
 */
const interpolate = (text, variables) => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] !== undefined ? variables[key] : match;
    });
};

/**
 * Generates a full contract document based on deal data and language
 */
export const generateContractLocally = (dealData, lang = 'en', selectedClauses = []) => {
    const template = contractTemplates[lang] || contractTemplates.en;

    // Prepare variables for interpolation
    const totalValue = dealData.quantity * dealData.price;
    const advanceAmount = totalValue * 0.25;
    const balanceAmount = totalValue - advanceAmount;

    const variables = {
        contractId: `FC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        contractDate: new Date().toLocaleDateString(lang === 'en' ? 'en-IN' : lang === 'hi' ? 'hi-IN' : 'mr-IN'),
        farmerName: dealData.farmerName,
        farmerId: dealData.farmerId || '4201',
        businessName: dealData.businessName,
        businessGst: dealData.businessGst,
        cropName: dealData.cropName,
        quantity: dealData.quantity,
        unit: dealData.unit,
        price: dealData.price.toLocaleString('en-IN'),
        totalValue: totalValue.toLocaleString('en-IN'),
        advanceAmount: advanceAmount.toLocaleString('en-IN'),
        balanceAmount: balanceAmount.toLocaleString('en-IN'),
        deliveryDate: dealData.deliveryDate
    };

    // Combine sections into a single markdown string
    let fullText = `# ${template.title}\n\n`;

    const mandatorySections = ['header', 'parties', 'terms', 'delivery', 'payment', 'dispute', 'footer'];

    Object.keys(template.sections).forEach(sectionKey => {
        // Only include if it's mandatory OR selected by the user
        if (mandatorySections.includes(sectionKey) || selectedClauses.includes(sectionKey)) {
            const interpolatedSection = interpolate(template.sections[sectionKey], variables);
            fullText += `${interpolatedSection}\n\n`;
        }
    });

    return fullText;
};
