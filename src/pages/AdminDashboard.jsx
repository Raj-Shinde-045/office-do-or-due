import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, Clock, UserPlus } from 'lucide-react';
import { useCompanyUsers } from '../hooks/useReactQueryTasks';
import AddUserModal from '../components/AddUserModal';

export default function AdminDashboard() {
    const { userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const companySlug = userProfile?.companyId;

    // Local State
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);

    // React Query Hooks
    const { data: users = [], isLoading: loading } = useCompanyUsers(userProfile);

    // Double check admin role
    React.useEffect(() => {
        if (userProfile && userProfile.role !== 'admin' && !userProfile.isSuperAdmin) {
            navigate('/');
        }
    }, [userProfile, navigate]);

    // Refreshes are automatic with React Query


    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <AddUserModal
                isOpen={isAddUserOpen}
                onClose={() => setIsAddUserOpen(false)}
                companyId={companySlug}
                companyName={userProfile?.companyName}
            />

            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Users size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Admin Portal</h1>
                            <p className="text-xs text-slate-500 font-medium">{userProfile?.companyName || 'Company Admin'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsAddUserOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-all"
                        >
                            <UserPlus size={16} />
                            Create User
                        </button>
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-slate-900">{userProfile?.name}</p>
                            <p className="text-xs text-slate-500">{userProfile?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Users size={18} className="text-blue-600" />
                                Team Members
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Manage your company's Managers and Employees.
                            </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                            {users.length} Users
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-slate-500 animate-pulse">
                            Loading users...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center justify-center text-slate-400">
                            <div className="bg-slate-50 p-4 rounded-full mb-4">
                                <Users size={48} className="text-slate-200" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-600">No users found</h3>
                            <p className="max-w-xs mx-auto mt-2 mb-6">Get started by creating your first user.</p>
                            <button
                                onClick={() => setIsAddUserOpen(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Create User
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {users.map((user) => (
                                        <tr key={user.uid} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm ${user.role === 'manager' ? 'bg-purple-600' : 'bg-blue-500'
                                                        }`}>
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                                        <div className="text-sm text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'manager'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {user.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
