"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { EmployeeStatusBadge } from "@/components/EmployeeStatusBadge";
import type { Employee } from "@/lib/types";

export function EmployeeTable({ employees }: { employees: Employee[] }) {
  const [query, setQuery] = useState("");

  const filteredEmployees = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return employees;
    }

    return employees.filter((employee) =>
      [
        employee.full_name,
        employee.work_email,
        employee.employee_id,
        employee.department,
        employee.role,
        employee.status
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [employees, query]);

  if (!employees.length) {
    return (
      <div className="border bg-white p-10 text-center">
        <h2 className="text-lg font-semibold">No employees yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Add the first employee to generate an ID card and verification QR.</p>
        <Button asChild className="mt-5">
          <Link href="/admin/employees/new">Add employee</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search name, email, ID, department, status"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="overflow-hidden border bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Work Email</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{employee.full_name}</p>
                      <p className="text-xs text-muted-foreground">{employee.role}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{employee.work_email || "Not assigned"}</TableCell>
                  <TableCell className="font-mono text-xs">{employee.employee_id}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <EmployeeStatusBadge status={employee.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/employees/${employee.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {!filteredEmployees.length ? (
        <div className="border bg-white p-6 text-center text-sm text-muted-foreground">No employees match your search.</div>
      ) : null}
    </div>
  );
}
