/**
 * Converts an array of bytes into a binary string.
 * Each byte is represented as an 8-character binary string, padded with leading zeros if necessary.
 */
function transformBytesToBinary(bytes: Uint8Array): string {
  return [...bytes].map((val) => val.toString(2).padStart(8, '0')).join('');
}

/**
 * Converts an array of bytes into an integer.
 *
 * First transform the bytes into a binary string and then parsing it as a base-2 number.
 */
function transformBytesToInteger(bytes: Uint8Array): number {
  return parseInt(transformBytesToBinary(bytes), 2);
}

function maskFirstByte(bytes: Uint8Array, maskBits: number): void {
  if (maskBits !== 0) {
    const mask = (1 << maskBits) - 1;
    bytes[0] &= mask;
  }
}

/**
 * Calculates the number of bits needed to represent the maximum value (max - 1)
 * in binary
 */
function calculateBits(max: number): number {
  return (max - 1).toString(2).length;
}

export function transformRandomInteger(max: number): number {
  if (!Number.isInteger(max)) {
    throw new Error('Argument `max` must be an integer.');
  }

  if (max < 0) {
    throw new Error('Argument `max` must be greater than or equal to 0.');
  }

  const bitLength = calculateBits(max);

  /**
   * Determines how many bits you need to shift to reach the next multiple of 8
   */
  const shift = bitLength % 8;
  const bytes = new Uint8Array(Math.ceil(bitLength / 8));

  crypto.getRandomValues(bytes);

  maskFirstByte(bytes, shift);

  let result = transformBytesToInteger(bytes);

  while (result >= max) {
    crypto.getRandomValues(bytes);

    if (shift !== 0) {
      bytes[0] &= (1 << shift) - 1;
    }

    result = transformBytesToInteger(bytes);
  }

  return result;
}

/**
 * Generates a random string of given length
 */
export function transformRandomString(length: number): string {
  let randomString = '';

  for (let i = 0; i < length; i++) {
    randomString += getRandomPattern();
  }

  return randomString;
}

/**
 * Generates a string with a-z and 0-9 characters
 */
function getRandomPattern(): string {
  const patternSet = new Set(['a-z', '0-9'] as const);

  let result = '';

  for (const pattern of patternSet) {
    switch (pattern) {
      case 'a-z':
        result += 'abcdefghijklmnopqrstuvwxyz';
        break;
      case '0-9':
        result += '0123456789';
        break;
    }
  }

  return result;
}
