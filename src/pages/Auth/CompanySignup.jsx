import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import JoinRequestService from '../../services/JoinRequestService';

/**
 * CompanySignup - Unified signup component for employee, manager, and admin
 * Creates join requests instead of directly creating users
 */
export default function CompanySignup({ role = 'employee' }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [approverEmail, setApproverEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const companySlug = 'primecommerce';

    // Removed hardcoded Super Admin email

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);

            const requestData = {
                name,
                email,
                roleRequested: role.toUpperCase(),
                companySlug
            };

            // Add approver email based on role
            if (role === 'employee') {
                requestData.managerEmail = approverEmail;
            } else if (role === 'manager') {
                requestData.adminEmail = approverEmail;
            } else if (role === 'admin') {
                requestData.superAdminEmail = approverEmail;
            }

            await JoinRequestService.createJoinRequest(requestData);
            setSuccess(true);

            // Reset form
            setName('');
            setEmail('');
            setApproverEmail('');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate(`/${companySlug}${role === 'employee' ? '' : `/${role}`}/login`);
            }, 3000);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to submit request');
        }
        setLoading(false);
    }

    // Role-specific content
    const roleConfig = {
        employee: {
            title: 'Register Employee',
            subtitle: 'Request to join as an employee',
            approverLabel: 'Manager Email',
            approverPlaceholder: 'manager@primecommerce.com',
            buttonText: 'Send Request to Join',
            loginLink: `/${companySlug}/login`
        },
        manager: {
            title: 'Register Manager',
            subtitle: 'Request to join as a manager',
            approverLabel: 'Admin Email',
            approverPlaceholder: 'admin@primecommerce.com',
            buttonText: 'Send Request to Admin',
            loginLink: `/${companySlug}/manager/login`
        },
        admin: {
            title: 'Register Admin',
            subtitle: 'Request to join as an admin',
            approverLabel: 'Super Admin Email',
            approverPlaceholder: 'Enter Super Admin Email',
            buttonText: 'Send Request to Super Admin',
            loginLink: `/${companySlug}/admin/login`
        }
    };

    const config = roleConfig[role] || roleConfig.employee;

    if (success) {
        return (
            <AuthLayout companySlug={companySlug}>
                <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Sent!</h2>
                    <p className="text-slate-600 mb-6">
                        Your join request has been submitted successfully. You will receive an email with login
                        instructions once your request is approved.
                    </p>
                    <Link
                        to={config.loginLink}
                        className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Go to Login
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout companySlug={companySlug}>
            <div className="bg-white rounded-lg shadow-xl p-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">{config.title}</h2>
                <p className="text-slate-600 mb-6">{config.subtitle}</p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {config.approverLabel}
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={approverEmail}
                            onChange={(e) => setApproverEmail(e.target.value)}
                            placeholder={config.approverPlaceholder}
                        />
                        {/* Removed locked field validation */}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : config.buttonText}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center text-sm border-t border-slate-200 pt-4">
                    <p className="text-slate-600">
                        Already have an account?{' '}
                        <Link to={config.loginLink} className="font-medium text-blue-600 hover:text-blue-500">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
