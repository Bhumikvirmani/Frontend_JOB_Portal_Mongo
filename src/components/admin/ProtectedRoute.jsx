import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { isUserLoggedIn, getCurrentUser } from "@/utils/directApiUtils";

const ProtectedRoute = ({children}) => {
    const {user} = useSelector(store=>store.auth);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);

            // First check Redux store
            if (user && user.role === 'recruiter') {
                console.log("User authenticated via Redux store");
                setLoading(false);
                return;
            }

            // Then check if user is logged in using our utility function
            const isLoggedIn = isUserLoggedIn();
            if (isLoggedIn) {
                // Get current user from localStorage
                const currentUser = getCurrentUser();
                if (currentUser) {
                    try {
                        const parsedUser = typeof currentUser === 'string' ? JSON.parse(currentUser) : currentUser;
                        if (parsedUser && parsedUser.role === 'recruiter') {
                            console.log("User authenticated via localStorage");
                            setLoading(false);
                            return;
                        }
                    } catch (error) {
                        console.error("Error parsing user from localStorage:", error);
                    }
                }
            }

            // If we get here, user is not authenticated or not a recruiter
            console.log("User not authenticated or not a recruiter, redirecting to home");
            navigate("/");
            setLoading(false);
        };

        checkAuth();
    }, [user, navigate]);

    return (
        <>
        {loading ? (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-2">Loading...</p>
            </div>
        ) : (
            children
        )}
        </>
    )
};
export default ProtectedRoute;