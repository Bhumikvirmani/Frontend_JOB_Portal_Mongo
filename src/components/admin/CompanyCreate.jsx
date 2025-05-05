import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setSingleCompany } from '@/redux/companySlice'
import { companyApi } from '@/utils/directApiUtils'

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const registerNewCompany = async () => {
        if (!companyName) {
            toast.error("Company name is required");
            return;
        }

        try {
            setLoading(true);
            const data = await companyApi.registerCompany({ companyName });

            if(data.success){
                dispatch(setSingleCompany(data.company));
                toast.success(data.message);
                const companyId = data.company._id;
                navigate(`/admin/companies/${companyId}`);
            }
        } catch (error) {
            console.error('Error registering company:', error);
            toast.error(error.response?.data?.message || 'Failed to register company');
        } finally {
            setLoading(false);
        }
    }
    return (
        <div>
            <Navbar />
            <div className='max-w-4xl mx-auto'>
                <div className='my-10'>
                    <h1 className='font-bold text-2xl'>Your Company Name</h1>
                    <p className='text-gray-500'>What would you like to give your company name? you can change this later.</p>
                </div>

                <Label>Company Name</Label>
                <Input
                    type="text"
                    className="my-2"
                    placeholder="JobHunt, Microsoft etc."
                    onChange={(e) => setCompanyName(e.target.value)}
                />
                <div className='flex items-center gap-2 my-10'>
                    <Button variant="outline" onClick={() => navigate("/admin/companies")}>Cancel</Button>
                    <Button
                        onClick={registerNewCompany}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Continue'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CompanyCreate