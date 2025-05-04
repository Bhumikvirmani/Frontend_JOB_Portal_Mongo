import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';
import { getJobApplicants } from '@/utils/applicationApi';

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const {applicants} = useSelector(store=>store.application);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                // Use our enhanced getJobApplicants function that handles token refresh
                const data = await getJobApplicants(params.id);
                console.log("Job applicants data:", data);

                if (data && data.job) {
                    dispatch(setAllApplicants(data.job));
                }
            } catch (error) {
                console.log("Error fetching job applicants:", error);
            }
        }
        fetchAllApplicants();
    }, [params.id, dispatch]);
    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto'>
                <h1 className='font-bold text-xl my-5'>Applicants {applicants?.applications?.length}</h1>
                <ApplicantsTable />
            </div>
        </div>
    )
}

export default Applicants