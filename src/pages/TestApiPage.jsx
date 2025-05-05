import React from 'react';
import Navbar from '../components/shared/Navbar';
import TestJobPost from '../components/admin/TestJobPost';

const TestApiPage = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">API Testing Page</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TestJobPost />
          {/* Add more test components here if needed */}
        </div>
      </div>
    </div>
  );
};

export default TestApiPage;
