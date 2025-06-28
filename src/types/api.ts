export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterParams {
  state?: string;
  category?: string;
  gender?: string;
  age?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'popular';
  language?: 'en' | 'hi';
}

export interface SchemeSearchParams extends FilterParams {
  schemeType?: 'state' | 'central' | 'all';
  benefitType?: string;
  eligibility?: string[];
}

// Database Models
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    preferences: {
      language: 'en' | 'hi';
      theme: 'light' | 'dark' | 'system';
      notifications: boolean;
    };
  };
}

export interface Scheme {
  id: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  schemeType: 'state' | 'central';
  
  // Basic Information
  title: Record<'en' | 'hi', string>;
  description: Record<'en' | 'hi', string>;
  fullDescription: Record<'en' | 'hi', string>;
  
  // Classification
  state: string;
  ministry: string;
  category: string;
  tags: string[];
  
  // Eligibility Criteria
  eligibility: {
    gender: string[];
    ageGroup: string[];
    caste: string[];
    residence: string[];
    minority: string[];
    differentlyAbled: boolean;
    maritalStatus: string[];
    disabilityPercentage: string[];
    belowPovertyLine: boolean;
    economicDistress: boolean;
    governmentEmployee: boolean;
    employmentStatus: string[];
    student: boolean;
    occupation: string[];
  };
  
  // Benefits
  benefits: {
    financial: Record<'en' | 'hi', string>;
    nonFinancial: Record<'en' | 'hi', string[]>;
    benefitType: string[];
    dbtScheme: boolean;
  };
  
  // Application Process
  applicationProcess: {
    mode: string[];
    steps: Record<'en' | 'hi', string[]>;
    documentsRequired: Record<'en' | 'hi', string[]>;
    timeline: string;
    fees: string;
  };
  
  // Additional Information
  faqs: Array<{
    question: Record<'en' | 'hi', string>;
    answer: Record<'en' | 'hi', string>;
  }>;
  
  sources: Array<{
    title: string;
    url: string;
    type: 'official' | 'news' | 'document';
  }>;
  
  // SEO & Metadata
  seo: {
    metaTitle: Record<'en' | 'hi', string>;
    metaDescription: Record<'en' | 'hi', string>;
    keywords: string[];
    ogImage?: string;
  };
  
  // Analytics
  analytics: {
    views: number;
    applications: number;
    lastViewed?: string;
    popularityScore: number;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy: string;
  updatedBy: string;
}

export interface Filter {
  id: string;
  category: string;
  name: string;
  values: Array<{
    value: string;
    label: Record<'en' | 'hi', string>;
    count: number;
    isActive: boolean;
  }>;
  order: number;
  isRequired: boolean;
  type: 'single' | 'multiple' | 'range';
  createdAt: string;
  updatedAt: string;
}

export interface CarouselImage {
  id: string;
  title: Record<'en' | 'hi', string>;
  subtitle: Record<'en' | 'hi', string>;
  image: {
    url: string;
    alt: Record<'en' | 'hi', string>;
    width: number;
    height: number;
  };
  cta?: {
    text: Record<'en' | 'hi', string>;
    url: string;
    target: '_self' | '_blank';
  };
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Translation {
  id: string;
  key: string;
  namespace: string;
  values: Record<'en' | 'hi', string>;
  isComplete: boolean;
  context?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Feedback {
  id: string;
  type: 'scheme' | 'general' | 'bug' | 'feature';
  schemeId?: string;
  rating?: number;
  subject: string;
  message: string;
  userInfo: {
    email?: string;
    phone?: string;
    location?: string;
  };
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  userEmail: string;
  changes?: Record<string, any>;
  metadata: {
    ip: string;
    userAgent: string;
    timestamp: string;
    sessionId: string;
  };
  createdAt: string;
}

export interface SystemSettings {
  id: string;
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  isPublic: boolean;
  updatedAt: string;
  updatedBy: string;
}