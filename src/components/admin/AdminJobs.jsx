import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '@/redux/jobSlice'
import { Loader2 } from 'lucide-react'

const AdminJobs = () => {
  const { loading, error } = useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input, dispatch]);

  return (
    <div>
      <Navbar />
      <div className='max-w-6xl mx-auto my-6 md:my-10 px-4 md:px-6'>
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between my-5 gap-4'>
          <div className="w-full md:w-auto">
            <Input
              className="w-full md:w-fit"
              placeholder="Filter by name, role"
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <Button
            onClick={() => navigate("/admin/jobs/create")}
            className="w-full md:w-auto"
          >
            New Jobs
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading jobs...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
            <p className="text-red-700">{error}</p>
            <p className="mt-2">You can still create new jobs by clicking the "New Jobs" button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto responsive-table">
            <AdminJobsTable />
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminJobs