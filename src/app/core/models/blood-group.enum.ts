/** ABO + Rh blood group system. String enum so values serialize cleanly to the API. */
export enum BloodGroup {
  A_POS  = 'A+',
  A_NEG  = 'A-',
  B_POS  = 'B+',
  B_NEG  = 'B-',
  AB_POS = 'AB+',
  AB_NEG = 'AB-',
  O_POS  = 'O+',
  O_NEG  = 'O-',
}

export const ALL_BLOOD_GROUPS: readonly BloodGroup[] = Object.values(BloodGroup);
