import { randomInt } from "node:crypto";

const REFERENCE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
const REFERENCE_SUFFIX_LENGTH = 8;

export const createRegistrationReference = (): string => {
  let suffix = "";

  for (let position = 0; position < REFERENCE_SUFFIX_LENGTH; position += 1) {
    suffix += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  }

  return `AICHEE26-${suffix}`;
};
