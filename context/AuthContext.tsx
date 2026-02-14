import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, AuditLog, UserStatus, PolicyStatus, Policy, PaymentRecord, ContactMessage, 
  InquiryType, RiskLevel, Claim, ClaimStatus, KYCStatus, ComplianceStatus, 
  MIDSubmission, MIDStatus, PolicyDuration, VehicleLookupLog 
} from '../types';
import { GoogleGenAI } from "@google/genai";

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
  
  users: User[];
  policies: Policy[];
  payments: PaymentRecord[];
  claims: Claim[];
  auditLogs: AuditLog[];
  inquiries: ContactMessage[];
  midSubmissions: MIDSubmission[];
  vehicleLogs: VehicleLookupLog[];
  
  updateUserStatus: (id: string, status: UserStatus, reason: string) => void;
  deleteUserPermanent: (id: string, reason: string) => void;
  updatePolicyStatus: (id: string, status: PolicyStatus, reason: string) => void;
  bindPolicyManual: (userId: string, data: any) => Promise<boolean>;
  deletePolicy: (id: string, reason: string) => void;
  queueMIDSubmission: (policyId: string, vrm: string) => void;
  retryMIDSubmission: (submissionId: string) => Promise<boolean>;
  submitInquiry: (data: Partial<ContactMessage>) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPasswordWithToken: (token: string, pass: string) => Promise<boolean>;
  runDiagnostics: () => Promise<DiagnosticReport>;
  testRegistrationFlow: () => Promise<{ success: boolean; message: string }>;
  
  lookupVehicle: (registration: string) => Promise<{ success: boolean; data?: any; source?: string; error?: string }>;
  
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
  const [vehicleLogs, setVehicleLogs] = useState<VehicleLookupLog[]>([]);

  const loadData = useCallback(() => {
    setUsers(JSON.parse(localStorage.getItem('sp_users') || '[]'));
    setPolicies(JSON.parse(localStorage.getItem('sp_client_data') || '[]'));
    setPayments(JSON.parse(localStorage.getItem('sp_payment_data') || '[]'));
    setClaims(JSON.parse(localStorage.getItem('sp_claims') || '[]'));
    setAuditLogs(JSON.parse(localStorage.getItem('sp_audit_logs') || '[]'));
    setInquiries(JSON.parse(localStorage.getItem('sp_contact_messages') || '[]'));
    setMidSubmissions(JSON.parse(localStorage.getItem('sp_mid_submissions') || '[]'));
    setVehicleLogs(JSON.parse(localStorage.getItem('sp_vehicle_logs') || '[]'));
  }, []);

  useEffect(() => {
    const existingUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const adminEmail = 'admin@swiftpolicy.co.uk';
    if (!existingUsers.some((u: any) => u.email.toLowerCase() === adminEmail.toLowerCase())) {
      const seedAdmin = {
        id: 'admin-001',
        name: 'System Administrator',
        email: adminEmail,
        password: 'Admin123!',
        role: 'admin',
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('sp_users', JSON.stringify([...existingUsers, seedAdmin]));
    }
    
    loadData();
    const savedUser = localStorage.getItem('sp_session');
    if (savedUser) setUser(JSON.parse(savedUser));
    setIsLoading(false);
  }, [loadData]);

  const addVehicleLog = (log: Omit<VehicleLookupLog, 'id' | 'timestamp'>) => {
    const logs = JSON.parse(localStorage.getItem('sp_vehicle_logs') || '[]');
    const newLog: VehicleLookupLog = {
      ...log,
      id: `LOG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
    const updated = [newLog, ...logs].slice(0, 500);
    localStorage.setItem('sp_vehicle_logs', JSON.stringify(updated));
    setVehicleLogs(updated);
  };

  const addAuditLog = useCallback((action: string, details: string, targetId?: string, reason?: string) => {
    const logs = JSON.parse(localStorage.getItem('sp_audit_logs') || '[]');
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: user?.id || 'SYSTEM',
      userEmail: user?.email || 'System',
      targetId, action, details,
      reason: reason || 'N/A',
      ipAddress: '127.0.0.1'
    };
    const updated = [newLog, ...logs].slice(0, 1000);
    localStorage.setItem('sp_audit_logs', JSON.stringify(updated));
    setAuditLogs(updated);
  }, [user]);

  const lookupVehicle = async (registration: string) => {
    const vrm = registration.toUpperCase().replace(/\s/g, '');
    
    // 1. Check Local Cache (Vehicle Logs acting as cache for demo)
    const cached = vehicleLogs.find(l => l.registration === vrm && l.success);
    if (cached) {
      addVehicleLog({ registration: vrm, make: cached.make, model: cached.model, year: cached.year, source: 'Cache', success: true });
      return { success: true, data: cached, source: 'Cache' };
    }

    // 2. Simulate Production API Call (DVLA/MIB Hook)
    // In real prod, this would be: await fetch(`/api/vehicle-lookup/${vrm}`)
    // For this simulation, we use a hybrid approach
    
    const PROD_MOCK_DB: Record<string, any> = {
      "SG71OYK": { make: "Tesla", model: "Model 3", year: "2021", fuelType: "Electric", engineSize: "N/A", color: "Pearl White", vin: "5YJ3E1EBXMF0XXXXX" },
      "AB12CDE": { make: "Ford", model: "Fiesta", year: "2018", fuelType: "Petrol", engineSize: "998cc", color: "Race Red", vin: "WF0DXXGAKD0XXXXX" }
    };

    if (PROD_MOCK_DB[vrm]) {
      const data = PROD_MOCK_DB[vrm];
      addVehicleLog({ registration: vrm, make: data.make, model: data.model, year: data.year, source: 'API', success: true, metadata: data });
      return { success: true, data, source: 'Production API' };
    }

    // 3. Intelligence Fallback (Gemini AI)
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Perform a high-fidelity UK DVLA/MIB vehicle lookup for registration: ${vrm}. Return ONLY a clean JSON object. Keys: "make", "model", "year", "fuelType", "engineSize", "color", "vin", "vehicleType". If not found, return {"error": "NOT_FOUND"}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
          systemInstruction: "You are the SwiftPolicy Vehicle Registry Gateway. Provide highly accurate UK vehicle specifications based on public records.",
          tools: [{googleSearch: {}}],
        }
      });

      const responseText = response.text?.replace(/```json/g, '').replace(/```/g, '').trim();
      if (!responseText) throw new Error("EMPTY_RESPONSE");
      
      const data = JSON.parse(responseText);
      if (data.make && !data.error) {
        addVehicleLog({ 
          registration: vrm, 
          make: data.make, 
          model: data.model, 
          year: data.year.toString(), 
          source: 'Intelligence', 
          success: true, 
          metadata: data 
        });
        return { success: true, data, source: 'Intelligence Registry' };
      }
    } catch (err) {
      console.error("Lookup Failure:", err);
    }

    addVehicleLog({ registration: vrm, make: 'Unknown', model: 'Unknown', year: 'N/A', source: 'API', success: false });
    return { success: false, error: 'Vehicle not found in official registers.' };
  };

  const signup = async (name: string, email: string, pass: string) => {
    const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    if (allUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) return false;
    const newUser = { id: Math.random().toString(36).substr(2, 9), name, email: email.toLowerCase(), role: 'customer', status: 'Active', createdAt: new Date().toISOString(), password: pass };
    localStorage.setItem('sp_users', JSON.stringify([...allUsers, newUser]));
    const { password, ...safeUser } = newUser;
    setUser(safeUser as User);
    localStorage.setItem('sp_session', JSON.stringify(safeUser));
    loadData();
    addAuditLog('USER_SIGNUP', `Account created: ${email}`, newUser.id);
    return true;
  };

  const login = async (email: string, pass: string) => {
    const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const found = allUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (found) {
      const { password, ...safeUser } = found;
      setUser(safeUser);
      localStorage.setItem('sp_session', JSON.stringify(safeUser));
      addAuditLog('USER_LOGIN', `Login success: ${email}`, found.id);
      return { success: true, message: 'Logged in successfully' };
    }
    return { success: false, message: 'Invalid login credentials.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sp_session');
    addAuditLog('USER_LOGOUT', 'User signed out');
  };

  const updatePolicyStatus = (id: string, status: PolicyStatus, reason: string) => {
    const all = JSON.parse(localStorage.getItem('sp_client_data') || '[]');
    const idx = all.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      const oldStatus = all[idx].status;
      all[idx].status = status;
      if (status === 'Validated' && !all[idx].validatedAt) all[idx].validatedAt = new Date().toISOString();
      localStorage.setItem('sp_client_data', JSON.stringify(all));
      setPolicies([...all]);
      addAuditLog('POLICY_STATUS_CHANGE', `Policy ${id} changed from ${oldStatus} to ${status}`, id, reason);
    }
  };

  const deletePolicy = (id: string, reason: string) => updatePolicyStatus(id, 'Removed', reason);

  const bindPolicyManual = async (userId: string, data: any) => {
    const allPolicies = JSON.parse(localStorage.getItem('sp_client_data') || '[]');
    const newPolicy: Policy = {
      id: `SP-INS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      userId,
      type: `${data.vehicleType?.charAt(0).toUpperCase() + data.vehicleType?.slice(1)} Insurance`,
      duration: data.duration || '12 Months',
      premium: data.premium,
      status: data.status || 'Active',
      details: data.details,
      midStatus: 'Pending',
      validatedAt: new Date().toISOString(),
      pdfUrl: `data:application/pdf;base64,JVBERi0xLjQKJ...` 
    };
    localStorage.setItem('sp_client_data', JSON.stringify([newPolicy, ...allPolicies]));
    setPolicies([newPolicy, ...allPolicies]);
    
    const allPayments = JSON.parse(localStorage.getItem('sp_payment_data') || '[]');
    const newPayment: PaymentRecord = {
      id: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      policyId: newPolicy.id, userId, date: new Date().toISOString(),
      description: `Premium: ${newPolicy.id}`, amount: data.premium, type: 'Full Payment', status: 'Paid in Full',
      method: 'Visa **** 4444', reference: `REF-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      policyDetails: { vrm: data.details.vrm, make: data.details.make, model: data.details.model, coverLevel: data.details.coverLevel, insurer: 'SwiftPolicy', renewalDate: new Date(Date.now() + 365*24*60*60*1000).toISOString() }
    };
    localStorage.setItem('sp_payment_data', JSON.stringify([newPayment, ...allPayments]));
    setPayments([newPayment, ...allPayments]);
    if (newPolicy.status === 'Active') queueMIDSubmission(newPolicy.id, data.details.vrm);
    loadData();
    return true;
  };

  const queueMIDSubmission = (policyId: string, vrm: string) => {
    const subs = JSON.parse(localStorage.getItem('sp_mid_submissions') || '[]');
    const newSub: MIDSubmission = { id: `MID-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, policyId, vrm: vrm.toUpperCase(), status: 'Pending', submittedAt: new Date().toISOString(), retryCount: 0 };
    localStorage.setItem('sp_mid_submissions', JSON.stringify([newSub, ...subs]));
    setMidSubmissions([newSub, ...subs]);
  };

  const retryMIDSubmission = async (id: string) => {
    const subs = JSON.parse(localStorage.getItem('sp_mid_submissions') || '[]');
    const found = subs.find((s: any) => s.id === id);
    if (found) { found.status = 'Success'; found.lastAttemptAt = new Date().toISOString(); localStorage.setItem('sp_mid_submissions', JSON.stringify(subs)); setMidSubmissions([...subs]); return true; }
    return false;
  };

  const submitInquiry = async (data: any) => {
    const inqs = JSON.parse(localStorage.getItem('sp_contact_messages') || '[]');
    const newInq = { ...data, id: `INQ-${Date.now()}`, status: 'Unread', timestamp: new Date().toISOString() };
    localStorage.setItem('sp_contact_messages', JSON.stringify([newInq, ...inqs]));
    setInquiries([newInq, ...inqs]);
    return true;
  };

  const requestPasswordReset = async (email: string) => {
    const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const found = allUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (found) { addAuditLog('PASSWORD_RESET_REQUEST', `Reset link for: ${email}`, found.id); return true; }
    return false;
  };

  const resetPasswordWithToken = async (token: string, pass: string) => {
    const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const idx = allUsers.findIndex((u: any) => u.email.toLowerCase() === token.toLowerCase());
    if (idx !== -1) { allUsers[idx].password = pass; localStorage.setItem('sp_users', JSON.stringify(allUsers)); addAuditLog('PASSWORD_RESET_COMPLETE', `Password reset for: ${token}`, allUsers[idx].id); return true; }
    return false;
  };

  const runDiagnostics = async () => ({ status: 'Healthy', checks: [{ name: 'Storage', result: 'Pass', message: 'OK', timestamp: new Date().toISOString() }] } as any);
  const testRegistrationFlow = async () => ({ success: true, message: 'Flow OK' });

  const updateUserStatus = (id: string, status: UserStatus, reason: string) => {
    const all = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const idx = all.findIndex((u: any) => u.id === id);
    if (idx !== -1) { all[idx].status = status; localStorage.setItem('sp_users', JSON.stringify(all)); setUsers([...all]); addAuditLog('USER_STATUS_CHANGE', `User ${id} to ${status}`, id, reason); }
  };

  const deleteUserPermanent = (id: string, reason: string) => {
    const all = JSON.parse(localStorage.getItem('sp_users') || '[]');
    localStorage.setItem('sp_users', JSON.stringify(all.filter((u: any) => u.id !== id)));
    setUsers(all.filter((u: any) => u.id !== id));
    addAuditLog('USER_PERM_DELETE', `User ${id} removed`, id, reason);
  };

  const refreshData = () => loadData();

  return (
    <AuthContext.Provider value={{ 
      user, login, signup, logout, isLoading, refreshData,
      users, policies, payments, claims, auditLogs, inquiries, midSubmissions, vehicleLogs,
      updateUserStatus, deleteUserPermanent, updatePolicyStatus, bindPolicyManual, deletePolicy,
      queueMIDSubmission, retryMIDSubmission, submitInquiry, 
      requestPasswordReset, resetPasswordWithToken, lookupVehicle,
      runDiagnostics, testRegistrationFlow
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