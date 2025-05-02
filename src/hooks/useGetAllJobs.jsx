import { setAllJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const {searchedQuery} = useSelector(store=>store.job);
    useEffect(()=>{
        const fetchAllJobs = async () => {
            try {
                // Try to get jobs with authentication first
                const res = await axios.get(`${JOB_API_END_POINT}/get?keyword=${searchedQuery}`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setAllJobs(res.data.jobs));
                }
            } catch (error) {
                console.log(error);
                // If authentication fails, try without authentication
                try {
                    const res = await axios.get(`${JOB_API_END_POINT}/get?keyword=${searchedQuery}`);
                    if(res.data.success){
                        dispatch(setAllJobs(res.data.jobs));
                    }
                } catch (fallbackError) {
                    console.log("Fallback error:", fallbackError);
                    // Set empty jobs array to avoid errors
                    dispatch(setAllJobs([]));
                }
            }
        }
        fetchAllJobs();
    },[])
}

export default useGetAllJobs