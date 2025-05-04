import { setAllAppliedJobs } from "@/redux/jobSlice";
import { getAppliedJobs } from "@/utils/applicationApi";
import { useEffect } from "react"
import { useDispatch } from "react-redux"

const useGetAppliedJobs = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            try {
                // Use our enhanced getAppliedJobs function that handles token refresh
                const data = await getAppliedJobs();
                console.log("Applied jobs data:", data);

                if (data && data.success) {
                    dispatch(setAllAppliedJobs(data.application));
                }
            } catch (error) {
                console.log("Error fetching applied jobs:", error);
            }
        }
        fetchAppliedJobs();
    }, [dispatch])
};

export default useGetAppliedJobs;