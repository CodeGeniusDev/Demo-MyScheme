import React, { useState, useEffect } from 'react';
import { Save, Plus, Edit, Trash2, Eye, Globe } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import { useRealTimeStore } from '../../store/realTimeStore';
import toast from 'react-hot-toast';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published';
  author: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

const ArticleEditor: React.FC = () => {
  const { schemes, addScheme, updateScheme, deleteScheme } = useContent();
  const { sendMessage } = useRealTimeStore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Convert schemes to articles format for editing
    const articleData = schemes.map(scheme => ({
      id: scheme.id,
      title: scheme.title,
      content: scheme.fullDescription,
      excerpt: scheme.description,
      status: 'published' as const,
      author: 'Admin',
      createdAt: scheme.lastUpdated,
      updatedAt: scheme.lastUpdated,
      tags: scheme.tags
    }));
    setArticles(articleData);
  }, [schemes]);

  const handleCreateArticle = () => {
    const newArticle: Article = {
      id: '',
      title: 'New Article',
      content: 'Start writing your article content here...',
      excerpt: 'Article excerpt...',
      status: 'draft',
      author: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    };
    setEditingArticle(newArticle);
    setIsEditing(true);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setIsEditing(true);
  };

  const handleSaveArticle = async () => {
    if (!editingArticle) return;

    try {
      const articleData = {
        title: editingArticle.title,
        description: editingArticle.excerpt,
        fullDescription: editingArticle.content,
        tags: editingArticle.tags,
        state: 'All India',
        ministry: 'Digital India',
        category: 'Information',
        schemeType: 'central' as const,
        gender: ['Male', 'Female', 'Other'],
        ageGroup: ['18+'],
        caste: ['General', 'OBC', 'SC', 'ST'],
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
        benefits: {
          financial: 'Information access',
          nonFinancial: ['Knowledge', 'Awareness'],
          eligibility: ['All citizens']
        },
        eligibility: ['Open to all citizens'],
        applicationProcess: ['Visit website', 'Read content'],
        documentsRequired: ['None'],
        faqs: [],
        sources: ['Official website']
      };

      if (editingArticle.id) {
        await updateScheme(editingArticle.id, articleData);
        sendMessage('article_updated', { id: editingArticle.id, title: editingArticle.title });
      } else {
        await addScheme(articleData);
        sendMessage('article_created', { title: editingArticle.title });
      }

      setIsEditing(false);
      setEditingArticle(null);
      toast.success('Article saved successfully!');
    } catch (error) {
      toast.error('Failed to save article');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteScheme(id);
        sendMessage('article_deleted', { id });
        toast.success('Article deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete article');
      }
    }
  };

  const handlePublishArticle = async (article: Article) => {
    const updatedArticle = { ...article, status: 'published' as const };
    setArticles(prev => prev.map(a => a.id === article.id ? updatedArticle : a));
    sendMessage('article_published', { id: article.id, title: article.title });
    toast.success('Article published successfully!');
  };

  if (isEditing && editingArticle) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingArticle.id ? 'Edit Article' : 'Create New Article'}
            </h1>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveArticle}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <Save className="h-4 w-4" />
                <span>Save Article</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Article Title
              </label>
              <input
                type="text"
                value={editingArticle.title}
                onChange={(e) => setEditingArticle(prev => prev ? { ...prev, title: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter article title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Article Excerpt
              </label>
              <textarea
                value={editingArticle.excerpt}
                onChange={(e) => setEditingArticle(prev => prev ? { ...prev, excerpt: e.target.value } : null)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Brief description of the article..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Article Content
              </label>
              <textarea
                value={editingArticle.content}
                onChange={(e) => setEditingArticle(prev => prev ? { ...prev, content: e.target.value } : null)}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Write your article content here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={editingArticle.tags.join(', ')}
                onChange={(e) => setEditingArticle(prev => prev ? { 
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
          <p className="text-gray-600 dark:text-gray-400">Create and manage articles with real-time updates</p>
        </div>
        <button
          onClick={handleCreateArticle}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Articles List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Article
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
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {article.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {article.excerpt}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      article.status === 'published' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(article.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => window.open(`/scheme/${article.id}`, '_blank')}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditArticle(article)}
                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {article.status === 'draft' && (
                        <button
                          onClick={() => handlePublishArticle(article)}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 p-1 rounded"
                          title="Publish"
                        >
                          <Globe className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
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

        {articles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Edit className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No articles yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Create your first article to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleEditor;