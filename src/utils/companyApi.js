import { COMPANY_API_END_POINT } from './constant';
import { authenticatedRequest } from './authUtils';

// Get all companies for the logged-in user
export const getUserCompanies = async () => {
  try {
    const data = await authenticatedRequest('get', `${COMPANY_API_END_POINT}/get`);
    return data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

// Get company by ID
export const getCompanyById = async (companyId) => {
  try {
    const data = await authenticatedRequest('get', `${COMPANY_API_END_POINT}/get/${companyId}`);
    return data;
  } catch (error) {
    console.error('Error fetching company details:', error);
    throw error;
  }
};

// Register a new company
export const registerCompany = async (companyData) => {
  try {
    const data = await authenticatedRequest('post', `${COMPANY_API_END_POINT}/register`, companyData);
    return data;
  } catch (error) {
    console.error('Error registering company:', error);
    throw error;
  }
};

// Update company details
export const updateCompany = async (companyId, formData) => {
  try {
    const data = await authenticatedRequest('put', `${COMPANY_API_END_POINT}/update/${companyId}`, formData);
    return data;
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};
