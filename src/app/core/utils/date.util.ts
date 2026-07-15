import { MIN_DAYS_BETWEEN_DONATIONS } from '../constants/blood-groups';

const MS_PER_DAY = 86_400_000;

export function daysBetween(fromIso: string, toIso: string = new Date().toISOString()): number {
  return Math.floor((new Date(toIso).getTime() - new Date(fromIso).getTime()) / MS_PER_DAY);
}

export function isDonorEligibleByLastDonation(lastDonationIso?: string): boolean {
  if (!lastDonationIso) return true;
  return daysBetween(lastDonationIso) >= MIN_DAYS_BETWEEN_DONATIONS;
}

/** Compact relative-time string ("3m ago", "2h ago", "5d ago"). */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60)    return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)    return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)      return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30)       return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12)     return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function ageFromDob(dobIso: string, now: Date = new Date()): number {
  const dob = new Date(dobIso);
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}
