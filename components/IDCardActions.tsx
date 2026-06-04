"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import { Download, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IDCardActions({
  fileName,
  verificationUrl,
  employeeName
}: {
  fileName: string;
  verificationUrl: string;
  employeeName: string;
}) {
  const [message, setMessage] = useState("");

  async function getCardDataUrl() {
    const node = document.getElementById("id-card-print-area");
    if (!node) {
      throw new Error("ID card preview was not found.");
    }

    return toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff"
    });
  }

  async function downloadPng() {
    setMessage("");
    try {
      const dataUrl = await getCardDataUrl();
      downloadDataUrl(dataUrl);
    } catch {
      setMessage("Unable to generate ID card PNG.");
    }
  }

  async function shareIdCard() {
    setMessage("");
    try {
      const dataUrl = await getCardDataUrl();
      const file = await dataUrlToFile(dataUrl, `${fileName}.png`);
      const shareText = `${employeeName} employee ID card. Verify here: ${verificationUrl}`;

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${employeeName} ID Card`,
          text: shareText,
          url: verificationUrl,
          files: [file]
        });
        setMessage("ID card shared.");
        return;
      }

      await copyVerificationUrl();
      downloadDataUrl(dataUrl);
      setMessage("Link copied and PNG downloaded.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setMessage("Unable to share ID card.");
    }
  }

  function downloadDataUrl(dataUrl: string) {
    const link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = dataUrl;
    link.click();
  }

  async function copyVerificationUrl() {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(verificationUrl);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = verificationUrl;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
        <Button className="justify-start" onClick={shareIdCard}>
          <Share2 className="h-4 w-4" />
          Share ID Card
        </Button>
        <Button className="justify-start" variant="outline" onClick={downloadPng}>
          <Download className="h-4 w-4" />
          Download PNG
        </Button>
        <Button className="justify-start" variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>
      {message ? <p className="text-sm text-muted-foreground sm:text-right">{message}</p> : null}
    </div>
  );
}

async function dataUrlToFile(dataUrl: string, fileName: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: "image/png" });
}
