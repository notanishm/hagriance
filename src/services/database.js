import { supabase, handleSupabaseError } from '../lib/supabase';

/**
 * Database service for farmer-related operations
 */

export const farmerService = {
  // Create or update farmer profile
  async createFarmerProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: 'farmer',
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Get farmer profile
  async getFarmerProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .eq('role', 'farmer')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Add KYC documents
  async addKYCDocuments(userId, documents) {
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .insert({
          user_id: userId,
          ...documents,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Get farmer's contracts
  async getFarmerContracts(userId) {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          business:business_id (
            id,
            business_name,
            business_gst
          )
        `)
        .eq('farmer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Get farmer's loan applications
  async getFarmerLoans(userId) {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select(`
          *,
          contract:contract_id (
            id,
            crop_name,
            quantity,
            total_value
          )
        `)
        .eq('farmer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },
};

/**
 * Database service for business-related operations
 */
export const businessService = {
  // Create or update business profile
  async createBusinessProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: 'business',
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Create a new contract
  async createContract(contractData) {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .insert(contractData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Get business contracts
  async getBusinessContracts(businessId) {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          farmer:farmer_id (
            id,
            full_name,
            phone_number,
            location
          )
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Update contract status
  async updateContractStatus(contractId, status) {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', contractId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Search for farmers
  async searchFarmers(searchTerm = '') {
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, phone_number, location, land_size, crops_history, rating')
        .eq('role', 'farmer');
      
      // Only add search filter if searchTerm is provided
      if (searchTerm && searchTerm.trim() !== '') {
        query = query.or(`full_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query.limit(20);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },
};

/**
 * Database service for bank-related operations
 */
export const bankService = {
  // Create or update bank profile
  async createBankProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: 'bank',
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Get all loan applications for review
  async getLoanApplications(filters = {}) {
    try {
      let query = supabase
        .from('loan_applications')
        .select(`
          *,
          farmer:farmer_id (
            id,
            full_name,
            phone_number,
            location,
            land_size
          ),
          contract:contract_id (
            id,
            crop_name,
            quantity,
            price,
            total_value
          )
        `);

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Update loan application status
  async updateLoanStatus(loanId, status, reviewNotes = null) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (reviewNotes) {
        updateData.review_notes = reviewNotes;
      }

      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else if (status === 'rejected') {
        updateData.rejected_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('loan_applications')
        .update(updateData)
        .eq('id', loanId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Create loan application
  async createLoanApplication(loanData) {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .insert(loanData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },
};

/**
 * General database utilities
 */
export const dbUtils = {
  // Get user profile by ID
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },

  // Get contract by ID
  async getContract(contractId) {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          farmer:farmer_id (
            id,
            full_name,
            phone_number,
            location
          ),
          business:business_id (
            id,
            business_name,
            business_gst
          )
        `)
        .eq('id', contractId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  },
};

export default {
  farmer: farmerService,
  business: businessService,
  bank: bankService,
  utils: dbUtils,
};
