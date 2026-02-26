export const LOAN_STATUS = {
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    DISBURSED: 'disbursed',
    REPAID: 'repaid'
};

export const RISK_FACTORS = {
    KYC_VERIFIED: { weight: 20, label: 'KYC Verification', id: 'kyc' },
    ACTIVE_CONTRACTS: { weight: 25, label: 'Active Contracts', id: 'contracts' },
    CONTRACT_HISTORY: { weight: 20, label: 'Contract Success Rate', id: 'history' },
    LAND_OWNERSHIP: { weight: 15, label: 'Land Ownership Verified', id: 'land' },
    CROP_DIVERSITY: { weight: 10, label: 'Crop Portfolio Diversity', id: 'diversity' },
    PLATFORM_TENURE: { weight: 10, label: 'Platform Tenure', id: 'tenure' }
};

export const sampleLoans = [
    {
        id: 'LN-2025-001',
        applicantName: 'Ramesh Patil',
        applicantType: 'farmer',
        amount: 150000,
        purpose: 'Modern Irrigation System',
        status: LOAN_STATUS.UNDER_REVIEW,
        appliedDate: '2025-01-20',
        riskScore: 78,
        riskBreakdown: {
            kyc: 20,
            contracts: 25,
            history: 18,
            land: 15,
            diversity: 5,
            tenure: 5
        }
    },
    {
        id: 'LN-2025-002',
        applicantName: 'Arjun More',
        applicantType: 'farmer',
        amount: 75000,
        purpose: 'Organic Seed Procurement',
        status: LOAN_STATUS.PENDING,
        appliedDate: '2025-01-25',
        riskScore: 92,
        riskBreakdown: {
            kyc: 20,
            contracts: 25,
            history: 20,
            land: 15,
            diversity: 7,
            tenure: 5
        }
    },
    {
        id: 'LN-2025-003',
        applicantName: 'AgriCorp Ltd.',
        applicantType: 'business',
        amount: 500000,
        purpose: 'Working Capital for Harvest Season',
        status: LOAN_STATUS.APPROVED,
        appliedDate: '2025-01-15',
        riskScore: 65,
        riskBreakdown: {
            kyc: 20,
            contracts: 15,
            history: 12,
            land: 5,
            diversity: 8,
            tenure: 5
        }
    }
];

export const partnerBanks = [
    { id: 1, name: 'State Agri Bank', rating: 4.9, minInterest: '7.5%', maxTenure: '5 Years', icon: '🏦' },
    { id: 2, name: 'Rural Credit Corp', rating: 4.7, minInterest: '8.2%', maxTenure: '3 Years', icon: '🏢' },
    { id: 3, name: 'Farmer First Bank', rating: 4.8, minInterest: '7.8%', maxTenure: '4 Years', icon: '🏛️' }
];
