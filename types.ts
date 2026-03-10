import React from 'react';

export enum InsuranceType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  VAN = 'van',
  LIFE = 'life'
}

export type InquiryType = 'General' | 'Quote' | 'Payment' | 'Claim' | 'Technical' | 'Feedback';
export type UserStatus = 'Active' | 'Blocked' | 'Suspended' | 'Frozen' | 'Deleted' | 'Locked' | 'Removed' | 'Pending Validation' | 'Validated' | 'Inactive' | 'Pending';
export type PolicyStatus = 'Active' | 'Frozen' | 'Cancelled' | 'Terminated' | 'Expired' | 'Renewed' | 'Pending Validation' | 'Validated' | 'Blocked' | 'Removed' | 'Lapsed' | 'Pending Approval' | 'Approved' | 'Suspended' | 'Deleted';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ClaimStatus = 'Under Review' | 'Approved' | 'Rejected' | 'Docs Requested' | 'Settled' | 'Closed';
export type KYCStatus = 'VERIFIED' | 'PENDING' | 'REJECTED' | 'FAILED' | 'NONE';
export type ComplianceStatus = 'GOOD' | 'REVIEW_REQUIRED' | 'FLAGGED';
export type MIDStatus = 'Pending' | 'Success' | 'Failed' | 'Retrying';

export type EnforcedInsuranceType = 'Comprehensive Cover' | 'Third Party Insurance' | 'Motorcycle Insurance';
export type PolicyDuration = '1 Month' | '12 Months';
export type PolicyType = 'ANNUAL' | 'ONE_MONTH';

export interface Conviction {
  code: string;
  date: string;
  points: number;
  banMonths: number;
}

export interface PastClaim {
  date: string;
  type: 'Fault' | 'Non-Fault' | 'Theft' | 'Windscreen';
  value: string;
}

export interface AdditionalDriver {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  relation: string;
  occupation: string;
  licenceType: string;
}

export interface PaymentRecord {
  id: string;
  policyId: string;
  clientId: string;
  amount: string;
  status: 'Paid' | 'Success' | 'Pending' | 'Failed' | 'Refunded';
  timestamp: string;
  method: string;
  payment_type: string;
  transaction_ref: string;
}

export interface ClaimRecord {
  id: string;
  policyId: string;
  clientId: string;
  claimReference: string;
  dateOfIncident: string;
  status: ClaimStatus;
  amount: number;
  description: string;
  notes: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  clientId: string;
  subject: string;
  type: InquiryType;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedAgent?: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskConfig {
  iptRate: number;
  adminFee: number;
  postcodeMultipliers: Record<string, number>;
  vehicleCategoryMultipliers: Record<string, number>;
  ncbDiscountMax: number;
  minPremium: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Operations' | 'Claims' | 'Finance';
  isActive: boolean;
  lastLogin: string;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  policy_id?: string;
  user_id?: string;
  action_performed: string;
  previous_status?: PolicyStatus | string;
  new_status?: PolicyStatus | string;
  timestamp: string;
}

export interface VehicleLookupLog {
  id: string;
  registration: string;
  make: string;
  model: string;
  year: string;
  source: 'API' | 'Cache' | 'Intelligence' | 'Manual' | 'Authoritative';
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

export interface User {
  id: string;
  client_code: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  address?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  role: 'customer' | 'admin';
  status: UserStatus;
  is_profile_enabled?: boolean;
  account_state?: 'active' | 'inactive' | 'pending' | 'suspended';
  createdAt: string;
  updated_at?: string;
  lastLogin?: string;
  lastIp?: string;
  riskLevel?: RiskLevel;
  risk_factor?: 'low' | 'medium' | 'high' | 'critical';
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
  entityType?: 'USER' | 'POLICY' | 'CLAIM' | 'PAYMENT' | 'SYSTEM' | 'ADMIN';
}

export interface PremiumBreakdown {
  base: number;
  riskAdjustment: number;
  ncbDiscount: number;
  addons: number;
  ipt: number;
  adminFee: number;
  total: number;
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
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  postcode?: string;
  ncb: string;
  excess: string;
  vehicleValue?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  startDate?: string;
  expiryDate?: string;
  paymentRef?: string;
  breakdown?: PremiumBreakdown;
  usageType?: string;
  engineCC?: string;
  engine_size?: string;
  color?: string;
  colour?: string;
  cardLastFour?: string;
  cardholderName?: string;
  cardExpiry?: string;
  addons?: {
    breakdown: boolean;
    legal: boolean;
    courtesyCar: boolean;
    windscreen: boolean;
    protectedNcb: boolean;
    keyCover?: boolean;
  };
}

export interface Policy {
  id: string;
  displayId?: string;
  userId: string;
  type: string;
  policy_type: PolicyType;
  duration: PolicyDuration;
  premium: string;
  status: PolicyStatus;
  isActive: boolean;
  details: VehicleDetails;
  riskFlag?: boolean;
  notes?: string;
  paymentStatus?: 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
  renewalDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteData {
  vrm: string;
  vin?: string;
  insurance_type: EnforcedInsuranceType | '';
  policy_type: PolicyType;
  duration: PolicyDuration;
  make: string;
  model: string;
  year: string;
  fuel_type: string;
  transmission: string;
  body_type: string;
  engine_size: string;
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
  points: number;
  hasConvictions: boolean;
  convictions: Conviction[];
  hasMedicalConditions: boolean;
  mainDriverHistory: {
    hasConvictions: boolean;
    convictions: Conviction[];
    hasClaims: boolean;
    claims: PastClaim[];
  };
  ncbYears: string;
  isCurrentlyInsured: boolean;
  hasPreviousCancellations: boolean;
  additionalDrivers: AdditionalDriver[];
  postcode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  county: string;
  state?: string;
  country?: string;
  yearsAtAddress: string;
  homeOwnership: string;
  coverLevel: string;
  policyStartDate: string;
  voluntaryExcess: string;
  vehicleValue: string;
  color?: string;
  doors?: string;
  engineCC?: string;
  addons: {
    breakdown: boolean;
    legal: boolean;
    courtesyCar: boolean;
    windscreen: boolean;
    protectedNcb: boolean;
    keyCover: boolean;
  };
  paymentFrequency: 'monthly' | 'annually';
  payerType: string;
  email: string;
  phone: string;
  contactTime: string;
  marketingConsent: boolean;
  dataProcessingConsent: boolean;
  isAccurate: boolean;
  termsAccepted: boolean;
  goodsCarried?: string;
  isSignWritten?: boolean;
}