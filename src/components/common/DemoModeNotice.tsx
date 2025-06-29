import React from 'react';
import { AlertTriangle, Database, ExternalLink } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';

export const DemoModeNotice: React.FC = () => {
  const { demoMode } = useContent();

  if (!demoMode) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800 mb-1">
            Demo Mode Active
          </h3>
          <p className="text-sm text-amber-700 mb-3">
            The database is not connected, so you're viewing demo data. Some features may be limited.
          </p>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1 text-amber-600">
              <Database className="h-3 w-3" />
              <span>Database: Disconnected</span>
            </div>
            <a
              href="https://www.mongodb.com/atlas"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-amber-600 hover:text-amber-800 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Set up MongoDB Atlas</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};