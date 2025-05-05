import { setCompanies} from '@/redux/companySlice'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { companyApi } from '@/utils/directApiUtils'

const useGetAllCompanies = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await companyApi.getCompanies();
                console.log('Companies fetched successfully');

                if(data.success){
                    dispatch(setCompanies(data.companies));
                }
            } catch (error) {
                console.error('Error fetching companies:', error);
                setError('Failed to load companies');
            } finally {
                setLoading(false);
            }
        }
        fetchCompanies();
    }, [dispatch])

    return { loading, error };
}

export default useGetAllCompanies