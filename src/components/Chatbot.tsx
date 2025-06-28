import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 h-96 bg-white dark:bg-gray-800 rounded-sm shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="bg-green-600 text-white p-4 rounded-t-sm flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">MyScheme Assistant</h3>
              <p className="text-xs opacity-90">How can I help you?</p>
            </div>
            <button
              onClick={toggleChat}
              className="p-1 hover:bg-green-700 rounded-sm transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-sm max-w-xs">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  Hello! I'm here to help you find government schemes. What are you looking for?
                </p>
              </div>
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-sm transition-colors duration-200"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 z-50 bg-green-600 hover:bg-green-700 text-white p-3 rounded-sm shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </button>
    </>
  );
};

export default Chatbot;