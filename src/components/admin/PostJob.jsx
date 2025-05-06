import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { jobApi } from '@/utils/directApiUtils'

const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: 0,
        companyId: ""
    });
    const [loading, setLoading]= useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(store => store.company);
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        console.log("Selected company value:", value);

        // Try to find the company with case-insensitive matching
        const selectedCompany = companies.find(
            (company) => company.name.toLowerCase() === value.toLowerCase()
        );

        if (selectedCompany) {
            console.log("Found company:", selectedCompany);
            // Store the actual MongoDB ID
            setInput({...input, companyId: selectedCompany._id});
        } else {
            console.error("Company not found for value:", value);
            // Store the name temporarily, we'll resolve it during submission
            setInput({...input, companyId: value});
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!input.title) {
            toast.error("Job title is required");
            return;
        }

        if (!input.description) {
            toast.error("Job description is required");
            return;
        }

        if (!input.requirements) {
            toast.error("Job requirements are required");
            return;
        }

        if (!input.salary) {
            toast.error("Salary is required");
            return;
        }

        if (!input.location) {
            toast.error("Location is required");
            return;
        }

        if (!input.jobType) {
            toast.error("Job type is required");
            return;
        }

        if (!input.experience) {
            toast.error("Experience level is required");
            return;
        }

        if (!input.position) {
            toast.error("Number of positions is required");
            return;
        }

        if (!input.companyId) {
            toast.error("Please select a company");
            return;
        }

        try {
            setLoading(true);

            // Log the input data for debugging
            console.log("Submitting job with data:", input);

            // Check if companyId is already a valid MongoDB ID (24 hex chars)
            const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(input.companyId);

            let jobDataToSubmit;

            if (isValidMongoId) {
                // companyId is already a valid MongoDB ID, use it directly
                console.log("Using existing valid company ID:", input.companyId);
                jobDataToSubmit = { ...input };
            } else {
                // companyId might be a company name, try to find the actual ID
                console.log("Looking for company with name (case insensitive):", input.companyId);

                // Try different case variations for more robust matching
                const selectedCompany = companies.find(c =>
                    c.name.toLowerCase() === input.companyId.toLowerCase() ||
                    c.name === input.companyId ||
                    c._id === input.companyId
                );

                if (selectedCompany) {
                    // Use the actual company ID instead of the name
                    jobDataToSubmit = {
                        ...input,
                        companyId: selectedCompany._id
                    };
                    console.log("Using company ID:", selectedCompany._id);
                } else {
                    console.error("Could not find company with name:", input.companyId);
                    console.error("Available companies:", companies);
                    toast.error("Selected company not found. Please try again.");
                    setLoading(false);
                    return;
                }
            }

            console.log("Submitting job with final data:", jobDataToSubmit);

            try {
                // Call our improved postJob function
                const data = await jobApi.postJob(jobDataToSubmit);

                console.log("Job posting response:", data);

                if(data.success){
                    toast.success(data.message || "Job posted successfully!");
                    navigate("/admin/jobs");
                } else {
                    toast.error(data.message || "Failed to post job");
                }
            } catch (apiError) {
                console.error("API call failed:", apiError);
                toast.error(apiError.message || "Failed to post job. See console for details.");
                throw apiError; // Re-throw to be caught by the outer catch block
            }
        } catch (error) {
            console.error('Error posting job:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to post job';
            toast.error(errorMessage);

            // Log detailed error information
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
                console.error("Response headers:", error.response.headers);
            }
        } finally{
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center w-full my-5 px-4 md:px-0'>
                <form onSubmit={submitHandler} method="POST" className='p-4 md:p-8 w-full max-w-4xl border border-gray-200 shadow-lg rounded-md responsive-form'>
                    <h2 className="text-xl font-bold mb-4">Post a New Job</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 responsive-grid'>
                        <div>
                            <Label>Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 w-full"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 w-full"
                            />
                        </div>
                        <div>
                            <Label>Requirements</Label>
                            <Input
                                type="text"
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 w-full"
                            />
                        </div>
                        <div>
                            <Label>Salary</Label>
                            <Input
                                type="text"
                                name="salary"
                                value={input.salary}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 w-full"
                            />
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 w-full"
                            />
                        </div>
                        <div>
                            <Label>Job Type</Label>
                            <Input
                                type="text"
                                name="jobType"
                                value={input.jobType}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 w-full"
                            />
                        </div>
                        <div>
                            <Label>Experience Level</Label>
                            <Select
                                name="experience"
                                onValueChange={(value) => setInput({...input, experience: value})}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Experience Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="0-1">0-1 years</SelectItem>
                                        <SelectItem value="1-2">1-2 years</SelectItem>
                                        <SelectItem value="2-5">2-5 years</SelectItem>
                                        <SelectItem value="5-10">5-10 years</SelectItem>
                                        <SelectItem value="10+">10+ years</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>No of Positions</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 w-full"
                            />
                        </div>
                        {
                            companies.length > 0 && (
                                <div className="md:col-span-2">
                                    <Label>Company</Label>
                                    <Select onValueChange={selectChangeHandler}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a Company" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {
                                                    companies.map((company) => {
                                                        return (
                                                            <SelectItem key={company._id} value={company?.name}>{company.name}</SelectItem>
                                                        )
                                                    })
                                                }
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )
                        }
                    </div>
                    {
                        loading ?
                            <Button className="w-full my-4">
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                            </Button>
                            :
                            <Button type="submit" className="w-full my-4">
                                Post New Job
                            </Button>
                    }
                    {
                        companies.length === 0 &&
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                            <p className='text-sm text-red-600 font-medium text-center'>
                                Please register a company first, before posting jobs
                            </p>
                            <div className="mt-2 text-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate('/admin/companies/create')}
                                >
                                    Create Company
                                </Button>
                            </div>
                        </div>
                    }
                </form>
            </div>
        </div>
    )
}

export default PostJob