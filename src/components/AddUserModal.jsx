import React, { useState } from 'react';
import { X, Copy, Check, Eye, EyeOff, UserPlus } from 'lucide-react';
import { createSecondaryUser } from '../services/adminAuthService';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function AddUserModal({ isOpen, onClose, companyId, companyName }) {
    const [step, setStep] = useState('form'); // 'form' or 'success'
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('employee');
    const [password, setPassword] = useState(generatePassword());

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    function generatePassword() {
        return Math.random().toString(36).slice(-8) + "!1A"; // Simple random pass
    }

    const handleCopy = () => {
        const text = `Email: ${email}\nPassword: ${password}\nLogin at: ${window.location.origin}/${companyId}/${role === 'manager' ? 'manager/' : ''}login`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Credentials copied to clipboard!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create User in Auth (Secondary App)
            const uid = await createSecondaryUser(email, password);

            // 2. Create Profile in Firestore
            const userRef = doc(db, "companies", companyId, "users", uid);
            const userData = {
                uid,
                name,
                email,
                role,
                companyId,
                companyName,
                status: 'active', // Direct activation
                createdAt: new Date().toISOString(),
                createdBy: 'admin'
            };

            await setDoc(userRef, userData);

            // 3. Success
            setStep('success');
            toast.success(`${role === 'manager' ? 'Manager' : 'Employee'} created successfully!`);
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep('form');
        setName('');
        setEmail('');
        setRole('employee');
        setPassword(generatePassword());
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <UserPlus size={20} className="text-blue-600" />
                        Add New User
                    </h3>
                    <button onClick={reset} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {step === 'form' ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('employee')}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border ${role === 'employee'
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        Employee
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('manager')}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border ${role === 'manager'
                                                ? 'bg-purple-50 border-purple-500 text-purple-700'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        Manager
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                    <span className="text-xs font-normal text-gray-500 ml-2">(Auto-generated)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Create User'
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <UserPlus size={32} />
                            </div>

                            <h4 className="text-xl font-bold text-gray-900">User Created!</h4>
                            <p className="text-sm text-gray-500">
                                Share these credentials with the user securely.
                            </p>

                            <div className="bg-slate-800 rounded-lg p-4 text-left relative group">
                                <button
                                    onClick={handleCopy}
                                    className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white rounded transition-colors"
                                    title="Copy all"
                                >
                                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                </button>
                                <div className="space-y-2 font-mono text-sm">
                                    <div>
                                        <span className="text-slate-500 block text-xs uppercase tracking-wider">Email</span>
                                        <span className="text-white">{email}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block text-xs uppercase tracking-wider">Password</span>
                                        <span className="text-white">{password}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCopy}
                                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? 'Copied!' : 'Copy Credentials'}
                            </button>

                            <button
                                onClick={reset}
                                className="w-full py-2 text-sm text-gray-500 hover:text-gray-900"
                            >
                                Close & Add Another
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
