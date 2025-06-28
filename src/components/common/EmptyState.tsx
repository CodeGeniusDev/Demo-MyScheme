import React from 'react';
import { Search, FileText, Users } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'search' | 'file' | 'users' | React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'search',
  title,
  description,
  action,
  className = ''
}) => {
  const getIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }

    const iconMap = {
      search: Search,
      file: FileText,
      users: Users
    };

    const IconComponent = iconMap[icon as keyof typeof iconMap] || Search;
    return <IconComponent className="h-12 w-12 text-gray-400 dark:text-gray-600" />;
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 p-8 text-center ${className}`}>
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        {getIcon()}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          {description}
        </p>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;