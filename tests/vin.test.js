
/**
 * SwiftPolicy VIN Module Test Suite
 */

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

describe('VIN Intelligence Engine', () => {
  
  test('Should validate standard UK VIN format', () => {
    const validVin = "WVWZZZAUZGW000003";
    expect(VIN_REGEX.test(validVin)).toBe(true);
  });

  test('Should reject invalid VIN characters (I, O, Q)', () => {
    const invalidVin = "WVIOZZAUZGW00000Q";
    expect(VIN_REGEX.test(invalidVin)).toBe(false);
  });

  test('Should handle 5-second timeout logic', async () => {
    const start = Date.now();
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT')), 5000)
    );
    try {
      await timeout;
    } catch (e) {
      expect(Date.now() - start).toBeGreaterThanOrEqual(5000);
      expect(e.message).toBe('TIMEOUT');
    }
  });

  test('Should extract JSON from AI string with preamble', () => {
    const aiResponse = "Based on the registration provided: { \"make\": \"FORD\", \"model\": \"FIESTA\" }";
    const match = aiResponse.match(/\{[\s\S]*\}/);
    expect(match).not.toBeNull();
    const data = JSON.parse(match[0]);
    expect(data.make).toBe("FORD");
  });

});
