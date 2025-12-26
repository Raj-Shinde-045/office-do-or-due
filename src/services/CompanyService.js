import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const CompanyService = {
    /**
     * Creates a new company with generated license keys.
     * @param {string} companyName - The display name of the company.
     * @returns {Promise<Object>} The created company data including keys.
     */
    async createCompany(companyName) {
        if (!companyName) throw new Error("Company Name is required");

        // 1. Create Slug
        const slug = companyName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

        // 2. Check if exists
        const companyRef = doc(db, "companies", slug);
        const companySnap = await getDoc(companyRef);

        if (companySnap.exists()) {
            throw new Error(`Company ID '${slug}' already exists.`);
        }

        // 3. Generate Keys Helper
        const generateCode = (prefix, type) => {
            const random = Math.random().toString(36).substring(2, 6).toUpperCase();
            return `${prefix.toUpperCase()}-${type}-${random}`;
        };

        const managerCode = generateCode(slug, 'MGR');
        const employeeCode = generateCode(slug, 'EMP');

        // 4. Prepare Data
        const companyData = {
            name: companyName.trim(),
            managerCode,
            employeeCode,
            subscriptionStatus: 'active',
            createdAt: new Date().toISOString()
        };

        // 5. Save to Firestore
        await setDoc(companyRef, companyData);

        return { id: slug, ...companyData };
    }
};
