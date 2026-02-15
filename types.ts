
import React;

export enum InsuranceType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  VAN = 'van',
  LIFE = 'life'
}

export type InquiryType = 'General' | 'Quote' | 'Payment' | 'Claim' | 'Technical' | 'Feedback';
export type UserStatus = 'Active' | 'Blocked' | 'Suspended' | 'Frozen' | 'Deleted' | 'Locked' | 'Removed';
export type PolicyStatus = 'Active' | 'Frozen' | 'Cancelled' | 'Terminated' | 'Expired' | 'Renewed' | 'Pending Validation' | 'Validated' | 'Blocked' | 'Removed';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type ClaimStatus = 'Under Review' | 'Approved' | 'Rejected' | 'Docs Requested';
export type KYCStatus = 'VERIFIED' | 'PENDING' | 'FAILED' | 'NONE';
export type ComplianceStatus = 'GOOD' | 'REVIEW_REQUIRED' | 'FLAGGED';
export type MIDStatus = 'Pending' | 'Success' | 'Failed' | 'Retrying';

export type EnforcedInsuranceType = 'Comprehensive Cover' | 'Third Party Insurance' | 'Motorcycle Insurance';
export type PolicyDuration = '1 Month' | '12 Months';

export interface VehicleLookupLog {
  id: string;
  registration: string;
  make: string;
  model: string;
  year: string;
  source: 'API' | 'Cache' | 'Intelligence' | 'Manual';
  timestamp: string;
  success: boolean;
  metadata?: any;
}

export interface MIDSubmission {
  id: string;
  policyId: string;
  vrm: string;
  status: MIDStatus;
  submittedAt: string;
  lastAttemptAt?: string;
  responseData?: string;
  retryCount: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  type: InquiryType;
  message: string;
  status: 'Unread' | 'Read' | 'Replied';
  timestamp: string;
  consent: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
  lastIp?: string;
  riskLevel?: RiskLevel;
  risk_flag?: boolean;
  isSuspicious?: boolean;
  internalNotes?: string;
  billing_blocked?: boolean;
  kyc_status?: KYCStatus;
  compliance_status?: ComplianceStatus;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string; 
  userEmail: string;
  targetId?: string; 
  action: string;
  details: string;
  ipAddress: string;
  reason?: string;
}

export interface PremiumBreakdown {
  base: number;
  riskAdjustment: number;
  ncbDiscount: number;
  addons: number;
  ipt: number;
  adminFee: number;
  total: number;
  // Financial Transparency Fields
  firstMonthCharge?: number;
  fullAnnualPremium?: number;
  remainingBalance?: number;
}

export interface VehicleDetails {
  vrm: string;
  make: string;
  model: string;
  year: string;
  coverLevel: string;
  licenceNumber: string;
  address: string;
  ncb: string;
  excess: string;
  // Technical Specifications
  vin?: string;
  engineSize?: string;
  fuelType?: string;
  color?: string;
  vehicleType?: string;
  vehicleValue?: string;
  // Metadata for Policy Display
  firstName?: string;
  lastName?: string;
  dob?: string;
  email?: string;
  phone?: string;
  yearsExperience?: string;
  issueDate?: string;
  startDate?: string;
  expiryDate?: string;
  paymentRef?: string;
  paymentFrequency?: 'monthly' | 'annually';
  breakdown?: PremiumBreakdown;
}

export interface Policy {
  id: string;
  userId: string;
  type: string;
  duration: PolicyDuration;
  premium: string;
  status: PolicyStatus;
  details: VehicleDetails;
  riskFlag?: boolean;
  notes?: string;
  midStatus?: MIDStatus;
  pdfUrl?: string;
  validatedAt?: string;
}

export interface Claim {
  id: string;
  policyId: string;
  userId: string;
  date: string;
  type: string;
  description: string;
  status: ClaimStatus;
  internalNotes?: string;
  timestamp: string;
  fraud_flag?: boolean;
}

export interface PaymentRecord {
  id: string;
  policyId: string;
  userId: string;
  date: string;
  description: string;
  amount: string;
  type: 'Full Payment' | 'Monthly Installment';
  status: 'Paid in Full' | 'Payment Successful' | 'Pending' | 'Direct Republic Set Up' | 'Disputed' | 'Refunded' | 'Overdue';
  method: string;
  reference: string;
  bankTransactionId?: string;
  dispute?: boolean;
  policyDetails: {
    vrm: string;
    make: string;
    model: string;
    coverLevel: string;
    insurer: string;
    renewalDate: string;
  };
}

export interface QuoteData {
  vrm: string;
  insurance_type: EnforcedInsuranceType | '';
  duration: PolicyDuration;
  make: string;
  model: string;
  year: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  engineSize: string;
  seats: string;
  isImported: boolean;
  annualMileage: string;
  usageType: string;
  ownership: string;
  isModified: boolean;
  modifications: string;
  securityFeatures: string[];
  overnightParking: string;
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  ukResident: boolean;
  yearsInUk: string;
  occupation: string;
  employmentStatus: string;
  industry: string;
  licenceType: string;
  licenceHeldYears: string;
  licenceDate: string;
  licenceNumber: string;
  hasMedicalConditions: boolean;
  mainDriverHistory: {
    hasConvictions: boolean;
    convictions: any[];
    hasClaims: boolean;
    claims: any[];
  };
  ncbYears: string;
  isCurrentlyInsured: boolean;
  hasPreviousCancellations: boolean;
  additionalDrivers: any[];
  postcode: string;
  addressLine1: string;
  city: string;
  yearsAtAddress: string;
  homeOwnership: string;
  coverLevel: string;
  policyStartDate: string;
  voluntaryExcess: string;
  addons: {
    breakdown: boolean;
    legal: boolean;
    courtesyCar: boolean;
    windscreen: boolean;
    protectedNcb: boolean;
  };
  paymentFrequency: 'monthly' | 'annually';
  payerType: 'individual' | 'company';
  email: string;
  phone: string;
  contactTime: string;
  marketingConsent: boolean;
  dataProcessingConsent: boolean;
  isAccurate: boolean;
  termsAccepted: boolean;
  generated_quote?: number;
  vin?: string;
  color?: string;
  vehicleValue?: string;
}
