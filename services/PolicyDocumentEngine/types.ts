import { Policy, User } from '../../types';

export interface InsuredObject {
  registration: string;
  make: string;
  model: string;
  description: string;
}

export interface PolicyProjection {
  policy_id: string;
  certificate_number: string;
  issue_date: string;
  effective_date: string;
  expiry_date: string;
  policyholder: {
    name: string;
    address: string;
  };
  insured_objects: InsuredObject[];
  persons_entitled_to_drive: string[];
  driver_eligibility_rules: string[];
  use_limitations: string[];
  exclusions: string[];
  jurisdiction: string;
  insurer_identity: {
    name: string;
    address: string;
    fca_reference: string;
    logo_url?: string;
    signature_url?: string;
    ceo_name: string;
    ceo_title: string;
  };
  legal_text_version: string;
  certification_language: string;
}
