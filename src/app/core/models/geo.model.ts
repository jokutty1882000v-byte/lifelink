export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface GeoLocation extends GeoPoint {
  address?: Address;
  accuracyMeters?: number;
  timestamp?: string;
}
