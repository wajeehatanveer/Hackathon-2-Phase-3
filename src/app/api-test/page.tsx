'use client';

import { useState } from 'react';

export default function ApiTestPage() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Test the API connection
      const response = await fetch('http://localhost:8000/', {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✓ API is reachable. Response: ${JSON.stringify(data)}`);
      } else {
        setTestResult(`✗ API returned status: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setTestResult(`✗ Error connecting to API: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testChatEndpoint = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Test the chat endpoint
      const response = await fetch('http://localhost:8000/api/testuser/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token-for-test'
        },
        body: JSON.stringify({ message: 'test' }),
      });
      
      if (response.status === 401 || response.status === 403) {
        // This is expected if the token is invalid, but it means the endpoint exists
        setTestResult(`✓ Chat endpoint is reachable (expected auth error: ${response.status})`);
      } else if (response.ok) {
        const data = await response.json();
        setTestResult(`✓ Chat endpoint is working. Response: ${JSON.stringify(data)}`);
      } else {
        setTestResult(`✗ Chat endpoint returned status: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setTestResult(`✗ Error connecting to chat endpoint: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">API Connection Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testApiConnection}
            disabled={isLoading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Test API Connection
          </button>
          
          <button
            onClick={testChatEndpoint}
            disabled={isLoading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            Test Chat Endpoint
          </button>
        </div>
        
        {testResult && (
          <div className={`mt-6 p-4 rounded-md ${testResult.startsWith('✓') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p>{testResult}</p>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Note:</strong> Make sure your backend server is running on port 8000.</p>
          <p>To start the backend server:</p>
          <pre className="bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
            cd backend<br/>
            uvicorn backend.chatbot.main:app --reload --port 8000
          </pre>
        </div>
      </div>
    </div>
  );
}