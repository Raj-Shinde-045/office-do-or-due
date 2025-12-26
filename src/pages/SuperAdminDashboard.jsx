import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Building2, Key, Users, Activity, Trash2, Plus, Copy, Check } from 'lucide-react';
import { CompanyService } from '../services/CompanyService';

export default function SuperAdminDashboard() {
    const { userProfile } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Form State
    const [newCompanyName, setNewCompanyName] = useState('');
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "companies"));
            const companiesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCompanies(companiesData);
        } catch (error) {
            console.error("Error fetching companies:", error);
            setStatusMsg('Error fetching companies.');
        } finally {
            setLoading(false);
        }
    };



    const handleCreateCompany = async (e) => {
        e.preventDefault();
        if (!newCompanyName.trim()) return;

        setCreating(true);
        setStatusMsg('');

        try {
            const newCompany = await CompanyService.createCompany(newCompanyName);

            // Update UI
            setCompanies([...companies, newCompany]);
            setNewCompanyName('');
            setStatusMsg(`Success! Created ${newCompany.name}`);
        } catch (error) {
            console.error("Error creating company:", error);
            setStatusMsg(`Error: ${error.message}`);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteCompany = async (companyId) => {
        if (!window.confirm(`Are you sure you want to delete ${companyId}? This cannot be undone.`)) return;

        try {
            await deleteDoc(doc(db, "companies", companyId));
            setCompanies(companies.filter(c => c.id !== companyId));
            setStatusMsg(`Deleted ${companyId}`);
        } catch (error) {
            console.error("Error deleting company:", error);
            setStatusMsg(`Error: ${error.message}`);
        }
    };

    // Component helper for copying text
    const CopyButton = ({ text }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return (
            <button
                onClick={handleCopy}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Copy to clipboard"
            >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20">
                            <Activity size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Super Admin</h1>
                            <p className="text-xs text-slate-400 font-mono">SAAS CONTROL CENTER</p>
                        </div>
                    </div>
                    <div className="text-sm text-slate-400">
                        {userProfile?.email}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Stats / Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Tenants</h3>
                        <div className="text-3xl font-bold text-white flex items-center gap-2">
                            <Building2 size={24} className="text-indigo-400" /> {companies.length}
                        </div>
                    </div>
                </div>

                {/* Create Company Section */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm mb-8">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-green-400" /> Provision New Company
                    </h2>
                    <form onSubmit={handleCreateCompany} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Name</label>
                            <input
                                type="text"
                                required
                                value={newCompanyName}
                                onChange={(e) => setNewCompanyName(e.target.value)}
                                placeholder="e.g. Acme Industries"
                                className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={creating}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-lg shadow-indigo-900/20"
                        >
                            {creating ? 'Provisioning...' : 'Create Tenant'}
                        </button>
                    </form>
                    {statusMsg && (
                        <div className={`mt-4 p-3 rounded text-sm font-medium ${statusMsg.startsWith('Error') ? 'bg-red-900/30 text-red-300 border border-red-800' : 'bg-green-900/30 text-green-300 border border-green-800'}`}>
                            {statusMsg}
                        </div>
                    )}
                </div>

                {/* Companies List */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Building2 size={20} className="text-slate-400" /> Active Tenants
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-500 animate-pulse">Loading tenants data...</div>
                    ) : companies.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">No companies found. Create one above.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/50 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        <th className="px-6 py-4">Company</th>
                                        <th className="px-6 py-4">Manager License Key</th>
                                        <th className="px-6 py-4">Employee License Key</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {companies.map(company => (
                                        <tr key={company.id} className="hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white">{company.name}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {company.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 bg-slate-900/50 py-1.5 px-3 rounded border border-slate-700 w-fit group">
                                                    <Key size={14} className="text-purple-400" />
                                                    <code className="text-sm text-purple-200 font-mono">{company.managerCode}</code>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <CopyButton text={company.managerCode} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 bg-slate-900/50 py-1.5 px-3 rounded border border-slate-700 w-fit group">
                                                    <Users size={14} className="text-blue-400" />
                                                    <code className="text-sm text-blue-200 font-mono">{company.employeeCode}</code>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <CopyButton text={company.employeeCode} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteCompany(company.id)}
                                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                                                    title="Delete Company"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
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
