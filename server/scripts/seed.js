import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Scheme from '../models/Scheme.js';
import { logger } from '../utils/logger.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myscheme';

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info('Connected to MongoDB');

    // Clear existing data (optional - comment out for production)
    if (process.env.NODE_ENV === 'development') {
      await User.deleteMany({});
      await Scheme.deleteMany({});
      logger.info('Cleared existing data');
    }

    // Seed users
    await seedUsers();
    
    // Seed schemes
    await seedSchemes();
    
    logger.info('Database seeding completed successfully');
    process.exit(0);
    
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

async function seedUsers() {
  logger.info('Seeding users...');
  
  const users = [
    {
      username: 'admin',
      email: 'admin@myscheme.gov.in',
      password: 'Admin123!',
      role: 'admin',
      permissions: ['all'],
      profile: {
        firstName: 'System',
        lastName: 'Administrator',
        preferences: {
          language: 'en',
          theme: 'system',
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          privacy: {
            profileVisible: false,
            activityVisible: false
          }
        }
      },
      isActive: true,
      isEmailVerified: true
    },
    {
      username: 'editor',
      email: 'editor@myscheme.gov.in',
      password: 'Editor123!',
      role: 'editor',
      permissions: [
        'schemes.read', 'schemes.write',
        'content.read', 'content.write',
        'analytics.read'
      ],
      profile: {
        firstName: 'Content',
        lastName: 'Editor',
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          privacy: {
            profileVisible: true,
            activityVisible: true
          }
        }
      },
      isActive: true,
      isEmailVerified: true
    },
    {
      username: 'user',
      email: 'user@example.com',
      password: 'User123!',
      role: 'user',
      permissions: ['schemes.read'],
      profile: {
        firstName: 'Test',
        lastName: 'User',
        preferences: {
          language: 'en',
          theme: 'system',
          notifications: {
            email: true,
            push: false,
            sms: false
          },
          privacy: {
            profileVisible: true,
            activityVisible: true
          }
        }
      },
      isActive: true,
      isEmailVerified: true
    }
  ];

  for (const userData of users) {
    const existingUser = await User.findOne({ 
      $or: [{ email: userData.email }, { username: userData.username }] 
    });
    
    if (!existingUser) {
      const user = new User(userData);
      await user.save();
      logger.info(`Created user: ${userData.username}`);
    } else {
      logger.info(`User already exists: ${userData.username}`);
    }
  }
  
  logger.info('Users seeding completed');
}

