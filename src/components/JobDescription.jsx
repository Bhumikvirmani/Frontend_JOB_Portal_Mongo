import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const JobDescription = () => {
    const {singleJob} = useSelector(store => store.job);
    const {user} = useSelector(store=>store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);
    const [loading, setLoading] = useState(true);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {withCredentials:true});

            if(res.data.success){
                setIsApplied(true); // Update the local state
                const updatedSingleJob = {...singleJob, applications:[...singleJob.applications,{applicant:user?._id}]}
                dispatch(setSingleJob(updatedSingleJob)); // helps us to real time UI update
                toast.success(res.data.message);

            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    useEffect(()=>{
        const fetchSingleJob = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application=>application.applicant === user?._id)) // Ensure the state is in sync with fetched data
                }
            } catch (error) {
                console.log(error);
                toast.error("Failed to load job details. Please try again.");
            } finally {
                setLoading(false);
            }
        }
        fetchSingleJob();
    },[jobId,dispatch, user?._id]);

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
                        <Button
                            onClick={isApplied ? null : applyJobHandler}
                            disabled={isApplied}
                            className={`rounded-lg ${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#7209b7] hover:bg-[#5f32ad]'}`}>
                            {isApplied ? 'Already Applied' : 'Apply Now'}
                        </Button>
                    </div>
                    <h1 className='border-b-2 border-b-gray-300 font-medium py-4'>Job Description</h1>
                    <div className='my-4'>
                        <h1 className='font-bold my-1'>Role: <span className='pl-4 font-normal text-gray-800'>{singleJob?.title || "N/A"}</span></h1>
                        <h1 className='font-bold my-1'>Location: <span className='pl-4 font-normal text-gray-800'>{singleJob?.location || "N/A"}</span></h1>
                        <h1 className='font-bold my-1'>Description: <span className='pl-4 font-normal text-gray-800'>{singleJob?.description || "N/A"}</span></h1>
                        <h1 className='font-bold my-1'>Experience: <span className='pl-4 font-normal text-gray-800'>{singleJob?.experience ? `${singleJob.experience} yrs` : "N/A"}</span></h1>
                        <h1 className='font-bold my-1'>Salary: <span className='pl-4 font-normal text-gray-800'>{singleJob?.salary ? `${singleJob.salary}LPA` : "N/A"}</span></h1>
                        <h1 className='font-bold my-1'>Total Applicants: <span className='pl-4 font-normal text-gray-800'>{singleJob?.applications?.length || 0}</span></h1>
                        <h1 className='font-bold my-1'>Posted Date: <span className='pl-4 font-normal text-gray-800'>{singleJob?.createdAt ? singleJob.createdAt.split("T")[0] : "N/A"}</span></h1>
                    </div>
                </>
            )}
        </div>
    )
}

export default JobDescription