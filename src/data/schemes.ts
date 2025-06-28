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
}

export const mockSchemes: Scheme[] = [
  {
    id: '1',
    title: 'Financial Assistance To Disabled Students Pursuing (10th, 11th, 12th Equivalent Exams)',
    state: 'Kerala',
    ministry: 'Department of Social Justice',
    description: 'The scheme "Financial Assistance to Disabled Students Pursuing (10th, 11th, 12th Equivalent Exams)" was launched by the Department of Social Justice, Government of Kerala.',
    fullDescription: 'This comprehensive scheme provides financial support to disabled students pursuing their secondary and higher secondary education. The initiative aims to ensure that physical disabilities do not become barriers to educational advancement and academic excellence.',
    tags: ['APL', 'BPL', 'Disabled', 'Financial Assistance', 'PwD', 'Student'],
    category: 'Education',
    gender: ['Male', 'Female', 'Other'],
    ageGroup: ['15-18', '18-25'],
    caste: ['General', 'OBC', 'SC', 'ST'],
    residence: ['Rural', 'Urban'],
    minority: ['All'],
    differentlyAbled: true,
    benefitType: ['Financial Assistance', 'Educational Support'],
    dbtScheme: true,
    maritalStatus: ['Single', 'Married'],
    disabilityPercentage: ['40% and above'],
    belowPovertyLine: true,
    economicDistress: true,
    governmentEmployee: false,
    employmentStatus: ['Student'],
    student: true,
    occupation: ['Student'],
    applicationMode: ['Online', 'Offline'],
    schemeType: 'state',
    benefits: {
      financial: '₹5,000 per year for 10th standard, ₹7,500 per year for 11th and 12th standards',
      nonFinancial: ['Free textbooks', 'Examination fee waiver', 'Transportation allowance'],
      eligibility: ['Must be a resident of Kerala', 'Disability certificate required', 'Family income below ₹2 lakh per annum']
    },
    eligibility: [
      'Must be a permanent resident of Kerala',
      'Should have a valid disability certificate with minimum 40% disability',
      'Family annual income should not exceed ₹2,00,000',
      'Must be enrolled in 10th, 11th, or 12th standard in a recognized institution',
      'Should maintain minimum 60% attendance'
    ],
    applicationProcess: [
      'Visit the official Kerala Social Justice Department website',
      'Register with valid mobile number and email ID',
      'Fill the online application form with accurate details',
      'Upload required documents (disability certificate, income certificate, etc.)',
      'Submit the application and note down the application reference number',
      'Track application status online using the reference number'
    ],
    documentsRequired: [
      'Disability Certificate (minimum 40% disability)',
      'Income Certificate (not exceeding ₹2 lakh annually)',
      'Residence Certificate of Kerala',
      'School/College ID Card',
      'Bank Account Details',
      'Aadhaar Card',
      'Passport Size Photographs',
      'Previous year mark sheets'
    ],
    faqs: [
      {
        question: 'What is the minimum disability percentage required?',
        answer: 'The applicant must have a minimum of 40% disability as certified by a competent medical authority.'
      },
      {
        question: 'Can students from other states apply?',
        answer: 'No, this scheme is exclusively for permanent residents of Kerala state.'
      },
      {
        question: 'Is there an age limit for this scheme?',
        answer: 'There is no specific age limit, but the applicant must be enrolled in 10th, 11th, or 12th standard.'
      },
      {
        question: 'How is the financial assistance disbursed?',
        answer: 'The assistance is directly transferred to the beneficiary\'s bank account through DBT (Direct Benefit Transfer).'
      }
    ],
    sources: [
      'Kerala Social Justice Department Official Website',
      'Government of Kerala Gazette Notification',
      'Kerala State Disability Commission Guidelines'
    ],
    lastUpdated: '2024-12-15'
  },
  {
    id: '2',
    title: 'ICMR- Post Doctoral Fellowship',
    state: 'All India',
    ministry: 'Ministry Of Health & Family Welfare',
    description: 'ICMR- Post Doctoral Fellowship (ICMR-PDF) Scheme is being instituted to foster high-quality research opportunities for promising fresh Ph.D./MD/MS holders in the areas of basic science, communicable and non-communicable diseases, & reproductive health including nutrition at ICMR Institutes/Centers.',
    fullDescription: 'The Indian Council of Medical Research (ICMR) Post Doctoral Fellowship is a prestigious program designed to nurture research excellence in medical and health sciences. This fellowship provides an opportunity for recent doctoral graduates to conduct advanced research under the guidance of experienced scientists.',
    tags: ['Fellowship', 'ICMR', 'PDF', 'Post Doctoral', 'Research'],
    category: 'Research & Development',
    gender: ['Male', 'Female', 'Other'],
    ageGroup: ['25-35'],
    caste: ['General', 'OBC', 'SC', 'ST'],
    residence: ['Rural', 'Urban'],
    minority: ['All'],
    differentlyAbled: false,
    benefitType: ['Fellowship', 'Research Grant'],
    dbtScheme: true,
    maritalStatus: ['Single', 'Married'],
    disabilityPercentage: ['Not Applicable'],
    belowPovertyLine: false,
    economicDistress: false,
    governmentEmployee: false,
    employmentStatus: ['Researcher', 'Unemployed'],
    student: false,
    occupation: ['Researcher', 'Medical Professional'],
    applicationMode: ['Online'],
    schemeType: 'central',
    benefits: {
      financial: '₹50,000 per month fellowship + ₹1,00,000 annual research grant',
      nonFinancial: ['Access to ICMR research facilities', 'Mentorship by senior scientists', 'Publication support'],
      eligibility: ['Ph.D./MD/MS degree in relevant field', 'Age limit of 35 years', 'Research proposal approval']
    },
    eligibility: [
      'Must have Ph.D./MD/MS degree in life sciences/medical sciences',
      'Age should not exceed 35 years at the time of application',
      'Should have published at least 2 research papers in peer-reviewed journals',
      'Must submit a detailed research proposal',
      'Should have secured admission/affiliation with an ICMR institute'
    ],
    applicationProcess: [
      'Visit the ICMR official website and navigate to fellowship section',
      'Create an account and complete the online application form',
      'Upload research proposal and supporting documents',
      'Submit application before the deadline',
      'Appear for interview if shortlisted',
      'Await final selection results'
    ],
    documentsRequired: [
      'Ph.D./MD/MS degree certificate',
      'Academic transcripts and mark sheets',
      'Research proposal (maximum 10 pages)',
      'List of publications with impact factor',
      'Two letters of recommendation',
      'Age proof certificate',
      'Caste certificate (if applicable)',
      'Medical fitness certificate'
    ],
    faqs: [
      {
        question: 'What is the duration of the fellowship?',
        answer: 'The fellowship is awarded for a period of 2 years, which may be extended by one more year based on performance.'
      },
      {
        question: 'Can I apply if I am already employed?',
        answer: 'No, the fellowship is meant for unemployed candidates. Employed candidates need to resign before joining.'
      },
      {
        question: 'Is there any bond or service commitment?',
        answer: 'Yes, fellows are required to serve in India for a period equal to the fellowship duration after completion.'
      }
    ],
    sources: [
      'ICMR Official Website',
      'Ministry of Health & Family Welfare Guidelines',
      'Government of India Fellowship Policies'
    ],
    lastUpdated: '2024-12-10'
  },
  {
    id: '3',
    title: 'Tool Kit Grant for Traditional Handicrafts Experts',
    state: 'Kerala',
    ministry: 'Department of Industries and Commerce',
    description: 'The "Tool Kit Grant for Traditional Handicrafts Experts" scheme is launched for the purpose for improving the productivity and competitiveness of the traditional OBC craftsmen ensuring quality goods for enhanced income and thereby qualitative improvement in their living conditions.',
    fullDescription: 'This innovative scheme focuses on preserving and promoting traditional handicrafts while empowering artisans with modern tools and techniques. The program aims to bridge the gap between traditional craftsmanship and contemporary market demands.',
    tags: ['Craftsman', 'Grant', 'Handicrafts', 'OBC', 'Self-employment', 'Stipend', 'Tool Kit', 'Training'],
    category: 'Skill Development',
    gender: ['Male', 'Female'],
    ageGroup: ['18-60'],
    caste: ['OBC'],
    residence: ['Rural', 'Urban'],
    minority: ['All'],
    differentlyAbled: false,
    benefitType: ['Grant', 'Training', 'Tool Kit'],
    dbtScheme: true,
    maritalStatus: ['Single', 'Married', 'Widowed'],
    disabilityPercentage: ['Not Applicable'],
    belowPovertyLine: true,
    economicDistress: true,
    governmentEmployee: false,
    employmentStatus: ['Self-employed', 'Unemployed'],
    student: false,
    occupation: ['Craftsman', 'Artisan'],
    applicationMode: ['Online', 'Offline'],
    schemeType: 'state',
    benefits: {
      financial: '₹25,000 tool kit grant + ₹5,000 monthly stipend during training',
      nonFinancial: ['3-month skill development training', 'Market linkage support', 'Quality certification'],
      eligibility: ['Must belong to OBC category', 'Traditional handicraft expertise', 'Kerala resident']
    },
    eligibility: [
      'Must be a permanent resident of Kerala',
      'Should belong to Other Backward Classes (OBC) category',
      'Age between 18 to 60 years',
      'Must have traditional knowledge or experience in handicrafts',
      'Family annual income should not exceed ₹3,00,000',
      'Should not be a beneficiary of any other similar scheme'
    ],
    applicationProcess: [
      'Visit the nearest District Industries Centre (DIC)',
      'Collect and fill the application form',
      'Attach all required documents',
      'Submit the application to DIC officer',
      'Attend skill assessment test if required',
      'Receive approval and tool kit disbursement'
    ],
    documentsRequired: [
      'OBC Certificate',
      'Income Certificate',
      'Residence Certificate of Kerala',
      'Age Proof Certificate',
      'Bank Account Details',
      'Aadhaar Card',
      'Passport Size Photographs',
      'Skill/Experience Certificate (if any)'
    ],
    faqs: [
      {
        question: 'What types of handicrafts are covered under this scheme?',
        answer: 'Traditional Kerala handicrafts like wood carving, metal work, pottery, weaving, and coir products are covered.'
      },
      {
        question: 'Is training mandatory for receiving the tool kit?',
        answer: 'Yes, beneficiaries must complete the 3-month skill development training program.'
      },
      {
        question: 'Can women artisans apply for this scheme?',
        answer: 'Yes, the scheme is open to both male and female artisans belonging to OBC category.'
      }
    ],
    sources: [
      'Kerala Department of Industries and Commerce',
      'District Industries Centre Guidelines',
      'Kerala State OBC Development Corporation'
    ],
    lastUpdated: '2024-12-08'
  },
  {
    id: '4',
    title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    state: 'All India',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    description: 'PM-KISAN is a Central Sector Scheme with 100% funding from Government of India. It has become operational from 1.12.2018. Under the scheme, an income support of 6,000/- per year in three equal installments will be provided to all land holding farmer families.',
    fullDescription: 'The Pradhan Mantri Kisan Samman Nidhi is a landmark scheme that provides direct income support to farmer families across India. This initiative aims to supplement the financial needs of land holding farmers in procuring various inputs to ensure proper crop health and appropriate yields.',
    tags: ['Farmer', 'Agriculture', 'Income Support', 'DBT', 'PM-KISAN'],
    category: 'Agriculture',
    gender: ['Male', 'Female'],
    ageGroup: ['18+'],
    caste: ['General', 'OBC', 'SC', 'ST'],
    residence: ['Rural', 'Urban'],
    minority: ['All'],
    differentlyAbled: false,
    benefitType: ['Financial Assistance', 'Income Support'],
    dbtScheme: true,
    maritalStatus: ['Single', 'Married', 'Widowed'],
    disabilityPercentage: ['Not Applicable'],
    belowPovertyLine: false,
    economicDistress: false,
    governmentEmployee: false,
    employmentStatus: ['Farmer', 'Self-employed'],
    student: false,
    occupation: ['Farmer'],
    applicationMode: ['Online', 'Offline'],
    schemeType: 'central',
    benefits: {
      financial: '₹6,000 per year in three equal installments of ₹2,000 each',
      nonFinancial: ['Direct bank transfer', 'No intermediary involvement', 'Transparent process'],
      eligibility: ['Land holding farmer families', 'Valid Aadhaar card', 'Bank account details']
    },
    eligibility: [
      'Must be a land holding farmer family',
      'Should have valid Aadhaar card',
      'Must have active bank account',
      'Land records should be updated',
      'Should not be an income tax payer',
      'Should not be a government employee (except multi-tasking staff, class IV, group D employees)'
    ],
    applicationProcess: [
      'Visit PM-KISAN official website or nearest Common Service Center',
      'Click on "New Farmer Registration"',
      'Fill the registration form with Aadhaar number',
      'Enter land details and bank account information',
      'Submit the form and note down the registration number',
      'Track application status using registration number'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Bank Account Details (Account Number, IFSC Code)',
      'Land Ownership Documents',
      'Mobile Number',
      'Passport Size Photograph'
    ],
    faqs: [
      {
        question: 'Who is eligible for PM-KISAN scheme?',
        answer: 'All land holding farmer families across the country are eligible, subject to certain exclusion criteria.'
      },
      {
        question: 'How much financial assistance is provided?',
        answer: '₹6,000 per year is provided in three equal installments of ₹2,000 each, directly transferred to bank account.'
      },
      {
        question: 'Can tenant farmers apply for this scheme?',
        answer: 'Currently, only land holding farmers are eligible. Tenant farmers are not covered under this scheme.'
      }
    ],
    sources: [
      'PM-KISAN Official Website',
      'Ministry of Agriculture & Farmers Welfare',
      'Government of India Press Releases'
    ],
    lastUpdated: '2024-12-12'
  },
  {
    id: '5',
    title: 'Beti Bachao Beti Padhao Scheme',
    state: 'All India',
    ministry: 'Ministry of Women & Child Development',
    description: 'Beti Bachao Beti Padhao (BBBP) scheme was launched with an aim to address the declining Child Sex Ratio (CSR) and related issues of empowerment of women over a life-cycle continuum.',
    fullDescription: 'The Beti Bachao Beti Padhao scheme is a tri-ministerial effort by the Government of India that aims to address the declining child sex ratio and promote the welfare of the girl child through a sustained social mobilization and communication campaign.',
    tags: ['Girl Child', 'Women Empowerment', 'Education', 'Social Welfare', 'BBBP'],
    category: 'Women Empowerment',
    gender: ['Female'],
    ageGroup: ['0-18'],
    caste: ['General', 'OBC', 'SC', 'ST'],
    residence: ['Rural', 'Urban'],
    minority: ['All'],
    differentlyAbled: false,
    benefitType: ['Educational Support', 'Awareness Campaign', 'Financial Incentives'],
    dbtScheme: true,
    maritalStatus: ['Single'],
    disabilityPercentage: ['Not Applicable'],
    belowPovertyLine: false,
    economicDistress: false,
    governmentEmployee: false,
    employmentStatus: ['Student', 'Child'],
    student: true,
    occupation: ['Student', 'Child'],
    applicationMode: ['Online', 'Offline'],
    schemeType: 'central',
    benefits: {
      financial: 'Various financial incentives for girl child education and welfare',
      nonFinancial: ['Awareness campaigns', 'Educational support', 'Healthcare initiatives'],
      eligibility: ['Girl child', 'Focus on districts with low CSR', 'Educational enrollment']
    },
    eligibility: [
      'Girl child from birth to 18 years',
      'Priority given to districts with low Child Sex Ratio',
      'Focus on educational enrollment and retention',
      'Healthcare and nutrition support',
      'Community participation in awareness programs'
    ],
    applicationProcess: [
      'Contact local Anganwadi centers',
      'Visit district administration offices',
      'Participate in community awareness programs',
      'Enroll in educational institutions',
      'Access healthcare services through government facilities'
    ],
    documentsRequired: [
      'Birth Certificate of Girl Child',
      'Aadhaar Card',
      'School Enrollment Certificate',
      'Vaccination Records',
      'Family Income Certificate'
    ],
    faqs: [
      {
        question: 'What is the main objective of BBBP scheme?',
        answer: 'The main objective is to address declining child sex ratio and promote welfare of girl child through education and awareness.'
      },
      {
        question: 'Which districts are covered under this scheme?',
        answer: 'Initially launched in 100 districts with low CSR, now expanded to cover all districts across India.'
      },
      {
        question: 'What kind of support is provided to girl children?',
        answer: 'Educational support, healthcare services, awareness campaigns, and various financial incentives are provided.'
      }
    ],
    sources: [
      'Ministry of Women & Child Development',
      'BBBP Official Guidelines',
      'Government of India Policy Documents'
    ],
    lastUpdated: '2024-12-05'
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