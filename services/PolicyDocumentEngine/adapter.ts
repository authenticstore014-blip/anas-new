import { Policy, User } from '../../types';
import { PolicyProjection, InsuredObject } from './types';
import { generateUseLimitations, generateDriverRules, generateExclusions } from './rules';

export const mapToProjection = (policy: Policy, user?: User): PolicyProjection => {
  const effectiveDate = policy.details.startDate || policy.createdAt;
  const expiryDate = policy.details.expiryDate || policy.renewalDate || '';
  const issueDate = policy.createdAt;

  const insuredObject: InsuredObject = {
    registration: policy.details.vrm,
    make: policy.details.make,
    model: policy.details.model,
    description: `${policy.details.make} ${policy.details.model}`.trim()
  };

  const policyholderName = user?.name || `${policy.details.firstName} ${policy.details.lastName}`.trim() || 'Unknown Client';
  const ensureTitlePrefix = (name: string) => {
    const prefixes = ['MR ', 'MRS ', 'MS ', 'MISS ', 'DR ', 'PROF '];
    const upperName = name.toUpperCase();
    if (prefixes.some(p => upperName.startsWith(p))) return name;
    return `MR ${name}`;
  };
  const formattedName = ensureTitlePrefix(policyholderName).toUpperCase();
  const policyholderAddress = user?.address || policy.details.address || 'Address Not Provided';

  return {
    policy_id: policy.id,
    certificate_number: policy.displayId || policy.id,
    issue_date: new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    effective_date: `00:00hrs ${new Date(effectiveDate).toLocaleDateString('en-GB')}`,
    expiry_date: `23:59hrs ${new Date(expiryDate).toLocaleDateString('en-GB')}`,
    policyholder: {
      name: formattedName,
      address: policyholderAddress
    },
    insured_objects: [insuredObject],
    persons_entitled_to_drive: [formattedName],
    driver_eligibility_rules: generateDriverRules(policy),
    use_limitations: generateUseLimitations(policy),
    exclusions: generateExclusions(policy),
    jurisdiction: 'Great Britain, Northern Ireland, the Isle of Man, the Islands of Guernsey, Jersey and Alderney',
    insurer_identity: {
      name: 'SwiftPolicy Insurance UK Plc',
      address: 'Crown House, 27 Old Gloucester Street, London, WC1N 3AX, United Kingdom',
      fca_reference: '481413',
      ceo_name: 'BEN KEDBY',
      ceo_title: 'CEO SwiftPolicy UK & Ireland'
    },
    legal_text_version: 'v2026.03.01',
    certification_language: 'We hereby certify that the policy to which this certificate relates satisfies the requirements of the relevant law applicable in Great Britain, Northern Ireland, the Isle of Man, the Islands of Guernsey, Jersey and Alderney.'
  };
};
