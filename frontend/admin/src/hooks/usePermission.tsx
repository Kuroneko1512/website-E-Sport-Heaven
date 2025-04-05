import { useAppSelector } from '@app/store/store';

export const usePermission = () => {
    const permissions = useAppSelector((state) => state.auth.permissions);

    const hasPermission = (requiredPermission: string): boolean => {
        if (!permissions) return false;
        return permissions.includes(requiredPermission);
    };

    const hasAnyPermission = (requiredPermissions: string[]): boolean => {
        if (!permissions) return false;
        return requiredPermissions.some(permission => permissions.includes(permission));
    };

    const hasAllPermissions = (requiredPermissions: string[]): boolean => {
        if (!permissions) return false;
        return requiredPermissions.every(permission => permissions.includes(permission));
    };

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions
    };
};