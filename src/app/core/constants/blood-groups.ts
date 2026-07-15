import { BloodGroup } from '../models/blood-group.enum';

/**
 * Compatibility matrix — recipient → list of blood groups whose blood they can safely receive.
 * Source: standard ABO/Rh RBC transfusion rules.
 */
export const RECIPIENT_COMPATIBILITY: Readonly<Record<BloodGroup, readonly BloodGroup[]>> = {
  [BloodGroup.O_NEG]:  [BloodGroup.O_NEG],
  [BloodGroup.O_POS]:  [BloodGroup.O_NEG, BloodGroup.O_POS],
  [BloodGroup.A_NEG]:  [BloodGroup.O_NEG, BloodGroup.A_NEG],
  [BloodGroup.A_POS]:  [BloodGroup.O_NEG, BloodGroup.O_POS, BloodGroup.A_NEG, BloodGroup.A_POS],
  [BloodGroup.B_NEG]:  [BloodGroup.O_NEG, BloodGroup.B_NEG],
  [BloodGroup.B_POS]:  [BloodGroup.O_NEG, BloodGroup.O_POS, BloodGroup.B_NEG, BloodGroup.B_POS],
  [BloodGroup.AB_NEG]: [BloodGroup.O_NEG, BloodGroup.A_NEG, BloodGroup.B_NEG, BloodGroup.AB_NEG],
  [BloodGroup.AB_POS]: [
    BloodGroup.O_NEG, BloodGroup.O_POS, BloodGroup.A_NEG, BloodGroup.A_POS,
    BloodGroup.B_NEG, BloodGroup.B_POS, BloodGroup.AB_NEG, BloodGroup.AB_POS,
  ],
} as const;

export function canDonateTo(donor: BloodGroup, recipient: BloodGroup): boolean {
  return RECIPIENT_COMPATIBILITY[recipient].includes(donor);
}

/** Minimum days between whole-blood donations (India/US standard). */
export const MIN_DAYS_BETWEEN_DONATIONS = 56;
