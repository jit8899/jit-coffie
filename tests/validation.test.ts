import { describe, expect, it } from "vitest";
import { signupSchema } from "../src/lib/validation";

const validSignup = {
  fullName: "Riya Shah", mobileNumber: "9876543210", email: "RIYA@example.com", password: "CoffeeDay24",
  confirmPassword: "CoffeeDay24", address: "14 Lake View Road", city: "Mumbai", state: "Maharashtra",
  pinCode: "400001", country: "India", acceptedTerms: true as const,
};

describe("signup validation", () => {
  it("accepts Indian signup details and normalizes email", () => {
    expect(signupSchema.parse(validSignup).email).toBe("riya@example.com");
  });
  it("rejects invalid Indian mobile and PIN values", () => {
    expect(signupSchema.safeParse({ ...validSignup, mobileNumber: "0123" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...validSignup, pinCode: "040001" }).success).toBe(false);
  });
  it("requires matching passwords and consent", () => {
    expect(signupSchema.safeParse({ ...validSignup, confirmPassword: "DifferentPass24" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...validSignup, acceptedTerms: false }).success).toBe(false);
  });
  it("accepts Indian states and union territories only", () => {
    expect(signupSchema.safeParse({ ...validSignup, state: "Atlantis" }).success).toBe(false);
  });
});
