import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TestJobPost = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const testJobPost = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      // Sample job data
      const jobData = {
        title: "Test Job",
        description: "Test Description",
        requirements: "Test Requirements",
        salary: "50000",
        location: "Test Location",
        jobType: "Full-time",
        experience: "1-2", // This is now a string in the model
        position: "1",
        companyId: "6818eef1b845dcc67fa76391" // Replace with a valid company ID
      };

      // Get token from localStorage
      let token = localStorage.getItem('authToken');

      // If no direct token, try to get it from Redux persist storage
      if (!token) {
        try {
          const persistRoot = localStorage.getItem('persist:root');
          if (persistRoot) {
            const parsedRoot = JSON.parse(persistRoot);
            const auth = JSON.parse(parsedRoot.auth || '{}');
            token = auth.token;
            console.log("Using token from Redux storage");
          }
        } catch (error) {
          console.error("Error extracting token from Redux storage:", error);
        }
      }

      if (!token) {
        setError("No authentication token found. Please log in first.");
        setLoading(false);
        return;
      }

      console.log("Using token:", token.substring(0, 10) + "...");
      console.log("Sending job data:", JSON.stringify(jobData));

      // Make direct fetch POST request
      const response = await fetch('https://backend-jobportal-mongo.onrender.com/api/v1/job/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(jobData)
      });

      // Parse the response
      const responseData = await response.json();

      // Log the full response for debugging
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries([...response.headers]));
      console.log("Response data:", responseData);

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(responseData.message || `Server error: ${response.status}`);
      }

      setResponse(responseData);
      toast.success("Test job post successful!");
    } catch (error) {
      console.error("Test job post error:", error);
      setError({
        message: error.message,
        stack: error.stack
      });
      toast.error("Test job post failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Test Job Post API</h2>

      <Button
        onClick={testJobPost}
        disabled={loading}
        className="mb-4"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          "Test Job Post API"
        )}
      </Button>

      {response && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-bold text-green-700">Success Response:</h3>
          <pre className="mt-2 text-sm overflow-auto max-h-40">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h3 className="font-bold text-red-700">Error:</h3>
          <pre className="mt-2 text-sm overflow-auto max-h-40">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-bold text-blue-700">Debug Instructions:</h3>
        <ol className="list-decimal ml-5 mt-2 text-sm">
          <li>Make sure you are logged in as a recruiter</li>
          <li>Click the "Test Job Post API" button</li>
          <li>Check the console for detailed request/response logs</li>
          <li>If successful, you'll see the response data below</li>
          <li>If there's an error, you'll see the error details below</li>
        </ol>
      </div>
    </div>
  );
};

export default TestJobPost;
