import { Navigate } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth';

interface Props {
    children: JSX.Element;
};
 
export const ProtectedRoute = ({ children }: Props) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to='/login' replace />;
    }

    return children;
};
 