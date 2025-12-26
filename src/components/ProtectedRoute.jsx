import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SkeletonLayout from './SkeletonLayout';

export default function ProtectedRoute({ children, allowedRoles, requireSuperAdmin = false }) {
    const { currentUser, userProfile, loading } = useAuth();

    const params = useParams(); // To get companyId from URL if available

    if (loading) {
        return <SkeletonLayout />;
    }

<<<<<<< HEAD
    if (!currentUser) {
        // If we are trying to access a company route, send them to that company's login
        if (params.companyId) {
            return <Navigate to={`/${params.companyId}/login`} />;
        }
        // Otherwise send them to landing to find their company
=======
    if (!currentUser || !userProfile) {
        return <Navigate to="/primecommerce/login" />;
    }

    const companySlug = userProfile.companyId || 'primecommerce';

    // Check super admin requirement
    if (requireSuperAdmin && !userProfile.isSuperAdmin) {
>>>>>>> 0416bddd4c1124f7733b794279b8b41e74f5ad53
        return <Navigate to="/" />;
    }

    // If roles are specified, check if user has permission
<<<<<<< HEAD
    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
        // Redirect to their appropriate dashboard if they try to access wrong area
        if (userProfile.role === 'manager') return <Navigate to={`/${userProfile.companyId}/manager`} />;
        if (userProfile.role === 'employee') return <Navigate to={`/${userProfile.companyId}/employee`} />;
        return <Navigate to={`/${userProfile.companyId}/login`} />;
=======
    if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
        // Redirect to their appropriate dashboard
        if (userProfile.isSuperAdmin) {
            return <Navigate to="/superadmin/dashboard" />;
        }
        if (userProfile.role === 'admin') {
            return <Navigate to={`/${companySlug}/admin/dashboard`} />;
        }
        if (userProfile.role === 'manager') {
            return <Navigate to={`/${companySlug}/manager/dashboard`} />;
        }
        if (userProfile.role === 'employee') {
            return <Navigate to={`/${companySlug}/dashboard`} />;
        }
        return <Navigate to="/" />;
>>>>>>> 0416bddd4c1124f7733b794279b8b41e74f5ad53
    }

    return children;
}
