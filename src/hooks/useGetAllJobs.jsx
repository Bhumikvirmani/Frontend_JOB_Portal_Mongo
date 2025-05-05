import { setAllJobs } from '@/redux/jobSlice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { jobApi } from '@/utils/directApiUtils'

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {searchedQuery} = useSelector(store=>store.job);

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await jobApi.getAllJobs(searchedQuery);

                if(data.success){
                    dispatch(setAllJobs(data.jobs));
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
                setError('Failed to load jobs');
                // Set empty jobs array to avoid errors
                dispatch(setAllJobs([]));
            } finally {
                setLoading(false);
            }
        }
        fetchAllJobs();
    }, [searchedQuery, dispatch])

    return { loading, error };
}

export default useGetAllJobs