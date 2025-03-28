import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useStateContext } from "./ContextProvider";

const ProtectedRoute = () => {
    const { auth } = useStateContext();
    const location = useLocation();

    return auth?.token ? (
        <Outlet />
    ) : (
        <Navigate to="/" state={{ from: location }} replace />
    );
};

export default ProtectedRoute;