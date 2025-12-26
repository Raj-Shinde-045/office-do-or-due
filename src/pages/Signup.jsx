import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Check for company context
    const { companyId } = useParams(); // Optional: if accessed via /:companyId/signup

    const { signup, joinCompany } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        try {
            setError('');
            setLoading(true);

            // Try standard signup
            await signup(email, password, name, accessCode, companyId);

            navigate('/');
        } catch (err) {
            console.error(err);

            // Handle "Email Already In Use" - Meaning user wants to join another company
            if (err.code === 'auth/email-already-in-use') {
                try {
                    console.log("Email exists. Attempting to link to new company...");
                    await joinCompany(email, password, accessCode, companyId);
                    // Success!
                    navigate('/');
                    return; // Exit
                } catch (joinErr) {
                    console.error("Join failed:", joinErr);
                    // If wrong password or other error, show that
                    if (joinErr.code === 'auth/wrong-password') {
                        setError('Account with this email exists, but you entered the wrong password. Please try again.');
                        setLoading(false);
                        return;
                    }
                    // Fallback to original error if this fails
                }
            }

            setError('Failed to create account: ' + err.message);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Create Account</h2>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Access Code (License Key)</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            placeholder="e.g. BMW-MGR-X92"
                        />
                        <p className="text-xs text-slate-500 mt-1">Enter the License Key provided by your administrator.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-slate-600">
                        Already have an account?{' '}
                        <Link to={companyId ? `/${companyId}/login` : "/login"} className="font-medium text-blue-600 hover:text-blue-500">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
