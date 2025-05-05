import { setSingleCompany } from '@/redux/companySlice'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { companyApi } from '@/utils/directApiUtils'

const useGetCompanyById = (companyId) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSingleCompany = async () => {
            if (!companyId) return;

            try {
                setLoading(true);
                setError(null);
                const data = await companyApi.getCompanyById(companyId);
                console.log('Company details fetched successfully:', data.company);

                if(data.success){
                    dispatch(setSingleCompany(data.company));
                }
            } catch (error) {
                console.error('Error fetching company details:', error);
                setError('Failed to load company details');
            } finally {
                setLoading(false);
            }
        }
        fetchSingleCompany();
    }, [companyId, dispatch])

    return { loading, error };
}

export default useGetCompanyById