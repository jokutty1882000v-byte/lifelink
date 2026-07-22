import { ageFromDob, daysBetween, isDonorEligibleByLastDonation, timeAgo } from './date.util';

describe('daysBetween', () => {
  it('returns positive count for past → now', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 86_400_000).toISOString();
    expect(daysBetween(tenDaysAgo)).toBeGreaterThanOrEqual(9);
    expect(daysBetween(tenDaysAgo)).toBeLessThanOrEqual(11);
  });
});

describe('isDonorEligibleByLastDonation', () => {
  it('is true when no prior donation', () => {
    expect(isDonorEligibleByLastDonation(undefined)).toBe(true);
  });
  it('is false shortly after donating', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString();
    expect(isDonorEligibleByLastDonation(twoDaysAgo)).toBe(false);
  });
  it('is true after 56 days', () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86_400_000).toISOString();
    expect(isDonorEligibleByLastDonation(sixtyDaysAgo)).toBe(true);
  });
});

describe('timeAgo', () => {
  const now = new Date('2026-07-22T12:00:00Z');
  it('formats seconds, minutes, hours, days', () => {
    expect(timeAgo(new Date(now.getTime() - 30_000).toISOString(), now)).toBe('30s ago');
    expect(timeAgo(new Date(now.getTime() - 5 * 60_000).toISOString(), now)).toBe('5m ago');
    expect(timeAgo(new Date(now.getTime() - 2 * 3600_000).toISOString(), now)).toBe('2h ago');
    expect(timeAgo(new Date(now.getTime() - 3 * 86_400_000).toISOString(), now)).toBe('3d ago');
  });
});

describe('ageFromDob', () => {
  it('counts full years only', () => {
    const now = new Date('2026-07-22');
    expect(ageFromDob('2000-07-22', now)).toBe(26);
    expect(ageFromDob('2000-07-23', now)).toBe(25); // birthday tomorrow
  });
});
