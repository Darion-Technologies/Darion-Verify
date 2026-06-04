"use client";

import { toPng } from "html-to-image";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IDCardActions({ fileName }: { fileName: string }) {
  async function downloadPng() {
    const node = document.getElementById("id-card-print-area");
    if (!node) {
      return;
    }

    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff"
    });
    const link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button onClick={downloadPng}>
        <Download className="h-4 w-4" />
        Download PNG
      </Button>
      <Button variant="outline" onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        Print / Save PDF
      </Button>
    </div>
  );
}
