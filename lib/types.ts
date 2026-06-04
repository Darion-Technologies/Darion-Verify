export const EMPLOYEE_STATUSES = [
  "Active",
  "Intern",
  "Probation",
  "Suspended",
  "Exited",
  "Expired ID",
  "Under Review"
] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export type Employee = {
  id: string;
  employee_id: string;
  full_name: string;
  role: string;
  department: string;
  employment_type: string | null;
  joining_date: string | null;
  status: EmployeeStatus;
  photo_url: string | null;
  verification_token: string;
  created_at: string;
  updated_at: string;
};

export type PublicEmployee = Pick<
  Employee,
  | "full_name"
  | "employee_id"
  | "role"
  | "department"
  | "employment_type"
  | "joining_date"
  | "status"
  | "photo_url"
>;

export type CompleteVerificationEmployee = PublicEmployee &
  Pick<Employee, "created_at" | "updated_at">;

export type VerificationLog = {
  id: string;
  employee_id: string | null;
  scanned_at: string;
  result: string;
  ip_address: string | null;
  device_info: string | null;
};
