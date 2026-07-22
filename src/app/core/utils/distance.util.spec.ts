import { distanceKm, isWithinRadius } from './distance.util';

describe('distance.util', () => {
  const mumbai = { lat: 19.076, lng: 72.8777 };
  const delhi  = { lat: 28.6139, lng: 77.209 };

  describe('distanceKm', () => {
    it('returns 0 for identical points', () => {
      expect(distanceKm(mumbai, mumbai)).toBe(0);
    });

    it('computes ~1150 km between Mumbai and Delhi (± 5 km)', () => {
      const d = distanceKm(mumbai, delhi);
      expect(d).toBeGreaterThan(1145);
      expect(d).toBeLessThan(1170);
    });

    it('is symmetric', () => {
      expect(distanceKm(mumbai, delhi)).toBeCloseTo(distanceKm(delhi, mumbai), 6);
    });

    it('handles antipodal points without NaN', () => {
      const a = { lat: 0, lng: 0 };
      const b = { lat: 0, lng: 180 };
      const d = distanceKm(a, b);
      expect(Number.isFinite(d)).toBe(true);
      expect(d).toBeGreaterThan(20_000);
    });
  });

  describe('isWithinRadius', () => {
    it('includes points inside the radius', () => {
      expect(isWithinRadius(mumbai, mumbai, 1)).toBe(true);
    });
    it('excludes points beyond the radius', () => {
      expect(isWithinRadius(mumbai, delhi, 500)).toBe(false);
    });
  });
});
