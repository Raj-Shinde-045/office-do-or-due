import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SkeletonLayout from './SkeletonLayout';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { currentUser, userProfile, loading } = useAuth();

    const params = useParams(); // To get companyId from URL if available

    if (loading) {
        return <SkeletonLayout />;
    }

    if (!currentUser) {
        // If we are trying to access a company route, send them to that company's login
        if (params.companyId) {
            return <Navigate to={`/${params.companyId}/login`} />;
        }
        // Otherwise send them to landing to find their company
        return <Navigate to="/" />;
    }

    // If roles are specified, check if user has permission
    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
        // Redirect to their appropriate dashboard if they try to access wrong area
        if (userProfile.role === 'manager') return <Navigate to={`/${userProfile.companyId}/manager`} />;
        if (userProfile.role === 'employee') return <Navigate to={`/${userProfile.companyId}/employee`} />;
        return <Navigate to={`/${userProfile.companyId}/login`} />;
    }

    return children;
}
