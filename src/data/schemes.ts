export interface Scheme {
  id: string;
  title: string;
  state: string;
  ministry: string;
  description: string;
  fullDescription: string;
  tags: string[];
  category: string;
  gender: string[];
  ageGroup: string[];
  caste: string[];
  residence: string[];
  minority: string[];
  differentlyAbled: boolean;
  benefitType: string[];
  dbtScheme: boolean;
  maritalStatus: string[];
  disabilityPercentage: string[];
  belowPovertyLine: boolean;
  economicDistress: boolean;
  governmentEmployee: boolean;
  employmentStatus: string[];
  student: boolean;
  occupation: string[];
  applicationMode: string[];
  schemeType: 'state' | 'central';
  benefits: {
    financial?: string;
    nonFinancial?: string[];
    eligibility?: string[];
  };
  eligibility: string[];
  applicationProcess: string[];
  documentsRequired: string[];
  faqs: { question: string; answer: string; }[];
  sources: string[];
  lastUpdated: string;
  createdBy: string;
  status: 'published' | 'draft';
}

// Remove all mock data - schemes will be loaded from database
export const mockSchemes: Scheme[] = [];

export const filterOptions = {
  states: [
    'All States', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ],
  categories: [
    'Agriculture', 'Education', 'Health', 'Employment', 'Housing', 'Social Welfare', 
    'Skill Development', 'Research & Development', 'Women Empowerment', 'Child Welfare',
    'Senior Citizens', 'Disability', 'Minority Welfare', 'Tribal Welfare'
  ],
  gender: ['All', 'Male', 'Female', 'Other'],
  ageGroups: ['All Ages', '0-5', '6-14', '15-18', '18-25', '26-35', '36-50', '50-60', '60+'],
  caste: ['All', 'General', 'OBC', 'SC', 'ST'],
  ministries: [
    'All Ministries', 'Ministry of Health & Family Welfare', 'Ministry of Education',
    'Ministry of Agriculture', 'Ministry of Social Justice', 'Ministry of Women & Child Development',
    'Ministry of Rural Development', 'Ministry of Labour & Employment'
  ],
  residence: ['All', 'Rural', 'Urban'],
  minority: ['All', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi'],
  benefitTypes: [
    'Financial Assistance', 'Scholarship', 'Grant', 'Loan', 'Subsidy', 'Training',
    'Healthcare', 'Housing', 'Employment', 'Pension'
  ],
  maritalStatus: ['All', 'Single', 'Married', 'Widowed', 'Divorced'],
  disabilityPercentage: ['Not Applicable', '40% and above', '50% and above', '70% and above'],
  employmentStatus: ['All', 'Employed', 'Unemployed', 'Self-employed', 'Student', 'Retired'],
  occupation: [
    'All', 'Farmer', 'Student', 'Teacher', 'Doctor', 'Engineer', 'Craftsman', 
    'Artisan', 'Researcher', 'Business Owner', 'Daily Wage Worker'
  ],
  applicationMode: ['All', 'Online', 'Offline', 'Both']
};