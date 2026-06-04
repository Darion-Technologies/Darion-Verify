import Image from "next/image";
import { cn } from "@/lib/utils";

export function DarionLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src="/darion-technologies-logo.png"
        alt="Darion Technologies logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