async function seedSchemes() {
  logger.info('Seeding schemes...');
  
  // Get admin user for createdBy/updatedBy
  const adminUser = await User.findOne({ role: 'admin' });
  
  if (!adminUser) {
    logger.error('Admin user not found - cannot seed schemes');
    return;
  }

  const schemes = [
    {
      slug: 'pm-kisan-samman-nidhi',
      status: 'published',
      schemeType: 'central',
      title: {
        en: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        hi: 'प्रधान मंत्री किसान सम्मान निधि (पीएम-किसान)'
      },
      description: {
        en: 'Direct income support of ₹6,000 per year to farmer families across India.',
        hi: 'भारत भर के किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता।'
      },
      fullDescription: {
        en: 'The Pradhan Mantri Kisan Samman Nidhi is a landmark scheme that provides direct income support to farmer families across India. This initiative aims to supplement the financial needs of land holding farmers in procuring various inputs to ensure proper crop health and appropriate yields.',
        hi: 'प्रधान मंत्री किसान सम्मान निधि एक महत्वपूर्ण योजना है जो भारत भर के किसान परिवारों को प्रत्यक्ष आय सहायता प्रदान करती है।'
      },
      state: 'All India',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Agriculture',
      tags: ['Farmer', 'Agriculture', 'Income Support', 'DBT', 'PM-KISAN'],
      eligibility: {
        gender: ['Male', 'Female'],
        ageGroup: ['18+'],
        caste: ['All'],
        residence: ['Rural', 'Urban'],
        minority: ['All'],
        differentlyAbled: false,
        maritalStatus: ['All'],
        disabilityPercentage: ['Not Applicable'],
        belowPovertyLine: false,
        economicDistress: false,
        governmentEmployee: false,
        employmentStatus: ['Farmer', 'Self-employed'],
        student: false,
        occupation: ['Farmer']
      },
      benefits: {
        financial: {
          en: '₹6,000 per year in three equal installments of ₹2,000 each',
          hi: 'प्रति वर्ष ₹6,000 तीन समान किस्तों में ₹2,000 प्रत्येक'
        },
        nonFinancial: {
          en: ['Direct bank transfer', 'No intermediary involvement', 'Transparent process'],
          hi: ['प्रत्यक्ष बैंक हस्तांतरण', 'कोई मध्यस्थ शामिल नहीं', 'पारदर्शी प्रक्रिया']
        },
        benefitType: ['Financial Assistance', 'Income Support'],
        dbtScheme: true
      },
      applicationProcess: {
        mode: ['Online', 'Offline'],
        steps: {
          en: [
            'Visit PM-KISAN official website or nearest Common Service Center',
            'Click on "New Farmer Registration"',
            'Fill the registration form with Aadhaar number',
            'Enter land details and bank account information',
            'Submit the form and note down the registration number'
          ],
          hi: [
            'पीएम-किसान आधिकारिक वेबसाइट या निकटतम कॉमन सर्विस सेंटर पर जाएं',
            '"नया किसान पंजीकरण" पर क्लिक करें',
            'आधार नंबर के साथ पंजीकरण फॉर्म भरें'
          ]
        },
        documentsRequired: {
          en: [
            'Aadhaar Card',
            'Bank Account Details',
            'Land Ownership Documents',
            'Mobile Number'
          ],
          hi: [
            'आधार कार्ड',
            'बैंक खाता विवरण',
            'भूमि स्वामित्व दस्तावेज',
            'मोबाइल नंबर'
          ]
        },
        timeline: '30 days',
        fees: 'Free',
        applicationUrl: 'https://pmkisan.gov.in'
      },
      faqs: [
        {
          question: {
            en: 'Who is eligible for PM-KISAN scheme?',
            hi: 'पीएम-किसान योजना के लिए कौन पात्र है?'
          },
          answer: {
            en: 'All land holding farmer families across the country are eligible, subject to certain exclusion criteria.',
            hi: 'देश भर के सभी भूमिधारक किसान परिवार पात्र हैं, कुछ बहिष्करण मानदंडों के अधीन।'
          }
        }
      ],
      sources: [
        {
          title: 'PM-KISAN Official Website',
          url: 'https://pmkisan.gov.in',
          type: 'official'
        }
      ],
      seo: {
        metaTitle: {
          en: 'PM-KISAN Scheme - Direct Income Support for Farmers',
          hi: 'पीएम-किसान योजना - किसानों के लिए प्रत्यक्ष आय सहायता'
        },
        metaDescription: {
          en: 'Get ₹6,000 annual income support under PM-KISAN scheme. Check eligibility and apply online.',
          hi: 'पीएम-किसान योजना के तहत ₹6,000 वार्षिक आय सहायता प्राप्त करें।'
        },
        keywords: ['PM-KISAN', 'farmer scheme', 'income support', 'agriculture']
      },
      analytics: {
        views: 15420,
        applications: 8500,
        popularityScore: 95.5
      },
      createdBy: adminUser._id,
      updatedBy: adminUser._id
    },
    {
      slug: 'beti-bachao-beti-padhao',
      status: 'published',
      schemeType: 'central',
      title: {
        en: 'Beti Bachao Beti Padhao Scheme',
        hi: 'बेटी बचाओ बेटी पढ़ाओ योजना'
      },
      description: {
        en: 'Addressing declining child sex ratio and promoting welfare of girl child.',
        hi: 'घटते बाल लिंगानुपात को संबोधित करना और बालिका कल्याण को बढ़ावा देना।'
      },
      fullDescription: {
        en: 'The Beti Bachao Beti Padhao scheme is a tri-ministerial effort by the Government of India that aims to address the declining child sex ratio and promote the welfare of the girl child through a sustained social mobilization and communication campaign.',
        hi: 'बेटी बचाओ बेटी पढ़ाओ योजना भारत सरकार का एक त्रि-मंत्रालयी प्रयास है।'
      },
      state: 'All India',
      ministry: 'Ministry of Women & Child Development',
      category: 'Women Empowerment',
      tags: ['Girl Child', 'Women Empowerment', 'Education', 'Social Welfare', 'BBBP'],
      eligibility: {
        gender: ['Female'],
        ageGroup: ['0-18'],
        caste: ['All'],
        residence: ['Rural', 'Urban'],
        minority: ['All'],
        differentlyAbled: false,
        maritalStatus: ['Single'],
        disabilityPercentage: ['Not Applicable'],
        belowPovertyLine: false,
        economicDistress: false,
        governmentEmployee: false,
        employmentStatus: ['Student', 'Child'],
        student: true,
        occupation: ['Student', 'Child']
      },
      benefits: {
        financial: {
          en: 'Various financial incentives for girl child education and welfare',
          hi: 'बालिका शिक्षा और कल्याण के लिए विभिन्न वित्तीय प्रोत्साहन'
        },
        nonFinancial: {
          en: ['Awareness campaigns', 'Educational support', 'Healthcare initiatives'],
          hi: ['जागरूकता अभियान', 'शैक्षिक सहायता', 'स्वास्थ्य पहल']
        },
        benefitType: ['Educational Support', 'Awareness Campaign', 'Financial Incentives'],
        dbtScheme: true
      },
      applicationProcess: {
        mode: ['Online', 'Offline'],
        steps: {
          en: [
            'Contact local Anganwadi centers',
            'Visit district administration offices',
            'Participate in community awareness programs',
            'Enroll in educational institutions'
          ],
          hi: [
            'स्थानीय आंगनवाड़ी केंद्रों से संपर्क करें',
            'जिला प्रशासन कार्यालयों में जाएं'
          ]
        },
        documentsRequired: {
          en: [
            'Birth Certificate of Girl Child',
            'Aadhaar Card',
            'School Enrollment Certificate',
            'Vaccination Records'
          ],
          hi: [
            'बालिका का जन्म प्रमाण पत्र',
            'आधार कार्ड',
            'स्कूल नामांकन प्रमाण पत्र'
          ]
        },
        timeline: '15 days',
        fees: 'Free'
      },
      faqs: [
        {
          question: {
            en: 'What is the main objective of BBBP scheme?',
            hi: 'बीबीबीपी योजना का मुख्य उद्देश्य क्या है?'
          },
          answer: {
            en: 'The main objective is to address declining child sex ratio and promote welfare of girl child through education and awareness.',
            hi: 'मुख्य उद्देश्य घटते बाल लिंगानुपात को संबोधित करना और शिक्षा के माध्यम से बालिका कल्याण को बढ़ावा देना है।'
          }
        }
      ],
      sources: [
        {
          title: 'Ministry of Women & Child Development',
          url: 'https://wcd.nic.in',
          type: 'official'
        }
      ],
      seo: {
        metaTitle: {
          en: 'Beti Bachao Beti Padhao - Girl Child Welfare Scheme',
          hi: 'बेटी बचाओ बेटी पढ़ाओ - बालिका कल्याण योजना'
        },
        metaDescription: {
          en: 'Support girl child education and welfare through BBBP scheme initiatives.',
          hi: 'बीबीबीपी योजना पहल के माध्यम से बालिका शिक्षा और कल्याण का समर्थन करें।'
        },
        keywords: ['BBBP', 'girl child', 'women empowerment', 'education']
      },
      analytics: {
        views: 12350,
        applications: 6200,
        popularityScore: 88.2
      },
      createdBy: adminUser._id,
      updatedBy: adminUser._id
    }
  ];

  for (const schemeData of schemes) {
    const existingScheme = await Scheme.findOne({ slug: schemeData.slug });
    
    if (!existingScheme) {
      const scheme = new Scheme(schemeData);
      await scheme.save();
      logger.info(`Created scheme: ${schemeData.slug}`);
    } else {
      logger.info(`Scheme already exists: ${schemeData.slug}`);
    }
  }
  
  logger.info('Schemes seeding completed');
}

// Run seeding
seedDatabase();