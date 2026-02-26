/**
 * Bank Loan Management System (LMS) Service Layer
 * This service mimics how banks evaluate loan requests based on verified platform data.
 */

export const LOAN_DECISION = {
    APPROVED: 'APPROVED',
    PENDING: 'PENDING',
    REJECTED: 'REJECTED'
};

export const BankLMSService = {
    /**
     * Calculates a rule-based risk score (0-100)
     * Factors: Land area, Crop type value, Contract value, Duration, KYC status
     */
    calculateRiskScore: (applicationData) => {
        let score = 0;
        const { landArea, cropValue, contractValue, duration, kycVerified } = applicationData;

        // 1. KYC status (Highest priority)
        if (kycVerified) score += 25;

        // 2. Land Area (0-20 points)
        // Assume 10+ acres is max points
        score += Math.min((landArea / 10) * 20, 20);

        // 3. Crop Value/Type (0-15 points)
        // High value crops like Cotton, Sugarcane get more points
        score += Math.min(cropValue * 15, 15);

        // 4. Contract Value (0-25 points)
        // Higher value contracts show higher stake/collateral
        // Assume 5L+ is max points
        score += Math.min((contractValue / 500000) * 25, 25);

        // 5. Platform Duration/Loyalty (0-15 points)
        // Longer duration = more reliable history
        score += Math.min((duration / 12) * 15, 15);

        return Math.round(score);
    },

    /**
     * Generates a unique loan application payload
     */
    createLoanPayload: (farmerData, contractData, amount, tenure) => {
        return {
            applicationId: `APL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: new Date().toISOString(),
            borrower: {
                id: farmerData.id,
                name: farmerData.name,
                kycStatus: farmerData.kycStatus
            },
            collateral: {
                contractId: contractData.id,
                value: contractData.totalValue,
                crop: contractData.cropName
            },
            request: {
                amount,
                tenure,
                currency: 'INR'
            }
        };
    },

    /**
     * Mocks a bank decision based on the risk score
     */
    submitLoanApplication: async (payload, riskScore) => {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Always approve for demo purposes
        const decision = LOAN_DECISION.APPROVED;
        const terms = {
            interestRate: '8.5%',
            processingFee: '0.5%',
            disbursalTime: '24-48 Hours'
        };

        return {
            applicationId: payload.applicationId,
            decision,
            riskScore,
            financialTerms: terms,
            bankReference: `BNK-REF-${Math.floor(Math.random() * 900000) + 100000}`
        };
    }
};
