import { setAllAdminJobs } from '@/redux/jobSlice'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { jobApi } from '@/utils/directApiUtils'

const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllAdminJobs = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await jobApi.getAdminJobs();

                if(data.success){
                    dispatch(setAllAdminJobs(data.jobs));
                }
            } catch (error) {
                console.error('Error fetching admin jobs:', error);
                setError('Failed to load admin jobs');
            } finally {
                setLoading(false);
            }
        }
        fetchAllAdminJobs();
    }, [dispatch])

    return { loading, error };
}

export default useGetAllAdminJobs