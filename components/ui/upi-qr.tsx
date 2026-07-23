"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/**
 * Renders a scannable QR for a upi:// link. Standard black-on-white on
 * purpose: brand-tinted QRs scan worse on older phones.
 */
export function UpiQr({ link, label }: { link: string; label: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(link, { width: 240, margin: 1 })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [link]);

  if (!dataUrl) {
    return (
      <div
        aria-hidden
        className="bg-blush size-[240px] animate-pulse rounded-md"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt={label}
      width={240}
      height={240}
      className="border-plum-ink/10 rounded-md border"
    />
  );
}
