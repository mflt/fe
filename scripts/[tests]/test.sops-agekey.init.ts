#!/usr/bin/env bun

// Test the validation function from setup-sops-secret.ts
function validateAgeKey(key: string | undefined): string | undefined {
  if (!key) return `No key provided`;
  if (!key.startsWith("AGE-SECRET-1")) return "Must start with AGE-SECRET-1";
  // Age secret keys are typically 100+ characters long
  if (key.length < 50) return "Key too short to be valid";
  return undefined; // Valid key
}

// Test cases
const testCases = [
  { input: undefined, expected: "No key provided" },
  { input: "", expected: "No key provided" },
  { input: "INVALID-KEY", expected: "Must start with AGE-SECRET-1" },
  { input: "AGE-SECRET-1SHORT", expected: "Key too short to be valid" },
  { input: "AGE-SECRET-1QD5F5F0YGV5G0YGV5G0YGV5G0YGV5G0YGV5G0YGV5G0YGV5G0YGV5G0YGV", expected: undefined },
];

console.log("Testing validateAgeKey function:");
testCases.forEach((testCase, index) => {
  const result = validateAgeKey(testCase.input);
  const passed = result === testCase.expected;
  console.log(`Test ${index + 1}: ${passed ? '✅' : '❌'} Input: "${testCase.input}" | Expected: "${testCase.expected}" | Got: "${result}"`);
});

console.log("\nAll tests completed!");