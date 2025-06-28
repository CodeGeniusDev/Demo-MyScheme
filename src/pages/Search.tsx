import React, { useState, useMemo, useEffect } from 'react';
import { Search as SearchIcon, Filter, ChevronDown, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';
import { filterOptions, Scheme } from '../data/schemes';
import { apiService } from '../services/api';

const Search: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { schemes: contextSchemes, loading: contextLoading } = useContent();
  
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    state: searchParams.get('state') || '',
    category: searchParams.get('category') || '',
    gender: '',
    age: '',
    caste: '',
    ministry: '',
    residence: '',
    minority: '',
    differentlyAbled: '',
    benefitType: '',
    dbtScheme: '',
    maritalStatus: '',
    disabilityPercentage: '',
    belowPovertyLine: '',
    economicDistress: '',
    governmentEmployee: '',
    employmentStatus: '',
    student: '',
    occupation: '',
    applicationMode: ''
  });

  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    category: false,
    benefitType: false
  });

  // Load schemes from API
  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSchemes({ 
        status: 'published',
        limit: 100 
      });
      
      if (response.success && response.data) {
        setSchemes(response.data.items || []);
      } else {
        // Fallback to context schemes if API fails
        setSchemes(contextSchemes);
      }
    } catch (error) {
      console.error('Failed to load schemes:', error);
      // Fallback to context schemes
      setSchemes(contextSchemes);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: t('search.tabs.all') },
    { id: 'state', label: t('search.tabs.state') },
    { id: 'central', label: t('search.tabs.central') }
  ];

  const filteredSchemes = useMemo(() => {
    let filtered = schemes;

    // Filter by tab
    if (activeTab === 'state') {
      filtered = filtered.filter(scheme => scheme.schemeType === 'state');
    } else if (activeTab === 'central') {
      filtered = filtered.filter(scheme => scheme.schemeType === 'central');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(scheme =>
        scheme.title.toLowerCase().includes(query) ||
        scheme.description.toLowerCase().includes(query) ||
        scheme.tags.some(tag => tag.toLowerCase().includes(query)) ||
        scheme.state.toLowerCase().includes(query)
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'All' && value !== '') {
        filtered = filtered.filter(scheme => {
          const schemeValue = scheme[key as keyof Scheme];
          
          if (Array.isArray(schemeValue)) {
            return schemeValue.includes(value);
          } else if (typeof schemeValue === 'boolean') {
            return value === 'Yes' ? schemeValue : !schemeValue;
          } else {
            return String(schemeValue).toLowerCase().includes(value.toLowerCase());
          }
        });
      }
    });

    // Sort schemes
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime());
    }

    return filtered;
  }, [schemes, activeTab, searchQuery, filters, sortBy]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('q', query);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);

    // Track search analytics
    if (query.trim()) {
      apiService.trackSearch(query, filters, filteredSchemes.length);
    }
  };

  const resetFilters = () => {
    setFilters({
      state: '',
      category: '',
      gender: '',
      age: '',
      caste: '',
      ministry: '',
      residence: '',
      minority: '',
      differentlyAbled: '',
      benefitType: '',
      dbtScheme: '',
      maritalStatus: '',
      disabilityPercentage: '',
      belowPovertyLine: '',
      economicDistress: '',
      governmentEmployee: '',
      employmentStatus: '',
      student: '',
      occupation: '',
      applicationMode: ''
    });
    setSearchParams({});
  };

  const toggleFilterExpansion = (filterKey: string) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  const handleSchemeClick = (schemeId: string) => {
    // Track scheme view
    apiService.trackSchemeView(schemeId);
    navigate(`/scheme/${schemeId}`);
  };

  const filterSections = [
    { key: 'state', label: t('search.filters.state'), options: filterOptions.states, type: 'dropdown' },
    { key: 'category', label: t('search.filters.category'), options: filterOptions.categories, type: 'expandable' },
    { key: 'gender', label: t('search.filters.gender'), options: filterOptions.gender, type: 'dropdown' },
    { key: 'age', label: 'Age', options: filterOptions.ageGroups, type: 'dropdown' },
    { key: 'caste', label: 'Caste', options: filterOptions.caste, type: 'dropdown' },
    { key: 'ministry', label: 'Ministry Name', options: filterOptions.ministries, type: 'dropdown' },
    { key: 'residence', label: 'Residence', options: filterOptions.residence, type: 'dropdown' },
    { key: 'minority', label: 'Minority', options: filterOptions.minority, type: 'dropdown' },
    { key: 'differentlyAbled', label: 'Differently Abled', options: ['All', 'Yes', 'No'], type: 'dropdown' },
    { key: 'benefitType', label: 'Benefit Type', options: filterOptions.benefitTypes, type: 'expandable' },
    { key: 'dbtScheme', label: 'DBT Scheme', options: ['All', 'Yes', 'No'], type: 'dropdown' },
    { key: 'maritalStatus', label: 'Marital Status', options: filterOptions.maritalStatus, type: 'dropdown' },
    { key: 'disabilityPercentage', label: 'Disability Percentage', options: filterOptions.disabilityPercentage, type: 'dropdown' },
    { key: 'belowPovertyLine', label: 'Below Poverty Line', options: ['All', 'Yes', 'No'], type: 'dropdown' },
    { key: 'economicDistress', label: 'Economic Distress', options: ['All', 'Yes', 'No'], type: 'dropdown' },
    { key: 'governmentEmployee', label: 'Government Employee', options: ['All', 'Yes', 'No'], type: 'dropdown' },
    { key: 'employmentStatus', label: 'Employment Status', options: filterOptions.employmentStatus, type: 'dropdown' },
    { key: 'student', label: 'Student', options: ['All', 'Yes', 'No'], type: 'dropdown' },
    { key: 'occupation', label: 'Occupation', options: filterOptions.occupation, type: 'dropdown' },
    { key: 'applicationMode', label: 'Application Mode', options: filterOptions.applicationMode, type: 'dropdown' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Back Button */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  {t('search.filter')}
                </h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200"
                >
                  {t('search.reset')}
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filterSections.map((section) => (
                  <div key={section.key}>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {section.label}
                      </label>
                      {section.type === 'expandable' && (
                        <button
                          onClick={() => toggleFilterExpansion(section.key)}
                          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                        >
                          {expandedFilters[section.key] ? (
                            <Minus className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                    
                    {section.type === 'dropdown' && (
                      <div className="relative">
                        <select
                          value={filters[section.key as keyof typeof filters]}
                          onChange={(e) => handleFilterChange(section.key, e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                        >
                          <option value="">Select</option>
                          {section.options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    )}

                    {section.type === 'expandable' && expandedFilters[section.key] && (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {section.options.map((option) => (
                          <label key={option} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filters[section.key as keyof typeof filters] === option}
                              onChange={(e) => handleFilterChange(section.key, e.target.checked ? option : '')}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t('header.search.placeholder')}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                For an exact match, put the words in quotes. For example: "Scheme Name".
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('search.total')} <span className="font-semibold text-green-600 dark:text-green-400">{filteredSchemes.length}</span> {t('search.available')}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{t('search.sort')}</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="relevance">{t('search.relevance')}</option>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading schemes...</span>
                  </div>
                )}

                {/* Schemes List */}
                {!loading && (
                  <div className="space-y-6">
                    {filteredSchemes.length > 0 ? (
                      filteredSchemes.map((scheme) => (
                        <div
                          key={scheme.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-green-300 dark:hover:border-green-600"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 
                                onClick={() => handleSchemeClick(scheme.id)}
                                className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 cursor-pointer"
                              >
                                {scheme.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                <span className="font-medium text-green-600 dark:text-green-400">{scheme.state}</span>
                                <span>•</span>
                                <span>{scheme.ministry}</span>
                                <span>•</span>
                                <span className="capitalize">{scheme.schemeType}</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                                {scheme.description}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {scheme.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg text-sm border border-gray-300 dark:border-gray-600"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() => handleSchemeClick(scheme.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ml-4"
                            >
                              Check Eligibility
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <SearchIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No schemes found</h3>
                        <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or filters</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;