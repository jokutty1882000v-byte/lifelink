import { BloodGroup } from '../models/blood-group.enum';
import { Donor } from '../models/donor.model';
import { rankDonors } from './donor-ranking.util';

const mumbai = { lat: 19.076, lng: 72.8777 };

const baseDonor = (over: Partial<Donor>): Donor => ({
  id: 'x', userId: 'u', fullName: 'Test',
  bloodGroup: BloodGroup.O_POS, age: 30, gender: 'male', phone: '+91',
  location: mumbai, availability: 'available', totalDonations: 0, isEligible: true,
  ratingAvg: 4, responseRateAvg: 0.8,
  ...over,
});

describe('rankDonors', () => {
  it('drops donors of incompatible blood groups', () => {
    const donors = [
      baseDonor({ id: 'a', bloodGroup: BloodGroup.AB_POS }),
      baseDonor({ id: 'b', bloodGroup: BloodGroup.O_POS }),
    ];
    const ranked = rankDonors(donors, BloodGroup.O_POS, mumbai, 25);
    expect(ranked.map((r) => r.donor.id)).toEqual(['b']);
  });

  it('drops donors beyond the radius', () => {
    const donors = [
      baseDonor({ id: 'near', location: { lat: 19.08, lng: 72.88 } }),
      baseDonor({ id: 'far',  location: { lat: 28.61, lng: 77.20 } }),
    ];
    const ranked = rankDonors(donors, BloodGroup.O_POS, mumbai, 25);
    expect(ranked.map((r) => r.donor.id)).toEqual(['near']);
  });

  it('ranks closer + eligible + available donors higher', () => {
    const donors = [
      baseDonor({ id: 'ideal',    location: { lat: 19.077, lng: 72.878 }, isEligible: true,  availability: 'available' }),
      baseDonor({ id: 'far',      location: { lat: 19.30, lng: 73.00 },   isEligible: true,  availability: 'available' }),
      baseDonor({ id: 'ineligible', location: { lat: 19.077, lng: 72.878 }, isEligible: false, availability: 'available' }),
    ];
    const ranked = rankDonors(donors, BloodGroup.O_POS, mumbai, 50);
    expect(ranked[0]!.donor.id).toBe('ideal');
    expect(ranked[ranked.length - 1]!.donor.id).not.toBe('ideal');
  });

  it('always emits at least one human-readable reason', () => {
    const ranked = rankDonors([baseDonor({})], BloodGroup.O_POS, mumbai, 25);
    expect(ranked[0]!.reasons.length).toBeGreaterThan(0);
  });

  it('returns normalized scores in [0, 1]', () => {
    const donors = [baseDonor({ id: 'a' }), baseDonor({ id: 'b', availability: 'unavailable', isEligible: false })];
    const ranked = rankDonors(donors, BloodGroup.O_POS, mumbai, 25);
    for (const r of ranked) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    }
  });
});
