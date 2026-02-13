
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, AuditLog, UserStatus, PolicyStatus, Policy, PaymentRecord, ContactMessage, InquiryType, RiskLevel, Claim, ClaimStatus, KYCStatus, ComplianceStatus, MIDSubmission, MIDStatus, PolicyDuration } from '../types';

interface DiagnosticReport {
  status: 'Healthy' | 'Warning' | 'Critical';
  checks: {
    name: string;
    result: 'Pass' | 'Fail' | 'Warning';
    message: string;
    timestamp: string;
  }[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPasswordWithToken: (token: string, newPass: string) => Promise<boolean>;
  
  // Data State
  users: User[];
  policies: Policy[];
  payments: PaymentRecord[];
  claims: Claim[];
  auditLogs: AuditLog[];
  inquiries: ContactMessage[];
  midSubmissions: MIDSubmission[];
  
  // EXECUTABLE IDENTITY ACTIONS
  updateUserStatus: (id: string, status: UserStatus, reason: string) => void;
  updateUserRisk: (id: string, risk: RiskLevel, riskFlag: boolean, internalNotes: string) => void;
  setComplianceStatus: (id: string, status: ComplianceStatus, reason: string) => void;
  deleteUserPermanent: (id: string, reason: string) => void;
  setKYCStatus: (id: string, status: KYCStatus, reason: string) => void;
  blockPayments: (id: string, blocked: boolean, reason: string) => void;
  
  // EXECUTABLE POLICY ACTIONS
  updatePolicyStatus: (id: string, status: PolicyStatus, reason: string) => void;
  updatePolicyDetails: (id: string, updates: Partial<Policy>, reason: string) => void;
  validatePolicy: (id: string) => Promise<boolean>;
  bindPolicyManual: (userId: string, data: any) => Promise<boolean>;
  generatePolicyPDF: (policyId: string) => Promise<string | null>;
  downloadPDF: (policyId: string) => void;
  deletePolicy: (id: string, reason: string) => void;
  
  // EXECUTABLE PAYMENT ACTIONS
  updatePaymentStatus: (id: string, status: PaymentRecord['status'], reason: string) => void;
  markPaymentDispute: (id: string, disputed: boolean, reason: string) => void;
  
  // EXECUTABLE CLAIMS ACTIONS
  updateClaimStatus: (id: string, status: ClaimStatus, internalNotes: string, suspicious: boolean) => void;
  submitClaim: (policyId: string, type: string, description: string) => Promise<boolean>;
  
  // MID INTEGRATION ACTIONS
  queueMIDSubmission: (policyId: string, vrm: string) => void;
  retryMIDSubmission: (submissionId: string) => Promise<boolean>;
  checkAskMID: (vrm: string) => Promise<{ found: boolean; status?: string; message: string }>;
  
  // Support & Inquiries
  submitInquiry: (data: Partial<ContactMessage>) => Promise<boolean>;
  markInquiryAsRead: (id: string) => void;
  deleteInquiry: (id: string) => void;
  
  // Diagnostics & Dev Tools
  runDiagnostics: () => Promise<DiagnosticReport>;
  seedMockEnvironment: () => void;
  
  isLoading: boolean;
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [users, setUsers] = useState<User[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [midSubmissions, setMidSubmissions] = useState<MIDSubmission[]>([]);

  const isProcessingRef = useRef(false);

  const seedInitialData = useCallback(() => {
    if (localStorage.getItem('sp_users')) return;

    const initialUsers = [{ 
      id: 'ADMIN-MASTER', name: 'System Admin', email: 'admin@swiftpolicy.co.uk', 
      role: 'admin', status: 'Active', createdAt: new Date().toISOString(), password: 'AdminPassword123!' 
    }];
    
    const initialLogs = [{
      id: 'LOG-INIT', timestamp: new Date().toISOString(), userId: 'SYSTEM', userEmail: 'System',
      action: 'SYSTEM_BOOT', details: 'SwiftPolicy Environment Initialized Successfully', ipAddress: '127.0.0.1'
    }];

    localStorage.setItem('sp_users', JSON.stringify(initialUsers));
    localStorage.setItem('sp_audit_logs', JSON.stringify(initialLogs));
    localStorage.setItem('sp_client_data', '[]');
    localStorage.setItem('sp_payment_data', '[]');
    localStorage.setItem('sp_claims', '[]');
    localStorage.setItem('sp_contact_messages', '[]');
    localStorage.setItem('sp_mid_submissions', '[]');
  }, []);

  const loadData = useCallback(() => {
    seedInitialData();
    setUsers(JSON.parse(localStorage.getItem('sp_users') || '[]'));
    setPolicies(JSON.parse(localStorage.getItem('sp_client_data') || '[]'));
    setPayments(JSON.parse(localStorage.getItem('sp_payment_data') || '[]'));
    setClaims(JSON.parse(localStorage.getItem('sp_claims') || '[]'));
    setAuditLogs(JSON.parse(localStorage.getItem('sp_audit_logs') || '[]'));
    setInquiries(JSON.parse(localStorage.getItem('sp_contact_messages') || '[]'));
    setMidSubmissions(JSON.parse(localStorage.getItem('sp_mid_submissions') || '[]'));
  }, [seedInitialData]);

  const seedMockEnvironment = useCallback(() => {
    const mockUsers: User[] = [
      { id: 'ADMIN-MASTER', name: 'System Admin', email: 'admin@swiftpolicy.co.uk', role: 'admin', status: 'Active', createdAt: new Date().toISOString() },
      { id: 'USER-1', name: 'James Thompson', email: 'james@example.com', role: 'customer', status: 'Active', createdAt: new Date().toISOString(), riskLevel: 'Low', kyc_status: 'VERIFIED' },
      { id: 'USER-2', name: 'Sarah Miller', email: 'sarah@example.com', role: 'customer', status: 'Active', createdAt: new Date().toISOString(), riskLevel: 'Medium', risk_flag: true, internalNotes: 'High volume of claims historically' },
      { id: 'USER-3', name: 'Robert Lynch', email: 'robert@example.com', role: 'customer', status: 'Frozen', createdAt: new Date().toISOString(), riskLevel: 'High', compliance_status: 'REVIEW_REQUIRED' }
    ];

    const mockPolicies: Policy[] = [
      { id: 'POL-MOCK-001', userId: 'USER-1', type: 'Comprehensive Cover', duration: '12 Months', premium: '£3,450.00', status: 'Active', midStatus: 'Success', details: { vrm: 'BT19 KYX', make: 'BMW', model: '3 Series' } },
      { id: 'POL-MOCK-002', userId: 'USER-2', type: 'Third Party Insurance', duration: '12 Months', premium: '£1,890.00', status: 'Active', midStatus: 'Pending', details: { vrm: 'GF21 UOP', make: 'Ford', model: 'Fiesta' } },
      { id: 'POL-MOCK-003', userId: 'USER-3', type: 'Motorcycle Insurance', duration: '1 Month', premium: '£640.00', status: 'Frozen', midStatus: 'Failed', details: { vrm: 'MT09 HJK', make: 'Yamaha', model: 'MT-09' } }
    ];

    const mockPayments: PaymentRecord[] = [
      { id: 'PAY-001', policyId: 'POL-MOCK-001', userId: 'USER-1', date: new Date().toISOString(), amount: '£3,450.00', type: 'Full Payment', status: 'Paid in Full', method: 'Visa •••• 4242', reference: 'SWIFT-101', description: 'Policy Full Payment', policyDetails: { vrm: 'BT19 KYX', make: 'BMW', model: '3 Series', coverLevel: 'Comprehensive', insurer: 'SwiftPolicy', renewalDate: '2026-05-01' } },
      { id: 'PAY-002', policyId: 'POL-MOCK-002', userId: 'USER-2', date: new Date().toISOString(), amount: '£157.50', type: 'Monthly Installment', status: 'Payment Successful', method: 'Direct Debit', reference: 'SWIFT-102', description: 'Monthly Installment 1/12', policyDetails: { vrm: 'GF21 UOP', make: 'Ford', model: 'Fiesta', coverLevel: 'Third Party', insurer: 'SwiftPolicy', renewalDate: '2026-02-15' } }
    ];

    const mockClaims: Claim[] = [
      { id: 'CLM-001', policyId: 'POL-MOCK-002', userId: 'USER-2', date: new Date().toISOString(), type: 'Accident', description: 'Minor bumper scuff in supermarket car park.', status: 'Under Review', timestamp: new Date().toISOString() }
    ];

    const mockLogs: AuditLog[] = [
      { id: 'LOG-SEED', timestamp: new Date().toISOString(), userId: 'SYSTEM', userEmail: 'System', action: 'ENV_SEED', details: 'Functional mock environment seeded for verification', ipAddress: '127.0.0.1' }
    ];

    localStorage.setItem('sp_users', JSON.stringify(mockUsers.map(u => ({ ...u, password: 'Password123!' }))));
    localStorage.setItem('sp_client_data', JSON.stringify(mockPolicies));
    localStorage.setItem('sp_payment_data', JSON.stringify(mockPayments));
    localStorage.setItem('sp_claims', JSON.stringify(mockClaims));
    localStorage.setItem('sp_audit_logs', JSON.stringify(mockLogs));
    
    loadData();
    alert('Mock Environment Bootstrapped. 4 Users, 3 Policies, and 2 Payments added.');
  }, [loadData]);

  useEffect(() => {
    loadData();
    const savedUser = localStorage.getItem('sp_session');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
      const current = allUsers.find((existing: any) => existing.id === u.id);
      if (current && ['Blocked', 'Deleted', 'Locked', 'Removed'].includes(current.status)) {
        setUser(null);
        localStorage.removeItem('sp_session');
      } else if (current) {
        const { password, ...safeUser } = current;
        setUser(safeUser);
      } else if (u.id === 'ADMIN-MASTER') {
        setUser(u);
      }
    }
    setIsLoading(false);
  }, [loadData]);

  const addAuditLog = useCallback((action: string, details: string, targetId?: string, reason?: string) => {
    const logs = JSON.parse(localStorage.getItem('sp_audit_logs') || '[]');
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: user?.id || 'SYSTEM',
      userEmail: user?.email || 'System',
      targetId, action, details,
      reason: reason || 'N/A',
      ipAddress: '82.16.24.102'
    };
    const updated = [newLog, ...logs].slice(0, 2000);
    localStorage.setItem('sp_audit_logs', JSON.stringify(updated));
    setAuditLogs(updated);
  }, [user]);

