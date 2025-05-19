import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useStateContext } from "./ContextProvider";

const ProtectedRoute = () => {
    const { auth } = useStateContext();
    const location = useLocation();

    if (!auth.token) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;