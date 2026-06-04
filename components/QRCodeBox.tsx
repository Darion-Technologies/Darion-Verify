"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRCodeBox({ value, size = 176 }: { value: string; size?: number }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: size,
      color: {
        dark: "#111827",
        light: "#ffffff"
      }
    }).then((dataUrl) => {
      if (!cancelled) {
        setSrc(dataUrl);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [size, value]);

  return (
    <div className="flex items-center justify-center border bg-white p-3">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} width={size} height={size} alt="Verification QR code" />
      ) : (
        <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height: size, width: size }}>
          Generating QR
        </div>
      )}
    </div>
  );
}
