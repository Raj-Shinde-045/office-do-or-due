import React, { useState, useEffect } from 'react';
import { CompanyService } from '../services/CompanyService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function SeedData() {
    const [status, setStatus] = useState('');
    const [companyName, setCompanyName] = useState('BMW');
    const [result, setResult] = useState(null);

    const handleCreate = async () => {
        if (!companyName) return;
        try {
            setStatus('Creating...');
            setResult(null);

            // Simulating "adding from coding" - just calling one function
            const newCompany = await CompanyService.createCompany(companyName);

            setStatus('Success!');
            setResult(newCompany);
        } catch (error) {
            console.error(error);
            setStatus('Error: ' + error.message);
        }
    };

    return (
        <div className="p-10 max-w-2xl mx-auto text-center font-sans">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Developer Quick Add</h1>

            <div className="bg-slate-100 p-8 rounded-xl shadow-inner">
                <p className="mb-4 text-slate-600">Enter a company name to generate ID and Keys instantly.</p>

                <div className="flex gap-2 justify-center mb-6">
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded"
                        placeholder="Company Name"
                    />
                    <button
                        onClick={handleCreate}
                        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 font-bold"
                    >
                        Create Company
                    </button>
                </div>

                {status && <p className={`font-bold ${status.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{status}</p>}

                {result && (
                    <div className="mt-6 text-left bg-white p-4 rounded border border-slate-200 shadow-sm overflow-x-auto">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Generated Data JSON</h3>
                        <pre className="text-xs font-mono text-slate-700">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-sm"><strong>Manager Key:</strong> <code className="bg-purple-100 text-purple-800 px-1 rounded">{result.managerCode}</code></p>
                            <p className="text-sm"><strong>Employee Key:</strong> <code className="bg-blue-100 text-blue-800 px-1 rounded">{result.employeeCode}</code></p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12 text-left">
                <h3 className="text-lg font-bold mb-2">How to add from code:</h3>
                <div className="bg-slate-800 text-slate-300 p-4 rounded-lg font-mono text-sm">
                    {`import { CompanyService } from '../services/CompanyService';

// Add this line anywhere in your app:
await CompanyService.createCompany("Your Company Name");`}
                </div>
            </div>
        </div>
    );
}
function ExistingCompaniesList() {
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        getDocs(collection(db, "companies")).then(snap => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setCompanies(list);
        });
    }, []);

    if (companies.length === 0) return <p className="text-slate-400 italic">No companies found.</p>;

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 text-left">
            {companies.map(c => (
                <div key={c.id} className="bg-white p-4 rounded shadow border border-slate-200">
                    <h4 className="font-bold text-lg">{c.name}</h4>
                    <p className="text-xs text-slate-400 mb-2">ID: {c.id}</p>
                    <div className="space-y-1 text-sm font-mono">
                        <div className="flex justify-between">
                            <span className="text-purple-600">MGR:</span>
                            <span className="bg-purple-50 px-1 rounded select-all">{c.managerCode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-blue-600">EMP:</span>
                            <span className="bg-blue-50 px-1 rounded select-all">{c.employeeCode}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
