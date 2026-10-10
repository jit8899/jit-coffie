import { z } from "zod";

export const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(100),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  email: z.string().trim().email("Enter a valid email address.").max(254).transform((v) => v.toLowerCase()),
  password: z.string().min(10, "Use at least 10 characters.").max(128).regex(/[a-z]/, "Add a lowercase letter.").regex(/[A-Z]/, "Add an uppercase letter.").regex(/\d/, "Add a number."),
  confirmPassword: z.string(),
  address: z.string().trim().min(8, "Add your complete residential address.").max(300),
  city: z.string().trim().min(2).max(100),
  state: z.enum(indianStates),
  pinCode: z.string().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code."),
  country: z.literal("India").default("India"),
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: "Please accept the terms and privacy policy." }) }),
}).refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export const emailSchema = z.string().trim().email().max(254).transform((v) => v.toLowerCase());
export const passwordSchema = z.string().min(10).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/);
