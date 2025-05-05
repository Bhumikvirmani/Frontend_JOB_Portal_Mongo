import { setAllAdminJobs } from '@/redux/jobSlice'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { jobApi } from '@/utils/directApiUtils'
import { toast } from 'sonner'

const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllAdminJobs = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log("Fetching admin jobs from hook...");

                const data = await jobApi.getAdminJobs();
                console.log("Admin jobs data received:", data);

                // Check if data is valid
                if (data && data.success) {
                    // Check if jobs is an array
                    if (Array.isArray(data.jobs)) {
                        console.log(`Dispatching ${data.jobs.length} admin jobs to Redux store`);
                        dispatch(setAllAdminJobs(data.jobs));
                    } else {
                        // If jobs is not an array, set an empty array
                        console.log("No jobs found or jobs is not an array, setting empty array");
                        dispatch(setAllAdminJobs([]));
                    }
                } else {
                    console.error("Invalid response format:", data);
                    dispatch(setAllAdminJobs([]));
                    setError('Invalid response format');
                }
            } catch (error) {
                console.error('Error fetching admin jobs:', error);
                setError('Failed to load admin jobs');
                dispatch(setAllAdminJobs([])); // Set empty array on error

                // Show a toast notification only once
                toast.error("Failed to load admin jobs. You can still create new jobs.");
            } finally {
                setLoading(false);
            }
        }

        fetchAllAdminJobs();
    }, [dispatch])

    return { loading, error };
}

export default useGetAllAdminJobs