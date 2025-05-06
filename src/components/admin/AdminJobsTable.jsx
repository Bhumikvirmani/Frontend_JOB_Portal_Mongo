import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, Eye, MoreHorizontal } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const AdminJobsTable = () => {
    const {allAdminJobs, searchJobByText} = useSelector(store=>store.job);

    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const navigate = useNavigate();

    useEffect(()=>{
        console.log('AdminJobsTable filtering jobs');

        // Check if allAdminJobs is an array and not empty
        if (!allAdminJobs || !Array.isArray(allAdminJobs)) {
            console.log('No admin jobs available or not in array format');
            setFilterJobs([]);
            return;
        }

        console.log(`Filtering ${allAdminJobs.length} admin jobs with search text: "${searchJobByText}"`);

        const filteredJobs = allAdminJobs.filter((job)=>{
            if(!searchJobByText){
                return true;
            };

            // Safely check properties that might be undefined
            const title = job?.title?.toLowerCase() || '';
            const companyName = job?.company?.name?.toLowerCase() || '';

            return title.includes(searchJobByText.toLowerCase()) ||
                   companyName.includes(searchJobByText.toLowerCase());
        });

        console.log(`Found ${filteredJobs.length} jobs after filtering`);
        setFilterJobs(filteredJobs);
    },[allAdminJobs,searchJobByText])
    return (
        <div className="w-full">
            <Table className="min-w-full">
                <TableCaption>A list of your recently posted jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="hidden md:table-cell">Company Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filterJobs && filterJobs.length > 0 ? (
                        filterJobs.map((job) => (
                            <tr key={job._id}>
                                <TableCell className="hidden md:table-cell">{job?.company?.name}</TableCell>
                                <TableCell>
                                    <div>
                                        <div>{job?.title}</div>
                                        <div className="md:hidden text-xs text-gray-500 mt-1">
                                            {job?.company?.name} • {job?.createdAt?.split("T")[0]}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{job?.createdAt?.split("T")[0]}</TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                        <PopoverContent className="w-32">
                                            <div onClick={()=> navigate(`/admin/companies/${job._id}`)} className='flex items-center gap-2 w-fit cursor-pointer'>
                                                <Edit2 className='w-4' />
                                                <span>Edit</span>
                                            </div>
                                            <div onClick={()=> navigate(`/admin/jobs/${job._id}/applicants`)} className='flex items-center w-fit gap-2 cursor-pointer mt-2'>
                                                <Eye className='w-4'/>
                                                <span>Applicants</span>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <TableCell colSpan={4} className="text-center py-8">
                                <p className="text-gray-500">No jobs found. Create your first job by clicking the "New Jobs" button above.</p>
                            </TableCell>
                        </tr>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default AdminJobsTable