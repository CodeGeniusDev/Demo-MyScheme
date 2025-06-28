import React, { useState, useEffect } from 'react';
import { Save, Plus, Edit, Trash2, Eye, Globe, AlertCircle } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import { useRealTimeStore } from '../../store/realTimeStore';
import { Scheme } from '../../data/schemes';
import toast from 'react-hot-toast';

const ArticleEditor: React.FC = () => {
  const { schemes, addScheme, updateScheme, deleteScheme, loading } = useContent();
  const { sendMessage } = useRealTimeStore();
  const [editingScheme, setEditingScheme] = useState<Partial<Scheme> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCreateScheme = () => {
    const newScheme: Partial<Scheme> = {
      title: 'New Government Scheme',
      description: 'Brief description of the scheme...',
      fullDescription: 'Detailed description of the scheme, its objectives, and implementation details...',
      state: 'All India',
      ministry: 'Ministry of Digital India',
      category: 'Digital Services',
      tags: ['Government', 'Digital', 'Services'],
      gender: ['Male', 'Female', 'Other'],
      ageGroup: ['18+'],
      caste: ['All'],
      residence: ['Rural', 'Urban'],
      minority: ['All'],
      differentlyAbled: false,
      benefitType: ['Information'],
      dbtScheme: false,
      maritalStatus: ['All'],
      disabilityPercentage: ['Not Applicable'],
      belowPovertyLine: false,
      economicDistress: false,
      governmentEmployee: false,
      employmentStatus: ['All'],
      student: false,
      occupation: ['All'],
      applicationMode: ['Online'],
      schemeType: 'central',
      benefits: {
        financial: 'Information and digital services access',
        nonFinancial: ['Digital literacy', 'Online services'],
        eligibility: ['All citizens']
      },
      eligibility: ['Open to all citizens of India'],
      applicationProcess: ['Visit official website', 'Fill online form', 'Submit required documents'],
      documentsRequired: ['Aadhaar Card', 'Valid ID Proof'],
      faqs: [
        {
          question: 'Who can apply for this scheme?',
          answer: 'All eligible citizens can apply through the official portal.'
        }
      ],
      sources: ['Official Government Website'],
      status: 'draft'
    };
    setEditingScheme(newScheme);
    setIsEditing(true);
  };

  const handleEditScheme = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setIsEditing(true);
  };

  const handleSaveScheme = async () => {
    if (!editingScheme) return;

    try {
      setSaving(true);
      
      if (editingScheme.id) {
        await updateScheme(editingScheme.id, editingScheme);
        sendMessage('content_updated', { 
          type: 'scheme', 
          action: 'updated',
          resourceId: editingScheme.id,
          title: editingScheme.title 
        });
      } else {
        await addScheme(editingScheme as Omit<Scheme, 'id' | 'createdBy' | 'lastUpdated'>);
        sendMessage('content_updated', { 
          type: 'scheme', 
          action: 'created',
          title: editingScheme.title 
        });
      }

      setIsEditing(false);
      setEditingScheme(null);
    } catch (error) {
      console.error('Failed to save scheme:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScheme = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteScheme(id);
        sendMessage('content_updated', { 
          type: 'scheme', 
          action: 'deleted',
          resourceId: id,
          title 
        });
      } catch (error) {
        console.error('Failed to delete scheme:', error);
      }
    }
  };

  const handlePublishScheme = async (scheme: Scheme) => {
    try {
      await updateScheme(scheme.id, { status: 'published' });
      sendMessage('content_updated', { 
        type: 'scheme', 
        action: 'published',
        resourceId: scheme.id,
        title: scheme.title 
      });
    } catch (error) {
      console.error('Failed to publish scheme:', error);
    }
  };

  if (isEditing && editingScheme) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingScheme.id ? 'Edit Scheme' : 'Create New Scheme'}
            </h1>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveScheme}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Scheme'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scheme Title *
                </label>
                <input
                  type="text"
                  value={editingScheme.title || ''}
                  onChange={(e) => setEditingScheme(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter scheme title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State/Region *
                </label>
                <input
                  type="text"
                  value={editingScheme.state || ''}
                  onChange={(e) => setEditingScheme(prev => prev ? { ...prev, state: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., All India, Kerala, etc."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ministry *
                </label>
                <input
                  type="text"
                  value={editingScheme.ministry || ''}
                  onChange={(e) => setEditingScheme(prev => prev ? { ...prev, ministry: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Ministry of Health"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  value={editingScheme.category || ''}
                  onChange={(e) => setEditingScheme(prev => prev ? { ...prev, category: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Health, Education"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brief Description *
              </label>
              <textarea
                value={editingScheme.description || ''}
                onChange={(e) => setEditingScheme(prev => prev ? { ...prev, description: e.target.value } : null)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Brief description of the scheme..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detailed Description *
              </label>
              <textarea
                value={editingScheme.fullDescription || ''}
                onChange={(e) => setEditingScheme(prev => prev ? { ...prev, fullDescription: e.target.value } : null)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Detailed description, objectives, and implementation details..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={editingScheme.tags?.join(', ') || ''}
                onChange={(e) => setEditingScheme(prev => prev ? { 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                } : null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="tag1, tag2, tag3..."
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Article Editor</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage government schemes with real-time updates</p>
        </div>
        <button
          onClick={handleCreateScheme}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>New Scheme</span>
        </button>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {schemes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Scheme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {schemes.map((scheme) => (
                    <tr key={scheme.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {scheme.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {scheme.description}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {scheme.state} • {scheme.ministry}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          scheme.status === 'published' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {scheme.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(scheme.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => window.open(`/scheme/${scheme.id}`, '_blank')}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditScheme(scheme)}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1 rounded"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {scheme.status === 'draft' && (
                            <button
                              onClick={() => handlePublishScheme(scheme)}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 p-1 rounded"
                              title="Publish"
                            >
                              <Globe className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteScheme(scheme.id, scheme.title)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <FileText className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No schemes yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first government scheme to get started.</p>
              <button
                onClick={handleCreateScheme}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Scheme</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArticleEditor;