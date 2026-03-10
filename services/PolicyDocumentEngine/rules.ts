import { Policy } from '../../types';

export const generateUseLimitations = (policy: Policy): string[] => {
  const rules = [
    "Use for social domestic and pleasure purposes.",
    "This policy does not cover use for commercial travelling."
  ];

  if (policy.details.usageType === 'Commuting') {
    rules.push("Use for commuting to and from a permanent place of work.");
  } else if (policy.details.usageType === 'Business') {
    rules.push("Use for business purposes by the policyholder.");
  } else {
    rules.push("This policy does not cover use for any business purposes.");
  }

  return rules;
};

export const generateDriverRules = (policy: Policy): string[] => {
  return [
    "Provided the person driving holds a licence to drive the car or has held and is not disqualified from holding or obtaining such a licence.",
    "The policyholder only may also drive a car not owned by them or hired to them under a hire purchase agreement, rental or short term hire agreement or annual leasing agreement and which is not used in connection with the motor trade provided:",
    "•The owner of the car has valid insurance in force on that car which does not cover the policyholder on this policy to drive that car.",
    "•The owner of the car has given the policyholder permission to drive it.",
    "•The car is being driven in Great Britain, Northern Ireland, the Channel Islands or the Isle of Man.",
    "•The car is used within the limitations of use shown below."
  ];
};

export const generateExclusions = (policy: Policy): string[] => {
  return [
    "This policy does not cover use on the Nurburgring Nordschleife, racing, competitions, speed testing, rallies, track days, 4x4 off road events or trials, any purpose in connection with the motor trade, hiring or carrying of passengers for profit.",
    "This policy may not be used to secure the release of a motor vehicle other than the vehicle identified above by its registration mark, which has been seized by or on behalf of any government or public authority."
  ];
};
