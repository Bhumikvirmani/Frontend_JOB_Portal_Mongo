import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';

const category = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "FullStack Developer"
]

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div className="px-4 md:px-0">
            <Carousel className="w-full max-w-xl mx-auto my-10 md:my-20 relative responsive-category-carousel">
                <CarouselContent>
                    {
                        category.map((cat, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                <Button
                                    onClick={()=>searchJobHandler(cat)}
                                    variant="outline"
                                    className="rounded-full w-full text-sm md:text-base"
                                >
                                    {cat}
                                </Button>
                            </CarouselItem>
                        ))
                    }
                </CarouselContent>
                <CarouselPrevious className="-left-4 md:-left-12 bg-white" />
                <CarouselNext className="-right-4 md:-right-12 bg-white" />
            </Carousel>
        </div>
    )
}

export default CategoryCarousel