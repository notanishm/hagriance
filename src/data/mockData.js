/**
 * Mock data for development mode bypass
 * Includes comprehensive datasets for Farmers, Businesses, Banks, Contracts, and Loans.
 */

export const mockUsers = {
    farmer: {
        id: 'dev-farmer-id',
        email: 'farmer@agriance.com',
        full_name: 'Ramesh Patil',
        role: 'farmer',
        onboarding_completed: true,
        trust_score: 92,
        kyc_status: 'verified',
        location: 'Sangli, Maharashtra',
        land_size: 8.5,
        phone_number: '+91 98765 43210',
        crops_history: ['Wheat', 'Soybean', 'Grapes']
    },
    business: {
        id: 'dev-business-id',
        email: 'corp@agricorp.com',
        full_name: 'AgriCorp India Ltd',
        business_name: 'AgriCorp India Ltd',
        role: 'business',
        onboarding_completed: true,
        trust_score: 88,
        kyc_status: 'verified',
        business_gst: '27AAAAA0000A1Z5',
        location: 'Pune, Maharashtra'
    },
    bank: {
        id: 'dev-bank-id',
        email: 'banker@agribank.com',
        full_name: 'State Agri Bank Manager',
        bank_name: 'State Agri Bank',
        role: 'bank',
        onboarding_completed: true,
        kyc_status: 'verified'
    }
};

export const mockFarmers = [
    {
        id: 'farmer-1',
        full_name: 'Ramesh Patil',
        location: 'Sangli, Maharashtra',
        land_size: 8.5,
        rating: 4.8,
        phone_number: '+91 98765 43210',
        crops_history: ['Wheat', 'Soybean', 'Grapes'],
        trust_score: 92
    },
    {
        id: 'farmer-2',
        full_name: 'Suresh Jadhav',
        location: 'Nashik, Maharashtra',
        land_size: 12.0,
        rating: 4.6,
        phone_number: '+91 98765 43211',
        crops_history: ['Onions', 'Tomato', 'Grapes'],
        trust_score: 85
    },
    {
        id: 'farmer-3',
        full_name: 'Arjun More',
        location: 'Satara, Maharashtra',
        land_size: 5.5,
        rating: 4.9,
        phone_number: '+91 98765 43212',
        crops_history: ['Soybean', 'Sugarcane'],
        trust_score: 95
    },
    {
        id: 'farmer-4',
        full_name: 'Vikas Deshmukh',
        location: 'Nagpur, Maharashtra',
        land_size: 15.0,
        rating: 4.4,
        phone_number: '+91 98765 43213',
        crops_history: ['Cotton', 'Oranges'],
        trust_score: 78
    }
];

export const mockContracts = [
    {
        id: 'CRT-001',
        contract_number: 'CRT-20250201-4521',
        farmer_id: 'dev-farmer-id',
        business_id: 'dev-business-id',
        business_name: 'AgriCorp India Ltd',
        farmer_name: 'Ramesh Patil',
        crop_name: 'Organic Wheat',
        quantity: 50,
        unit: 'Quintals',
        price: 2450,
        total_value: 122500,
        status: 'active',
        progress: 65,
        created_at: '2025-02-01T10:00:00Z',
        delivery_date: '2025-04-15'
    },
    {
        id: 'CRT-002',
        contract_number: 'CRT-20250215-8892',
        farmer_id: 'dev-farmer-id',
        business_id: 'biz-2',
        business_name: 'FreshMart Exports',
        farmer_name: 'Ramesh Patil',
        crop_name: 'Soybean',
        quantity: 30,
        unit: 'Quintals',
        price: 4800,
        total_value: 144000,
        status: 'pending',
        progress: 0,
        created_at: '2025-02-15T14:30:00Z',
        delivery_date: '2025-05-20'
    },
    {
        id: 'CRT-003',
        contract_number: 'CRT-20241110-1234',
        farmer_id: 'dev-farmer-id',
        business_id: 'dev-business-id',
        business_name: 'AgriCorp India Ltd',
        farmer_name: 'Ramesh Patil',
        crop_name: 'Grapes',
        quantity: 100,
        unit: 'Boxes',
        price: 850,
        total_value: 85000,
        status: 'completed',
        progress: 100,
        created_at: '2024-11-10T09:00:00Z',
        delivery_date: '2025-01-05'
    }
];

export const mockLoans = [
    {
        id: 'LN-001',
        application_number: 'APL-1735123456',
        farmer_id: 'dev-farmer-id',
        applicant_name: 'Ramesh Patil',
        applicant_type: 'farmer',
        loan_amount: 50000,
        tenure_months: 12,
        purpose: 'Drip Irrigation Equipment',
        bank_name: 'State Agri Bank',
        status: 'approved',
        risk_score: 82,
        created_at: '2025-01-20T11:20:00Z',
        approved_at: '2025-01-22T14:00:00Z'
    },
    {
        id: 'LN-002',
        application_number: 'APL-1735987654',
        farmer_id: 'dev-farmer-id',
        applicant_name: 'Ramesh Patil',
        applicant_type: 'farmer',
        loan_amount: 25000,
        tenure_months: 6,
        purpose: 'Organic Fertilizer Purchase',
        bank_name: 'Farmer First Bank',
        status: 'pending',
        risk_score: 75,
        created_at: '2025-02-10T16:45:00Z'
    },
    {
        id: 'LN-003',
        application_number: 'APL-1736000111',
        farmer_id: 'farmer-2',
        applicant_name: 'Suresh Jadhav',
        applicant_type: 'farmer',
        loan_amount: 150000,
        tenure_months: 24,
        purpose: 'Tractor Financing',
        bank_name: 'State Agri Bank',
        status: 'pending',
        risk_score: 68,
        created_at: '2025-02-25T10:15:00Z'
    }
];

export const mockNotifications = [
    {
        id: 1,
        type: 'contract_offer',
        title: 'New Contract Offer',
        message: 'FreshMart Exports sent you a contract offer for Soybean.',
        time: '2 hours ago',
        unread: true
    },
    {
        id: 2,
        type: 'loan_update',
        title: 'Loan Approved',
        message: 'Your loan application for Drip Irrigation has been approved by State Agri Bank.',
        time: '1 day ago',
        unread: false
    },
    {
        id: 3,
        type: 'payment',
        title: 'Advance Received',
        message: 'Advance payment of ₹36,750 for Organic Wheat contract has been credited.',
        time: '3 days ago',
        unread: false
    }
];

export const mockMarketInsights = [
    {
        title: 'Wheat Demand is Up!',
        desc: 'Businesses are looking for Premium Organic Wheat in your region. Contracts offering 15% better prices.',
        trend: 'up'
    },
    {
        title: 'Pest Alert: Fall Armyworm',
        desc: 'Localized outbreaks reported in neighboring districts. High humidity favored growth.',
        trend: 'alert'
    },
    {
        title: 'Fertilizer Subsidy',
        desc: 'New government scheme for organic fertilizers launched. Claim up to 40% rebate.',
        trend: 'info'
    }
];

export const mockAnalytics = {
    approvalRate: 72,
    disbursementTrend: [45, 52, 48, 61, 55, 68, 72],
    riskDistribution: [10, 15, 45, 20, 10], // 0-20, 21-40, 41-60, 61-80, 81-100
    sectorBreakdown: [
        { name: 'Cereals', value: 40 },
        { name: 'Oilseeds', value: 25 },
        { name: 'Fruits', value: 15 },
        { name: 'Cash Crops', value: 20 }
    ]
};
