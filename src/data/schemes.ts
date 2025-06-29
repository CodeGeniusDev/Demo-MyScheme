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

// Demo schemes for fallback when database is not connected
export const mockSchemes: Scheme[] = [
  {
    id: 'demo-1',
    title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    state: 'All States',
    ministry: 'Ministry of Agriculture',
    description: 'Financial assistance to small and marginal farmers',
    fullDescription: 'PM-KISAN is a Central Sector scheme with 100% funding from Government of India. It has become operational from 1.12.2018. Under the scheme, an income support of 6,000/- per year in three equal installments will be provided to small and marginal farmer families having combined land holding/ownership of up to 2 hectares.',
    tags: ['agriculture', 'farmers', 'financial assistance'],
    category: 'Agriculture',
    gender: ['All'],
    ageGroup: ['All Ages'],
    caste: ['All'],
    residence: ['Rural'],
    minority: ['All'],
    differentlyAbled: false,
    benefitType: ['Financial Assistance'],
    dbtScheme: true,
    maritalStatus: ['All'],
    disabilityPercentage: ['Not Applicable'],
    belowPovertyLine: false,
    economicDistress: false,
    governmentEmployee: false,
    employmentStatus: ['All'],
    student: false,
    occupation: ['Farmer'],
    applicationMode: ['Online', 'Offline'],
    schemeType: 'central',
    benefits: {
      financial: '₹6,000 per year in three installments',
      nonFinancial: ['Direct bank transfer', 'No intermediary'],
      eligibility: ['Small and marginal farmers', 'Land holding up to 2 hectares']
    },
    eligibility: [
      'Small and marginal farmer families',
      'Combined land holding/ownership of up to 2 hectares',
      'Valid Aadhaar card',
      'Bank account details'
    ],
    applicationProcess: [
      'Visit PM-KISAN portal or nearest CSC',
      'Fill application form with required details',
      'Upload necessary documents',
      'Submit application and get acknowledgment',
      'Track application status online'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Bank Account Details',
      'Land Records',
      'Mobile Number'
    ],
    faqs: [
      {
        question: 'Who is eligible for PM-KISAN?',
        answer: 'Small and marginal farmer families having combined land holding/ownership of up to 2 hectares are eligible.'
      },
      {
        question: 'How much benefit is provided?',
        answer: '₹6,000 per year in three equal installments of ₹2,000 each.'
      }
    ],
    sources: ['https://pmkisan.gov.in/'],
    lastUpdated: new Date().toISOString(),
    createdBy: 'system',
    status: 'published'
  },
  {
    id: 'demo-2',
    title: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana',
    state: 'All States',
    ministry: 'Ministry of Health & Family Welfare',
    description: 'Health insurance coverage for economically vulnerable families',
    fullDescription: 'Ayushman Bharat PM-JAY is the largest health assurance scheme in the world which aims at providing a health cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization to over 10.74 crores poor and vulnerable families.',
    tags: ['health', 'insurance', 'medical'],
    category: 'Health',
    gender: ['All'],
    ageGroup: ['All Ages'],
    caste: ['All'],
    residence: ['All'],
    minority: ['All'],
    differentlyAbled: false,
    benefitType: ['Healthcare'],
    dbtScheme: false,
    maritalStatus: ['All'],
    disabilityPercentage: ['Not Applicable'],
    belowPovertyLine: true,
    economicDistress: true,
    governmentEmployee: false,
    employmentStatus: ['All'],
    student: false,
    occupation: ['All'],
    applicationMode: ['Online', 'Offline'],
    schemeType: 'central',
    benefits: {
      financial: '₹5 lakh per family per year',
      nonFinancial: ['Cashless treatment', 'Portable across India'],
      eligibility: ['SECC-2011 beneficiaries', 'Rural and urban poor families']
    },
    eligibility: [
      'Families identified in SECC-2011',
      'Rural families with specific deprivation criteria',
      'Urban families in occupational categories',
      'Valid Aadhaar card or alternative ID'
    ],
    applicationProcess: [
      'Check eligibility on PM-JAY website',
      'Visit nearest empaneled hospital',
      'Provide Aadhaar or alternative ID',
      'Get treatment without any payment',
      'Hospital settles bill directly with government'
    ],
    documentsRequired: [
      'Aadhaar Card or alternative ID',
      'Ration Card',
      'SECC-2011 verification'
    ],
    faqs: [
      {
        question: 'What is the coverage amount?',
        answer: 'Up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.'
      },
      {
        question: 'Is there any premium to be paid?',
        answer: 'No, the scheme is entirely free for eligible beneficiaries.'
      }
    ],
    sources: ['https://pmjay.gov.in/'],
    lastUpdated: new Date().toISOString(),
    createdBy: 'system',
    status: 'published'
  },
  {
    id: 'demo-3',
    title: 'Beti Bachao Beti Padhao',
    state: 'All States',
    ministry: 'Ministry of Women & Child Development',
    description: 'Initiative to save and educate the girl child',
    fullDescription: 'Beti Bachao Beti Padhao (BBBP) scheme was launched with an aim to address the declining Child Sex Ratio (CSR) and related issues of empowerment of women over a life-cycle continuum.',
    tags: ['women empowerment', 'girl child', 'education'],
    category: 'Women Empowerment',
    gender: ['Female'],
    ageGroup: ['0-5', '6-14', '15-18'],
    caste: ['All'],
    residence: ['All'],
    minority: ['All'],
    differentlyAbled: false,
    benefitType: ['Financial Assistance', 'Training'],
    dbtScheme: true,
    maritalStatus: ['All'],
    disabilityPercentage: ['Not Applicable'],
    belowPovertyLine: false,
    economicDistress: false,
    governmentEmployee: false,
    employmentStatus: ['All'],
    student: true,
    occupation: ['Student'],
    applicationMode: ['Online', 'Offline'],
    schemeType: 'central',
    benefits: {
      financial: 'Various financial incentives for girl child education',
      nonFinancial: ['Awareness campaigns', 'Educational support'],
      eligibility: ['Girl children', 'Families with girl child']
    },
    eligibility: [
      'Girl children from birth to 18 years',
      'Indian citizenship',
      'Valid documents for age proof'
    ],
    applicationProcess: [
      'Contact local Anganwadi center',
      'Fill application form',
      'Submit required documents',
      'Get enrolled in the program',
      'Receive benefits as per scheme guidelines'
    ],
    documentsRequired: [
      'Birth Certificate',
      'Aadhaar Card',
      'School Enrollment Certificate',
      'Bank Account Details'
    ],
    faqs: [
      {
        question: 'What is the main objective of BBBP?',
        answer: 'To address declining Child Sex Ratio and empower women through education and awareness.'
      },
      {
        question: 'Who can apply for this scheme?',
        answer: 'Families with girl children from birth to 18 years of age.'
      }
    ],
    sources: ['https://wcd.nic.in/'],
    lastUpdated: new Date().toISOString(),
    createdBy: 'system',
    status: 'published'
  }
];

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