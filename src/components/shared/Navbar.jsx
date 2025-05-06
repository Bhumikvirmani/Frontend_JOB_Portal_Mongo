import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { LogOut, Menu, User2, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
                setMobileMenuOpen(false);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    }

    const NavLinks = () => (
        <ul className='flex font-medium items-center gap-5 flex-col md:flex-row'>
            {
                user && user.role === 'recruiter' ? (
                    <>
                        <li className="py-2 md:py-0"><Link to="/admin/companies" onClick={() => setMobileMenuOpen(false)}>Companies</Link></li>
                        <li className="py-2 md:py-0"><Link to="/admin/jobs" onClick={() => setMobileMenuOpen(false)}>Jobs</Link></li>
                    </>
                ) : (
                    <>
                        <li className="py-2 md:py-0"><Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
                        <li className="py-2 md:py-0"><Link to="/jobs" onClick={() => setMobileMenuOpen(false)}>Jobs</Link></li>
                        <li className="py-2 md:py-0"><Link to="/browse" onClick={() => setMobileMenuOpen(false)}>Browse</Link></li>
                    </>
                )
            }
        </ul>
    );

    const AuthButtons = () => (
        !user ? (
            <div className='flex items-center gap-2 flex-col md:flex-row mt-4 md:mt-0'>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full md:w-auto">
                    <Button variant="outline" className="w-full md:w-auto">Login</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="w-full md:w-auto mt-2 md:mt-0">
                    <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] w-full md:w-auto">Signup</Button>
                </Link>
            </div>
        ) : (
            <Popover>
                <PopoverTrigger asChild>
                    <Avatar className="cursor-pointer mt-4 md:mt-0">
                        <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                    </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className=''>
                        <div className='flex gap-2 space-y-2'>
                            <Avatar className="cursor-pointer">
                                <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                            </Avatar>
                            <div>
                                <h4 className='font-medium'>{user?.fullname}</h4>
                                <p className='text-sm text-muted-foreground'>{user?.profile?.bio}</p>
                            </div>
                        </div>
                        <div className='flex flex-col my-2 text-gray-600'>
                            {
                                user && user.role === 'student' && (
                                    <div className='flex w-fit items-center gap-2 cursor-pointer'>
                                        <User2 />
                                        <Button variant="link" onClick={() => setMobileMenuOpen(false)}>
                                            <Link to="/profile">View Profile</Link>
                                        </Button>
                                    </div>
                                )
                            }

                            <div className='flex w-fit items-center gap-2 cursor-pointer'>
                                <LogOut />
                                <Button onClick={logoutHandler} variant="link">Logout</Button>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        )
    );

    return (
        <div className='bg-white shadow-sm'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-4 md:px-6'>
                <div>
                    <h1 className='text-2xl font-bold'>Job<span className='text-[#F83002]'>Portal</span></h1>
                </div>

                {/* Mobile menu button */}
                <button
                    className="md:hidden text-gray-700 focus:outline-none"
                    onClick={toggleMobileMenu}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Desktop menu */}
                <div className='hidden md:flex items-center gap-8'>
                    <NavLinks />
                    <AuthButtons />
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white px-4 py-4 border-t border-gray-200">
                    <NavLinks />
                    <AuthButtons />
                </div>
            )}
        </div>
    )
}

export default Navbar