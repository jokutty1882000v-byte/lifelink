import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ALL_BLOOD_GROUPS, BloodGroup } from '../models/blood-group.enum';
import { ageFromDob } from './date.util';

/** E.164-lite: optional +, then 8–15 digits. */
export const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

export const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidBloodGroup(value: unknown): value is BloodGroup {
  return typeof value === 'string' && ALL_BLOOD_GROUPS.includes(value as BloodGroup);
}

export const phoneValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null =>
  !c.value || PHONE_REGEX.test(c.value) ? null : { phone: true };

export const bloodGroupValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null =>
  !c.value || isValidBloodGroup(c.value) ? null : { bloodGroup: true };

/** Donor age policy: 18–65 inclusive. */
export function donorAgeValidator(min = 18, max = 65): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    if (!c.value) return null;
    const age = ageFromDob(c.value);
    return age >= min && age <= max ? null : { donorAge: { min, max, actual: age } };
  };
}

/** Password: ≥8 chars, at least one letter and one digit. */
export const strongPasswordValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v: string = c.value ?? '';
  if (!v) return null;
  const ok = v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);
  return ok ? null : { weakPassword: true };
};
