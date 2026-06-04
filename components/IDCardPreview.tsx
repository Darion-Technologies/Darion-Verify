"use client";

import Image from "next/image";
import { DarionLogo } from "@/components/DarionLogo";
import { QRCodeBox } from "@/components/QRCodeBox";
import type { Employee } from "@/lib/types";
import { publicVerificationUrl } from "@/lib/employee";

export function IDCardPreview({ employee }: { employee: Employee }) {
  const verificationUrl = publicVerificationUrl(employee.verification_token);

  return (
    <div
      id="id-card-print-area"
      className="w-full max-w-[360px] border-2 border-neutral-900 bg-white text-neutral-950 shadow-sm"
    >
      <div className="border-b border-neutral-900 p-5">
        <div className="flex items-center gap-3">
          <DarionLogo className="h-11 w-11" />
          <div>
            <p className="text-base font-bold uppercase tracking-wide">Darion Technologies</p>
            <p className="text-xs text-neutral-500">Employee Identity Card</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex gap-4">
          <div className="relative h-28 w-24 shrink-0 overflow-hidden border bg-neutral-100">
            {employee.photo_url ? (
              <Image src={employee.photo_url} alt={employee.full_name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-2 text-center text-xs text-neutral-500">
                Employee Photo
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="break-words text-xl font-bold leading-tight">{employee.full_name}</h2>
            <p className="mt-1 text-sm font-medium text-neutral-700">{employee.role}</p>
            <dl className="mt-4 space-y-2 text-xs">
              <div>
                <dt className="font-semibold uppercase text-neutral-500">Department</dt>
                <dd>{employee.department}</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase text-neutral-500">Employee ID</dt>
                <dd className="font-mono text-[11px]">{employee.employee_id}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4 border-t pt-5">
          <div>
            <p className="text-sm font-semibold">Scan to verify</p>
            <p className="mt-1 text-xs text-neutral-500">Public verification link</p>
          </div>
          <QRCodeBox value={verificationUrl} size={112} />
        </div>
      </div>
      <div className="border-t bg-neutral-950 px-5 py-3 text-center text-xs text-white">
        © 2026 Darion Technologies.
      </div>
    </div>
  );
}
