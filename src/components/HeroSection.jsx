import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div className='text-center px-4 md:px-0 responsive-hero-container'>
            <div className='flex flex-col gap-5 my-10'>
                <span className='mx-auto px-4 py-2 rounded-full bg-gray-100 text-[#F83002] font-medium text-sm md:text-base'>No. 1 Job Hunt Website</span>
                <h1 className='text-3xl md:text-5xl font-bold responsive-hero-title'>
                    Search, Apply & <br className="hidden sm:block" />
                    Get Your <span className='text-[#6A38C2]'>Dream Jobs</span>
                </h1>
                <p className="text-sm md:text-base px-2">Every Steps Make's You Better EveryDay. Just Keep Going.</p>
                <div className='flex w-full sm:w-[80%] md:w-[60%] lg:w-[40%] shadow-lg border border-gray-200 pl-3 rounded-full items-center gap-4 mx-auto responsive-hero-search'>
                    <input
                        type="text"
                        placeholder='Find your dream jobs'
                        onChange={(e) => setQuery(e.target.value)}
                        className='outline-none border-none w-full py-2 text-sm md:text-base'
                    />
                    <Button onClick={searchJobHandler} className="rounded-r-full bg-[#6A38C2]">
                        <Search className='h-4 w-4 md:h-5 md:w-5' />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default HeroSection