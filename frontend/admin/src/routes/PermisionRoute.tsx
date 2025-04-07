import { Navigate, Outlet } from 'react-router-dom';
import { usePermission } from '@app/hooks/usePermission';

interface PermissionRouteProps {
    requiredPermission: string;
    redirectPath?: string;
}

const PermissionRoute = ({
    requiredPermission,
    redirectPath = '/unauthorized'
}: PermissionRouteProps) => {
    const { hasPermission } = usePermission();

    return hasPermission(requiredPermission)
        ? <Outlet />
        : <Navigate to={redirectPath} />;
};

export default PermissionRoute;