  const runDiagnostics = async (): Promise<DiagnosticReport> => {
    await new Promise(r => setTimeout(r, 2000));
    const checks: DiagnosticReport['checks'] = [];
    let overallStatus: 'Healthy' | 'Warning' | 'Critical' = 'Healthy';

    // 1. Storage Health
    const storageKeys = ['sp_users', 'sp_client_data', 'sp_payment_data', 'sp_audit_logs', 'sp_mid_submissions'];
    let storageFail = false;
    storageKeys.forEach(key => {
      try {
        JSON.parse(localStorage.getItem(key) || '[]');
      } catch (e) {
        storageFail = true;
        checks.push({ name: `Storage: ${key}`, result: 'Fail', message: 'Data corruption detected', timestamp: new Date().toISOString() });
      }
    });
    
    if (storageFail) {
      overallStatus = 'Critical';
    } else {
      checks.push({ name: 'Data Persistence', result: 'Pass', message: 'All local data stores are syntactically valid', timestamp: new Date().toISOString() });
    }

    // 2. Pricing Integrity Audit
    let pricingAnomalies = 0;
    policies.forEach(p => {
      const prem = parseFloat(p.premium.replace('£', '').replace(',', ''));
      if (p.duration === '12 Months') {
        if (p.type === 'Comprehensive Cover' && (prem < 3000 || prem > 4000)) pricingAnomalies++;
        if (p.type === 'Third Party Insurance' && (prem < 1400 || prem > 3000)) pricingAnomalies++;
        if (p.type === 'Motorcycle Insurance' && (prem < 500 || prem > 1500)) pricingAnomalies++;
      } else {
        if (prem < 400 || prem > 800) pricingAnomalies++;
      }
    });

    if (pricingAnomalies > 0) {
      checks.push({ name: 'Pricing Engine Consistency', result: 'Warning', message: `${pricingAnomalies} policies detected with premiums outside expected actuarial brackets`, timestamp: new Date().toISOString() });
      if (overallStatus !== 'Critical') overallStatus = 'Warning';
    } else if (policies.length > 0) {
      checks.push({ name: 'Pricing Engine Consistency', result: 'Pass', message: 'All premiums sit within valid risk brackets', timestamp: new Date().toISOString() });
    }

    return { status: overallStatus, checks };
  };

