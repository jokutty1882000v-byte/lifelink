import { FormControl } from '@angular/forms';
import { bloodGroupValidator, donorAgeValidator, phoneValidator, strongPasswordValidator } from './validators.util';

describe('phoneValidator', () => {
  it('accepts E.164-like numbers', () => {
    expect(phoneValidator(new FormControl('+919812340001'))).toBeNull();
    expect(phoneValidator(new FormControl('9812340001'))).toBeNull();
  });
  it('rejects too-short and non-digit inputs', () => {
    expect(phoneValidator(new FormControl('1234'))).toEqual({ phone: true });
    expect(phoneValidator(new FormControl('abc'))).toEqual({ phone: true });
  });
  it('passes on empty (required is a separate validator)', () => {
    expect(phoneValidator(new FormControl(''))).toBeNull();
  });
});

describe('bloodGroupValidator', () => {
  it('accepts every valid group', () => {
    for (const g of ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']) {
      expect(bloodGroupValidator(new FormControl(g))).toBeNull();
    }
  });
  it('rejects garbage', () => {
    expect(bloodGroupValidator(new FormControl('Z+'))).toEqual({ bloodGroup: true });
  });
});

describe('donorAgeValidator', () => {
  const v = donorAgeValidator(18, 65);
  it('accepts age within range', () => {
    const twentyFiveYearsAgo = new Date();
    twentyFiveYearsAgo.setFullYear(twentyFiveYearsAgo.getFullYear() - 25);
    expect(v(new FormControl(twentyFiveYearsAgo.toISOString()))).toBeNull();
  });
  it('rejects too young', () => {
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    const err = v(new FormControl(tenYearsAgo.toISOString()));
    expect(err?.['donorAge']).toBeTruthy();
  });
});

describe('strongPasswordValidator', () => {
  it('requires 8+ chars with letters and digits', () => {
    expect(strongPasswordValidator(new FormControl('abc123'))).toEqual({ weakPassword: true });
    expect(strongPasswordValidator(new FormControl('abcdefgh'))).toEqual({ weakPassword: true });
    expect(strongPasswordValidator(new FormControl('12345678'))).toEqual({ weakPassword: true });
    expect(strongPasswordValidator(new FormControl('abc12345'))).toBeNull();
  });
});
