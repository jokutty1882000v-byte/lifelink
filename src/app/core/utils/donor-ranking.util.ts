import { Donor, RankedDonor } from '../models/donor.model';
import { BloodGroup } from '../models/blood-group.enum';
import { GeoPoint } from '../models/geo.model';
import { canDonateTo } from '../constants/blood-groups';
import { distanceKm } from './distance.util';
import { isDonorEligibleByLastDonation } from './date.util';

export interface RankingWeights {
  distance:  number;   // closer is better
  eligible:  number;   // eligible by 56-day rule
  available: number;   // marked available
  rating:    number;   // higher avg rating
  response:  number;   // higher response rate
}

const DEFAULT_WEIGHTS: RankingWeights = {
  distance:  0.40,
  eligible:  0.25,
  available: 0.15,
  rating:    0.10,
  response:  0.10,
};

/**
 * Pure, deterministic ranking used both by the frontend (fast filtering)
 * and mirrored on the backend AI agent for explainability.
 * Returns a normalized 0..1 score plus human-readable reasons.
 */
export function rankDonors(
  donors: readonly Donor[],
  recipient: BloodGroup,
  origin: GeoPoint,
  radiusKm = 25,
  weights: RankingWeights = DEFAULT_WEIGHTS,
): RankedDonor[] {
  const ranked: RankedDonor[] = [];

  for (const donor of donors) {
    if (!canDonateTo(donor.bloodGroup, recipient)) continue;

    const dist = distanceKm(origin, donor.location);
    if (dist > radiusKm) continue;

    const eligible  = donor.isEligible && isDonorEligibleByLastDonation(donor.lastDonationDate);
    const available = donor.availability === 'available';
    const rating    = (donor.ratingAvg ?? 3) / 5;
    const response  = donor.responseRateAvg ?? 0.5;
    const proximity = 1 - Math.min(1, dist / radiusKm);

    const score =
      weights.distance  * proximity +
      weights.eligible  * (eligible  ? 1 : 0) +
      weights.available * (available ? 1 : 0) +
      weights.rating    * rating +
      weights.response  * response;

    const reasons: string[] = [];
    reasons.push(`${dist.toFixed(1)} km away`);
    if (canDonateTo(donor.bloodGroup, recipient)) {
      reasons.push(`${donor.bloodGroup} → ${recipient} compatible`);
    }
    if (eligible)  reasons.push('Eligible by 56-day rule');
    if (available) reasons.push('Currently available');
    if (donor.ratingAvg && donor.ratingAvg >= 4.5) reasons.push('Highly rated');
    if (donor.responseRateAvg && donor.responseRateAvg >= 0.8) reasons.push('Responds quickly');

    ranked.push({
      donor,
      score,
      distanceKm: dist,
      reasons,
      predictedResponseMinutes: response > 0 ? Math.round(30 / Math.max(response, 0.1)) : undefined,
    });
  }

  return ranked.sort((a, b) => b.score - a.score);
}