  const generatePolicyPDF = useCallback(async (policyId: string): Promise<string | null> => {
    const allPolicies = JSON.parse(localStorage.getItem('sp_client_data') || '[]');
    const policyIdx = allPolicies.findIndex((p: any) => p.id === policyId);
    if (policyIdx === -1) return null;

    const policy = allPolicies[policyIdx];
    if (policy.status !== 'Active') return null; // No PDF for non-active policies

    const targetUser = JSON.parse(localStorage.getItem('sp_users') || '[]').find((u: any) => u.id === policy.userId);
    
    await new Promise(r => setTimeout(r, 1200));

    const commencementDate = new Date(policy.validatedAt || policy.details?.policyStartDate || Date.now());
    let expiryDateObj = new Date(commencementDate);

    if (policy.duration === '1 Month') {
      expiryDateObj.setMonth(expiryDateObj.getMonth() + 1);
    } else {
      expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1);
    }

    const startDateStr = commencementDate.toLocaleDateString();
    const expiryDateStr = expiryDateObj.toLocaleDateString();

    const pdfContent = `
SWIFTPOLICY INSURANCE SERVICES - ${policy.duration === '1 Month' ? 'OFFICIAL 1-MONTH' : 'OFFICIAL ANNUAL'} CERTIFICATE OF MOTOR INSURANCE
-------------------------------------------------------------------------
DOCUMENT ID: CERT-${policy.id}-${Math.floor(Math.random()*10000)}
POLICY NUMBER: ${policy.id}
STATUS: ACTIVE (ENFORCED)
TERM: ${policy.duration.toUpperCase()}
-------------------------------------------------------------------------
1. DESCRIPTION OF VEHICLE
Registration Mark: ${policy.details?.vrm || 'N/A'}
Make/Model: ${policy.details?.make} ${policy.details?.model}

2. POLICYHOLDER DETAILS
Name: ${targetUser?.name || 'Valued Customer'}
Address: ${policy.details?.addressLine1 || 'On File'}, ${policy.details?.city || 'UK'}

3. EFFECTIVE DATES OF COVER
Commencement: ${startDateStr} 00:01
Expiry: ${expiryDateStr} 23:59

4. COVERAGE TYPE & PREMIUM
Level: ${policy.type}
Term: ${policy.duration}
Total Premium (Inc. IPT): ${policy.premium}

5. PERSONS OR CLASSES OF PERSONS ENTITLED TO DRIVE
The Policyholder as named in section 2.

6. LIMITATIONS AS TO USE
Use for social, domestic and pleasure purposes and use by the 
Policyholder in person in connection with his or her business.
-------------------------------------------------------------------------
REGULATORY INFORMATION
Authorised by the Prudential Regulation Authority and regulated by the 
Financial Conduct Authority (FRN: 481413).
-------------------------------------------------------------------------
THIS DOCUMENT IS A LEGALLY BINDING CERTIFICATE OF INSURANCE.
    `.trim();

    return new Promise((resolve) => {
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        allPolicies[policyIdx].pdfUrl = base64data;
        localStorage.setItem('sp_client_data', JSON.stringify(allPolicies));
        setPolicies(allPolicies);
        addAuditLog('POLICY_PDF_GENERATED', `Regulatory ${policy.duration} Certificate Issued for ${policyId}`, policyId);
        resolve(base64data);
      };
      reader.readAsDataURL(blob);
    });
  }, [addAuditLog]);

  const validatePolicy = useCallback(async (id: string): Promise<boolean> => {
    const allPolicies = JSON.parse(localStorage.getItem('sp_client_data') || '[]');
    const idx = allPolicies.findIndex((p: any) => p.id === id);
    if (idx === -1) return false;

    const policy = allPolicies[idx];
    if (policy.status !== 'Pending Validation') return false;

    allPolicies[idx].status = 'Active';
    allPolicies[idx].validatedAt = new Date().toISOString();
    allPolicies[idx].details.policyStartDate = new Date().toISOString().split('T')[0];
    
    localStorage.setItem('sp_client_data', JSON.stringify(allPolicies));
    setPolicies(allPolicies);
    addAuditLog('ADMIN_POLICY_VALIDATION', `Policy ${id} activated by administrator.`, id);
    
    // Automatically trigger PDF generation now that it is active
    await generatePolicyPDF(id);
    return true;
  }, [addAuditLog, generatePolicyPDF]);

  const bindPolicyManual = useCallback(async (userId: string, data: any): Promise<boolean> => {
    const allPolicies = JSON.parse(localStorage.getItem('sp_client_data') || '[]');
    const isShortTerm = data.duration === '1 Month';
    
    const newPolicy: Policy = {
      id: `POL-${isShortTerm ? 'ST' : 'AN'}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      userId,
      type: data.type,
      duration: data.duration || '12 Months',
      premium: `£${data.premium}`,
      status: isShortTerm ? 'Pending Validation' : 'Active',
      details: data.details,
      midStatus: 'Pending'
    };
    
    const updated = [newPolicy, ...allPolicies];
    localStorage.setItem('sp_client_data', JSON.stringify(updated));
    setPolicies(updated);
    addAuditLog('POLICY_REQUEST_CREATED', `New ${newPolicy.duration} policy requested. Initial Status: ${newPolicy.status}`, newPolicy.id, data.reason);
    
    if (newPolicy.status === 'Active') {
      await generatePolicyPDF(newPolicy.id);
    }
    
    return true;
  }, [addAuditLog, generatePolicyPDF]);

  const downloadPDF = useCallback((policyId: string) => {
    const allPolicies = JSON.parse(localStorage.getItem('sp_client_data') || '[]');
    const policy = allPolicies.find((p: any) => p.id === policyId);
    if (!policy || !policy.pdfUrl) return;

    const link = document.createElement('a');
    link.href = policy.pdfUrl;
    link.download = `SwiftPolicy_Certificate_${policy.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const performMIDUpload = useCallback(async (submission: MIDSubmission) => {
    await new Promise(r => setTimeout(r, 2000));
    const currentSubs = JSON.parse(localStorage.getItem('sp_mid_submissions') || '[]');
    const idx = currentSubs.findIndex((s: any) => s.id === submission.id);
    if (idx === -1) return;

    const isSuccess = Math.random() > 0.1;
    if (isSuccess) {
      currentSubs[idx].status = 'Success';
      currentSubs[idx].responseData = `HTTP/1.1 200 OK\nMIB-TXN-ID: ${Math.random().toString(36).toUpperCase()}\nStatus: ACCEPTED`;
      const currentPolicies = JSON.parse(localStorage.getItem('sp_client_data') || '[]');
      const pIdx = currentPolicies.findIndex((p: any) => p.id === submission.policyId);
      if (pIdx !== -1) {
        currentPolicies[pIdx].midStatus = 'Success';
        localStorage.setItem('sp_client_data', JSON.stringify(currentPolicies));
        setPolicies(currentPolicies);
      }
      addAuditLog('MID_TX_SUCCESS', `Asset ${submission.vrm} synced to national database`, submission.id);
    } else {
      currentSubs[idx].status = 'Failed';
      currentSubs[idx].retryCount += 1;
      currentSubs[idx].responseData = 'HTTP/1.1 503 SERVICE UNAVAILABLE\nGateway Timeout';
      addAuditLog('MID_TX_FAILURE', `Submission failure for ${submission.vrm}`, submission.id);
    }
    currentSubs[idx].lastAttemptAt = new Date().toISOString();
    localStorage.setItem('sp_mid_submissions', JSON.stringify(currentSubs));
    setMidSubmissions(currentSubs);
  }, [addAuditLog]);

  const processMIDQueue = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      const subs = JSON.parse(localStorage.getItem('sp_mid_submissions') || '[]');
      const pending = subs.filter((s: any) => s.status === 'Pending' || s.status === 'Retrying');
      for (const item of pending) {
        await performMIDUpload(item);
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [performMIDUpload]);

  useEffect(() => {
    const interval = setInterval(processMIDQueue, 10000);
    return () => clearInterval(interval);
  }, [processMIDQueue]);

  const queueMIDSubmission = useCallback((policyId: string, vrm: string) => {
    const subs = JSON.parse(localStorage.getItem('sp_mid_submissions') || '[]');
    if (subs.find((s: any) => s.policyId === policyId)) return;

    const newSub: MIDSubmission = {
      id: `MID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      policyId, vrm, status: 'Pending',
      submittedAt: new Date().toISOString(),
      retryCount: 0
    };
    const updated = [newSub, ...subs];
    localStorage.setItem('sp_mid_submissions', JSON.stringify(updated));
    setMidSubmissions(updated);
    addAuditLog('MID_EVENT_RECEIVED', `Policy ${policyId} intercepted for registry update`, newSub.id);
    setTimeout(processMIDQueue, 1000);
  }, [addAuditLog, processMIDQueue]);

  useEffect(() => {
    const activePolicies = policies.filter(p => p.status === 'Active');
    const existingMIDPolicyIds = new Set(midSubmissions.map(s => s.policyId));
    
    activePolicies.forEach(p => {
      if (!existingMIDPolicyIds.has(p.id)) {
        queueMIDSubmission(p.id, p.details?.vrm || 'UNKNOWN');
      }
    });
  }, [policies, midSubmissions, queueMIDSubmission]);

  const checkAskMID = async (vrm: string) => {
    await new Promise(r => setTimeout(r, 1500));
    const normalized = vrm.replace(/\s/g, '').toUpperCase();
    const submission = midSubmissions.find(s => s.vrm.replace(/\s/g, '').toUpperCase() === normalized && s.status === 'Success');
    
    if (submission) {
      return { 
        found: true, 
        status: 'INSURED', 
        message: `Asset ${vrm} is listed on the Motor Insurance Database as of ${new Date().toLocaleDateString()}.` 
      };
    }
    return { 
      found: false, 
      message: `No active insurance record found for ${vrm} in the national database.` 
    };
  };

  const retryMIDSubmission = async (submissionId: string) => {
    const subs = JSON.parse(localStorage.getItem('sp_mid_submissions') || '[]');
    const idx = subs.findIndex((s: any) => s.id === submissionId);
    if (idx !== -1) {
      subs[idx].status = 'Retrying';
      localStorage.setItem('sp_mid_submissions', JSON.stringify(subs));
      setMidSubmissions(subs);
      await performMIDUpload(subs[idx]);
      return true;
    }
    return false;
  };

  const login = async (email: string, pass: string) => {
    await new Promise(r => setTimeout(r, 600));
    const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const normalizedEmail = email.toLowerCase();
    
    const foundIdx = allUsers.findIndex((u: any) => u.email.toLowerCase() === normalizedEmail);
    if (foundIdx === -1) return { success: false, message: 'Identity not found.' };

    const found = allUsers[foundIdx];
    if (found.password === pass) {
      if (['Blocked', 'Deleted', 'Locked', 'Frozen', 'Removed'].includes(found.status)) {
        return { success: false, message: `Access Restricted: ${found.status}.` };
      }
      const { password, ...sessionUser } = found;
      allUsers[foundIdx].lastLogin = new Date().toISOString();
      localStorage.setItem('sp_users', JSON.stringify(allUsers));
      setUsers(allUsers);
      setUser(sessionUser);
      localStorage.setItem('sp_session', JSON.stringify(sessionUser));
      return { success: true, message: 'Verified.' };
    }
    return { success: false, message: 'Invalid credentials.' };
  };

  const signup = async (name: string, email: string, pass: string) => {
    const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    if (allUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) return false;
    const newUser: any = { 
      id: Math.random().toString(36).substr(2, 9), name, email: email.toLowerCase(), 
      role: 'customer', status: 'Active', createdAt: new Date().toISOString(),
      password: pass, riskLevel: 'Low', isSuspicious: false, kyc_status: 'NONE', compliance_status: 'GOOD'
    };
    const updated = [...allUsers, newUser];
    localStorage.setItem('sp_users', JSON.stringify(updated));
    setUsers(updated);
    const { password, ...sessionUser } = newUser;
    setUser(sessionUser);
    localStorage.setItem('sp_session', JSON.stringify(sessionUser));
    return true;
  };

  const requestPasswordReset = async (email: string) => {
    const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const found = allUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      const token = Math.random().toString(36).substr(2, 12);
      const resets = JSON.parse(localStorage.getItem('sp_resets') || '[]');
      resets.push({ email: email.toLowerCase(), token, expiry: Date.now() + 3600000 });
      localStorage.setItem('sp_resets', JSON.stringify(resets));
      addAuditLog('AUTH_RECOVERY_INIT', `Reset requested for ${email}`);
      return true;
    }
    return false;
  };

  const resetPasswordWithToken = async (token: string, newPass: string) => {
    const resets = JSON.parse(localStorage.getItem('sp_resets') || '[]');
    const idx = resets.findIndex((r: any) => r.token === token && r.expiry > Date.now());
    if (idx === -1) return false;

    const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const uIdx = allUsers.findIndex((u: any) => u.email.toLowerCase() === resets[idx].email);
    if (uIdx !== -1) {
      allUsers[uIdx].password = newPass;
      localStorage.setItem('sp_users', JSON.stringify(allUsers));
      setUsers(allUsers);
      resets.splice(idx, 1);
      localStorage.setItem('sp_resets', JSON.stringify(resets));
      addAuditLog('AUTH_RECOVERY_COMPLETED', `Password reset via token`);
      return true;
    }
    return false;
  };

  const updateUserStatus = (id: string, status: UserStatus, reason: string) => {
    const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const idx = allUsers.findIndex((u: any) => u.id === id);
    if (idx !== -1) {
      allUsers[idx].status = status;
      localStorage.setItem('sp_users', JSON.stringify(allUsers));
      setUsers(allUsers);
      addAuditLog('USER_STATUS_CHANGE', `Status set to ${status}`, id, reason);
    }
  };

  const updateUserRisk = (id: string, risk: RiskLevel, riskFlag: boolean, internalNotes: string) => {
    const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const idx = allUsers.findIndex((u: any) => u.id === id);
    if (idx !== -1) {
      allUsers[idx].riskLevel = risk;
      allUsers[idx].risk_flag = riskFlag;
      allUsers[idx].internalNotes = internalNotes;
      localStorage.setItem('sp_users', JSON.stringify(allUsers));
      setUsers(allUsers);
      addAuditLog('RISK_PROFILE_MOD', `Risk: ${risk}, Flag: ${riskFlag}`, id);
    }
  };

  const setComplianceStatus = (id: string, status: ComplianceStatus, reason: string) => {
    const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const idx = allUsers.findIndex((u: any) => u.id === id);
    if (idx !== -1) {
      allUsers[idx].compliance_status = status;
      localStorage.setItem('sp_users', JSON.stringify(allUsers));
      setUsers(allUsers);
      addAuditLog('COMPLIANCE_STATUS_CHANGE', `Compliance: ${status}`, id, reason);
    }
  };

  const setKYCStatus = (id: string, status: KYCStatus, reason: string) => {
    const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const idx = allUsers.findIndex((u: any) => u.id === id);
    if (idx !== -1) {
      allUsers[idx].kyc_status = status;
      localStorage.setItem('sp_users', JSON.stringify(allUsers));
      setUsers(allUsers);
      addAuditLog('KYC_STATUS_CHANGE', `KYC: ${status}`, id, reason);
    }
  };

  const blockPayments = (id: string, blocked: boolean, reason: string) => {
    const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const idx = allUsers.findIndex((u: any) => u.id === id);
    if (idx !== -1) {
      allUsers[idx].billing_blocked = blocked;
      localStorage.setItem('sp_users', JSON.stringify(allUsers));
      setUsers(allUsers);
      addAuditLog('BILLING_AUTH_CHANGE', `Blocked: ${blocked}`, id, reason);
    }
  };

  const deleteUserPermanent = (id: string, reason: string) => {
    const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const idx = allUsers.findIndex((u: any) => u.id === id);
    if (idx !== -1) {
      allUsers.splice(idx, 1);
      localStorage.setItem('sp_users', JSON.stringify(allUsers));
      setUsers(allUsers);
      addAuditLog('ACCOUNT_PURGE', `Hard deleted user account.`, id, reason);
    }
  };

  const updatePolicyStatus = (id: string, status: PolicyStatus, reason: string) => {
    const allPolicies = JSON.parse(localStorage.getItem('sp_client_data') || '[]');
    const idx = allPolicies.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      allPolicies[idx].status = status;
      localStorage.setItem('sp_client_data', JSON.stringify(allPolicies));
      setPolicies(allPolicies);
      addAuditLog('POLICY_STATE_CHANGE', `Status: ${status}`, id, reason);
    }
  };

  const deletePolicy = (id: string, reason: string) => {
    const allPolicies = JSON.parse(localStorage.getItem('sp_client_data') || '[]');
    const idx = allPolicies.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      allPolicies.splice(idx, 1);
      localStorage.setItem('sp_client_data', JSON.stringify(allPolicies));
      setPolicies(allPolicies);
      addAuditLog('POLICY_PURGE', `Hard deleted policy record.`, id, reason);
    }
  };

  const updatePolicyDetails = (id: string, updates: Partial<Policy>, reason: string) => {
    const allPolicies = JSON.parse(localStorage.getItem('sp_client_data') || '[]');
    const idx = allPolicies.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      allPolicies[idx] = { ...allPolicies[idx], ...updates };
      localStorage.setItem('sp_client_data', JSON.stringify(allPolicies));
      setPolicies(allPolicies);
      addAuditLog('POLICY_METADATA_UPDATE', `Metadata updated.`, id, reason);
    }
  };

  const updatePaymentStatus = (id: string, status: PaymentRecord['status'], reason: string) => {
    const allPayments = JSON.parse(localStorage.getItem('sp_payment_data') || '[]');
    const idx = allPayments.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      allPayments[idx].status = status;
      localStorage.setItem('sp_payment_data', JSON.stringify(allPayments));
      setPayments(allPayments);
      addAuditLog('PAYMENT_STATUS_CHANGE', `Status: ${status}`, id, reason);
    }
  };

  const markPaymentDispute = (id: string, disputed: boolean, reason: string) => {
    const allPayments = JSON.parse(localStorage.getItem('sp_payment_data') || '[]');
    const idx = allPayments.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      allPayments[idx].dispute = disputed;
      localStorage.setItem('sp_payment_data', JSON.stringify(allPayments));
      setPayments(allPayments);
      addAuditLog('PAYMENT_DISPUTE_FLAG', `Dispute: ${disputed}`, id, reason);
    }
  };

  const submitClaim = async (policyId: string, type: string, description: string) => {
    if (!user || user.status === 'Frozen' || user.status === 'Blocked' || user.status === 'Removed') return false;
    const allClaims = JSON.parse(localStorage.getItem('sp_claims') || '[]');
    const newClaim: Claim = {
      id: `CLM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      policyId, userId: user.id, date: new Date().toISOString(),
      type, description, status: 'Under Review', timestamp: new Date().toISOString()
    };
    const updated = [newClaim, ...allClaims];
    localStorage.setItem('sp_claims', JSON.stringify(updated));
    setClaims(updated);
    addAuditLog('CLAIM_SUBMISSION', `Claim filed for ${policyId}`, newClaim.id);
    return true;
  };

  const updateClaimStatus = (id: string, status: ClaimStatus, internalNotes: string, suspicious: boolean) => {
    const allClaims = JSON.parse(localStorage.getItem('sp_claims') || '[]');
    const idx = allClaims.findIndex((c: any) => c.id === id);
    if (idx !== -1) {
      allClaims[idx].status = status;
      allClaims[idx].internalNotes = internalNotes;
      allClaims[idx].fraud_flag = suspicious;
      localStorage.setItem('sp_claims', JSON.stringify(allClaims));
      setClaims(allClaims);
      addAuditLog('CLAIM_DECISION', `Status: ${status}`, id);
    }
  };

  const submitInquiry = async (data: Partial<ContactMessage>) => {
    await new Promise(r => setTimeout(r, 1200));
    const current = JSON.parse(localStorage.getItem('sp_contact_messages') || '[]');
    const newMessage = { id: `MSG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, ...data, status: 'Unread', timestamp: new Date().toISOString() } as ContactMessage;
    const updated = [newMessage, ...current];
    localStorage.setItem('sp_contact_messages', JSON.stringify(updated));
    setInquiries(updated);
    addAuditLog('EMAIL_DISPATCHED', `Support inquiry routed to info@swiftpolicy.co.uk`, newMessage.id);
    return true;
  };

  const markInquiryAsRead = (id: string) => {
    const current = JSON.parse(localStorage.getItem('sp_contact_messages') || '[]');
    const idx = current.findIndex((m: any) => m.id === id);
    if (idx !== -1) {
      current[idx].status = 'Read';
      localStorage.setItem('sp_contact_messages', JSON.stringify(current));
      setInquiries(current);
    }
  };

  const deleteInquiry = (id: string) => {
    const current = JSON.parse(localStorage.getItem('sp_contact_messages') || '[]');
    const updated = current.filter((m: any) => m.id !== id);
    localStorage.setItem('sp_contact_messages', JSON.stringify(updated));
    setInquiries(updated);
  };

  const logout = () => { setUser(null); localStorage.removeItem('sp_session'); };

  return (
    <AuthContext.Provider value={{ 
      user, login, signup, logout, requestPasswordReset, resetPasswordWithToken, isLoading,
      users, policies, payments, claims, auditLogs, inquiries, midSubmissions,
      updateUserStatus, updateUserRisk, setComplianceStatus, deleteUserPermanent, setKYCStatus, blockPayments,
      updatePolicyStatus, updatePolicyDetails, updatePaymentStatus, markPaymentDispute, updateClaimStatus, submitClaim,
      bindPolicyManual, validatePolicy, submitInquiry, markInquiryAsRead, deleteInquiry,
      queueMIDSubmission, retryMIDSubmission, checkAskMID, refreshData: loadData,
      generatePolicyPDF, downloadPDF, deletePolicy, runDiagnostics, seedMockEnvironment
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
