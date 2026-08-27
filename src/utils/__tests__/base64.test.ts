import { encodeBase64, decodeBase64 } from "../base64";

describe("base64 Utils", () => {
  it("encodes and decodes ascii and utf-8 strings correctly", () => {
    const testCases = [
      "Hello World!",
      "💥 Full Body Power Blast!",
      '{"name":"Test","rounds":3}',
      "Spanish: ¡A Entrenar! & French: C'est l'heure du sport !",
      "1234567890",
      "a",
      "ab",
      "abc",
    ];

    for (const original of testCases) {
      const encoded = encodeBase64(original);
      expect(typeof encoded).toBe("string");
      const decoded = decodeBase64(encoded);
      expect(decoded).toBe(original);
    }
  });

  it("handles malformed base64 strings gracefully", () => {
    const decoded = decodeBase64("invalid%&&*base64");
    expect(typeof decoded).toBe("string");
  });
});
