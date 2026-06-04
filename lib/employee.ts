import crypto from "crypto";
import { z } from "zod";
import { EMPLOYEE_STATUSES, type EmployeeStatus } from "@/lib/types";

export const employeeSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required"),
  role: z.string().trim().min(2, "Role is required"),
  department: z.string().trim().min(2, "Department is required"),
  employment_type: z.string().trim().optional().nullable(),
  joining_date: z.string().optional().nullable(),
  status: z.enum(EMPLOYEE_STATUSES),
  photo_url: z.union([z.string().url("Photo URL must be valid"), z.literal("")]).optional().nullable()
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

const DEPARTMENT_CODES: Record<string, string> = {
  "product leadership": "PLD",
  product: "PLD",
  "full stack development": "FSD",
  frontend: "FSD",
  backend: "BKD",
  "backend development": "BKD",
  ai: "AIB",
  "ai builder": "AIB",
  "artificial intelligence": "AIB",
  hr: "HRQ",
  "human resources": "HRQ",
  qa: "QAD",
  quality: "QAD",
  "quality assurance": "QAD",
  "ai design": "AID",
  design: "AID"
};

export function getDepartmentCode(department: string) {
  const normalized = department.trim().toLowerCase();
  if (DEPARTMENT_CODES[normalized]) {
    return DEPARTMENT_CODES[normalized];
  }

  const letters = department.replace(/[^a-z]/gi, "").toUpperCase();
  return (letters.slice(0, 3) || "GEN").padEnd(3, "X");
}

export function generateEmployeeId(department: string, nextNumber: number) {
  return `DRN-TECH-${getDepartmentCode(department)}-2026-${String(nextNumber).padStart(4, "0")}`;
}

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function getVerificationResult(status?: EmployeeStatus) {
  switch (status) {
    case "Active":
    case "Intern":
    case "Probation":
      return "Verified Employee";
    case "Exited":
      return "No longer active";
    case "Suspended":
      return "Verification restricted";
    case "Under Review":
      return "Verification under review";
    case "Expired ID":
      return "ID expired";
    default:
      return "Invalid verification link";
  }
}
