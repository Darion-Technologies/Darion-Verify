import Image from "next/image";
import { cn } from "@/lib/utils";

export function DarionLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden border border-neutral-900 bg-[#078daf]", className)}>
      <Image
        src="/darion-technologies-logo.png"
        alt="Darion Technologies logo"
        fill
        className="object-contain p-1"
        priority
      />
    </div>
  );
}
