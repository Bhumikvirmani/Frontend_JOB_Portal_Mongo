import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser, setToken } from '@/redux/authSlice'
import { storeTokenInRedux } from '@/utils/tokenUtils'
import { Loader2 } from 'lucide-react'

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "",
    });
    const { loading,user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const submitHandler = async (e) => {
        e.preventDefault();

        // Validate input fields
        if (!input.email) {
            toast.error("Please enter your email");
            return;
        }
        if (!input.password) {
            toast.error("Please enter your password");
            return;
        }
        if (!input.role) {
            toast.error("Please select your role (Student or Recruiter)");
            return;
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));

                // Extract token from cookies
                const cookies = document.cookie.split(';');
                let token = null;
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.startsWith('token=')) {
                        token = cookie.substring('token='.length, cookie.length);
                        break;
                    }
                }

                // Store token in Redux
                if (token) {
                    console.log("Token found in cookies after login, storing in Redux");
                    dispatch(setToken(token));
                } else {
                    console.log("No token found in cookies after login");
                    // As a fallback, create a manual token from user ID
                    const manualToken = `manual_${res.data.user._id}_${Date.now()}`;
                    console.log("Created manual token:", manualToken);
                    dispatch(setToken(manualToken));
                }

                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            if (error.response && error.response.data) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Login failed. Please try again.");
            }
        } finally {
            dispatch(setLoading(false));
        }
    }
    useEffect(()=>{
        if(user){
            navigate("/");
        }
    },[])
    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={submitHandler} className='w-1/2 border border-gray-200 rounded-md p-4 my-10'>
                    <h1 className='font-bold text-xl mb-5'>Login</h1>
                    <div className='my-2'>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            placeholder="patel@gmail.com"
                        />
                    </div>

                    <div className='my-2'>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            placeholder="patel@gmail.com"
                        />
                    </div>
                    <div className='my-4'>
                        <Label className="block mb-2 font-bold">Select Your Role</Label>
                        <RadioGroup className="flex items-center gap-4 my-2 border p-3 rounded-md">
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={input.role === 'student'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer"
                                />
                                <Label htmlFor="r1">Student</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="recruiter"
                                    checked={input.role === 'recruiter'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer"
                                />
                                <Label htmlFor="r2">Recruiter</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    {
                        loading ? <Button className="w-full my-4"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4">Login</Button>
                    }
                    <span className='text-sm'>Don't have an account? <Link to="/signup" className='text-blue-600'>Signup</Link></span>
                </form>
            </div>
        </div>
    )
}

export default Login