import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy, ExternalLink, Calendar, MapPin, Building, Users, FileText, CheckCircle, MessageSquare } from 'lucide-react';
import { mockSchemes, Scheme } from '../data/schemes';
import { useLanguage } from '../contexts/LanguageContext';

const SchemeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [activeSection, setActiveSection] = useState('details');
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    if (id) {
      const foundScheme = mockSchemes.find(s => s.id === id);
      setScheme(foundScheme || null);
    }
  }, [id]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = scheme?.title || 'Government Scheme';
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
    }
    setShowShareMenu(false);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!scheme) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Scheme not found</h2>
          <button
            onClick={() => navigate('/search')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'benefits', label: 'Benefits', icon: Users },
    { id: 'eligibility', label: 'Eligibility', icon: CheckCircle },
    { id: 'application', label: 'Application Process', icon: ExternalLink },
    { id: 'documents', label: 'Documents Required', icon: Copy },
    { id: 'faqs', label: 'FAQs', icon: MessageSquare },
    { id: 'sources', label: 'Sources & References', icon: ExternalLink },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm font-medium">Share</span>
              </button>
              
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Facebook className="h-4 w-4" />
                      <span>Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Twitter className="h-4 w-4" />
                      <span>Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contents</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`flex items-center space-x-3 w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                      activeSection === section.id
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Scheme Header */}
              <div className="bg-green-600 text-white p-8">
                <h1 className="text-3xl font-bold mb-4">{scheme.title}</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{scheme.state}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>{scheme.ministry}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Updated: {scheme.lastUpdated}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-12">
                {/* Details Section */}
                <section id="details">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Scheme Details</h2>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {scheme.fullDescription}
                    </p>
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {scheme.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-lg text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Benefits Section */}
                <section id="benefits">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Benefits</h2>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-600">
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white font-semibold">
                              Benefit Type
                            </th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white font-semibold">
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 font-medium">
                              Financial Benefits
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-600 dark:text-gray-300">
                              {scheme.benefits.financial}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 font-medium">
                              Non-Financial Benefits
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-600 dark:text-gray-300">
                              <ul className="list-disc list-inside space-y-1">
                                {scheme.benefits.nonFinancial?.map((benefit, index) => (
                                  <li key={index}>{benefit}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* Eligibility Section */}
                <section id="eligibility">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Eligibility Criteria</h2>
                  <div className="space-y-4">
                    {scheme.eligibility.map((criteria, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">{criteria}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                      Check Eligibility
                    </button>
                  </div>
                </section>

                {/* Application Process Section */}
                <section id="application">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Application Process</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Online Process</h3>
                      <div className="space-y-4">
                        {scheme.applicationProcess.map((step, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 pt-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Offline Process</h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          Visit the nearest government office or authorized center with required documents.
                        </p>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li>• Collect application form from office</li>
                          <li>• Fill form with accurate details</li>
                          <li>• Attach required documents</li>
                          <li>• Submit to concerned officer</li>
                          <li>• Collect acknowledgment receipt</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Documents Required Section */}
                <section id="documents">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Documents Required</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scheme.documentsRequired.map((document, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Copy className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700 dark:text-gray-300">{document}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* FAQs Section */}
                <section id="faqs">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-6">
                    {scheme.faqs.map((faq, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Q{index + 1}: {faq.question}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Sources Section */}
                <section id="sources">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sources & References</h2>
                  <div className="space-y-3">
                    {scheme.sources.map((source, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <ExternalLink className="h-5 w-5 text-blue-600" />
                        <span className="text-gray-700 dark:text-gray-300">{source}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Feedback Section */}
                <section id="feedback">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Feedback</h2>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Help us improve this scheme information. Share your feedback or report any issues.
                    </p>
                    <div className="space-y-4">
                      <textarea
                        placeholder="Share your feedback..."
                        rows={4}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetail;