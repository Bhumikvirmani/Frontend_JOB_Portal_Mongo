import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams, useNavigate } from 'react-router-dom';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { getJobById } from '@/utils/jobApi';
import { applyForJob } from '@/utils/applicationApi';
import { storeTokenInRedux } from '@/utils/tokenUtils';

const JobDescription = () => {
    const {singleJob} = useSelector(store => store.job);
    const {user} = useSelector(store=>store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);
    const [loading, setLoading] = useState(true);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const applyJobHandler = async () => {
        try {
            // Make sure token is stored in Redux before making the request
            const tokenStored = await storeTokenInRedux(dispatch);
            console.log("Token stored in Redux:", tokenStored);

            if (!tokenStored) {
                toast.error("Could not authenticate. Please try logging in again.");
                navigate('/login');
                return;
            }

            // Log the current state before making the API call
            console.log("User ID for job application:", user?._id);
            console.log("Job ID for application:", jobId);

            const data = await applyForJob(jobId);

            if(data.success){
                setIsApplied(true); // Update the local state
                const updatedSingleJob = {...singleJob, applications:[...singleJob.applications,{applicant:user?._id}]}
                dispatch(setSingleJob(updatedSingleJob)); // helps us to real time UI update
                toast.success(data.message);
            }
        } catch (error) {
            console.log("Job application error:", error);
            if (error.response && error.response.status === 401) {
                toast.error("Please log in to apply for this job");
                navigate('/login');
            } else if (error.response && error.response.data) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to apply for job. Please try again.");
            }
        }
    }

    useEffect(()=>{
        const fetchSingleJob = async () => {
            setLoading(true);
            try {
                // Use our new API utility that handles both authenticated and non-authenticated requests
                const data = await getJobById(jobId);

                if(data.success){
                    dispatch(setSingleJob(data.job));

                    // Check if user is logged in and applications exist before checking application status
                    if (user && data.job.applications) {
                        setIsApplied(data.job.applications.some(
                            application => application.applicant === user._id
                        ));
                    } else {
                        setIsApplied(false);
                    }
                }
            } catch (error) {
                console.log(error);
                toast.error("Failed to load job details. Please try again.");
            } finally {
                setLoading(false);
            }
        }
        fetchSingleJob();
    },[jobId, dispatch, user?._id]);

    return (
        <div className='max-w-7xl mx-auto my-10'>
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-[#7209b7]" />
                    <span className="ml-2 text-lg">Loading job details...</span>
                </div>
            ) : !singleJob ? (
                <div className="text-center py-10">
                    <h2 className="text-xl font-semibold">Job not found</h2>
                    <p className="text-gray-600 mt-2">The job you're looking for doesn't exist or has been removed.</p>
                </div>
            ) : (
                <>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h1 className='font-bold text-xl'>{singleJob?.title}</h1>
                            <div className='flex items-center gap-2 mt-4'>
                                <Badge className={'text-blue-700 font-bold'} variant="ghost">{singleJob?.position ? `${singleJob.position} Positions` : "N/A"}</Badge>
                                <Badge className={'text-[#F83002] font-bold'} variant="ghost">{singleJob?.jobType || "N/A"}</Badge>
                                <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{singleJob?.salary ? `${singleJob.salary}LPA` : "N/A"}</Badge>
                            </div>
                        </div>
                        {user ? (
                            <Button
                                onClick={isApplied ? null : applyJobHandler}
                                disabled={isApplied}
                                className={`rounded-lg ${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#7209b7] hover:bg-[#5f32ad]'}`}>
                                {isApplied ? 'Already Applied' : 'Apply Now'}
                            </Button>
                        ) : (
                            <Button
                                onClick={() => navigate('/login')}
                                className="rounded-lg bg-[#7209b7] hover:bg-[#5f32ad]">
                                Login to Apply
                            </Button>
                        )}
                    </div>
                    <h1 className='border-b-2 border-b-gray-300 font-medium py-4'>Job Description</h1>
                    <div className='my-4'>
                        <h1 className='font-bold my-1'>Role: <span className='pl-4 font-normal text-gray-800'>{singleJob?.title || "N/A"}</span></h1>
                        <h1 className='font-bold my-1'>Location: <span className='pl-4 font-normal text-gray-800'>{singleJob?.location || "N/A"}</span></h1>
                        <h1 className='font-bold my-1'>Description: <span className='pl-4 font-normal text-gray-800'>{singleJob?.description || "N/A"}</span></h1>
                        <h1 className='font-bold my-1'>Experience: <span className='pl-4 font-normal text-gray-800'>{singleJob?.experience ? `${singleJob.experience} yrs` : "N/A"}</span></h1>
                        <h1 className='font-bold my-1'>Salary: <span className='pl-4 font-normal text-gray-800'>{singleJob?.salary ? `${singleJob.salary}LPA` : "N/A"}</span></h1>
                        {user && singleJob?.applications && (
                            <h1 className='font-bold my-1'>Total Applicants: <span className='pl-4 font-normal text-gray-800'>{singleJob.applications.length || 0}</span></h1>
                        )}
                        <h1 className='font-bold my-1'>Posted Date: <span className='pl-4 font-normal text-gray-800'>{singleJob?.createdAt ? singleJob.createdAt.split("T")[0] : "N/A"}</span></h1>
                    </div>
                </>
            )}
        </div>
    )
}

export default JobDescription