import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const TEST_ACCOUNTS = {
    employee: {
        email: 'employee_test@dev.com',
        password: 'password123',
        name: 'Dev Employee',
        role: 'employee'
    },
    manager: {
        email: 'manager_test@dev.com',
        password: 'password123',
        name: 'Dev Manager',
        role: 'manager'
    },
    admin: {
        email: 'admin_test@dev.com',
        password: 'password123',
        name: 'Dev Admin',
        role: 'admin'
    },
    superadmin: {
        email: 'super_test@dev.com',
        password: 'password123',
        name: 'Dev Super Admin',
        role: 'admin', // Not used for SA check but good for consistency
        isSuperAdmin: true
    }
};

const COMPANY_SLUG = 'primecommerce'; // Ensure lowercase matches frontend default

async function createOrUpdateUser(account) {
    let uid;
    try {
        // Try to login first to see if user exists
        const userCredential = await signInWithEmailAndPassword(auth, account.email, account.password);
        uid = userCredential.user.uid;
        console.log(`User ${account.email} already exists. Updating profile...`);
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            // Create user
            console.log(`Creating user ${account.email}...`);
            const userCredential = await createUserWithEmailAndPassword(auth, account.email, account.password);
            uid = userCredential.user.uid;
        } else {
            throw error;
        }
    }

    // Determine permissions
    let permissions = [];
    if (account.role === 'manager') {
        permissions = ['manage_employees', 'assign_tasks', 'verify_tasks'];
    } else if (account.role === 'admin') {
        permissions = ['manage_managers', 'manage_company', 'view_all_reports'];
    }

    // Create/Update Firestore Profile
    const userRef = doc(db, 'companies', COMPANY_SLUG, 'users', uid);
    const userData = {
        uid,
        name: account.name,
        email: account.email,
        role: account.role,
        companyId: COMPANY_SLUG,
        companyName: 'Prime Commerce',
        status: account.role === 'admin' ? 'admin' : 'active',
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        permissions: permissions
    };

    if (account.isSuperAdmin) {
        userData.isSuperAdmin = true;
    }

    console.log(`[Seeder] Writing to: ${userRef.path}`);
    try {
        await setDoc(userRef, userData, { merge: true });

        // Verify Write
        const verifySnap = await getDoc(userRef);
        if (verifySnap.exists()) {
            console.log(`[Seeder] ✅ VERIFIED. Document exists at ${userRef.path}`);
        } else {
            console.error(`[Seeder] ❌ FAILED VERIFICATION. Document NOT found at ${userRef.path} immediately after write.`);
            throw new Error("Write verification failed");
        }
    } catch (e) {
        console.error(`[Seeder] Error writing/verifying ${userRef.path}:`, e);
        throw e;
    }

    console.log(`Profile for ${account.email} setup complete.`);
    return uid;
}

export async function seedDevAccounts() {
    try {
        console.log("Starting Dev Account Seeding...");

        await createOrUpdateUser(TEST_ACCOUNTS.employee);
        await createOrUpdateUser(TEST_ACCOUNTS.manager);
        await createOrUpdateUser(TEST_ACCOUNTS.admin);
        await createOrUpdateUser(TEST_ACCOUNTS.superadmin);

        // Sign out the last user
        await signOut(auth);

        alert(`SUCCESS! 
        
        Accounts Configured:
        1. Employee: employee_test@dev.com
        2. Manager: manager_test@dev.com
        3. Admin: admin_test@dev.com
        4. Super: super_test@dev.com
        
        Password for all: "password123"
        
        Please Login now.`);

        window.location.reload();
    } catch (error) {
        console.error("Seeding failed detailed:", error);
        alert(`❌ SEEDING FAILED! 
        
        Error: ${error.code} - ${error.message}
        
        Check console for details.`);
    }
}

export async function seedSuperAdminOnly() {
    try {
        console.log("Starting Super Admin Only Seeding...");

        await createOrUpdateUser(TEST_ACCOUNTS.superadmin);

        // Sign out
        await signOut(auth);

        alert(`SUCCESS! 
        
        Super Admin Created:
        Email: super_test@dev.com
        Password: password123
        
        You can now:
        1. Login as Super Admin to approve Admins.
        2. Or Signup as a new Admin manually.`);

        window.location.reload();
    } catch (error) {
        console.error("Seeding failed detailed:", error);
        alert(`❌ SEEDING FAILED! 
        
        Error: ${error.code} - ${error.message}`);
    }
}
