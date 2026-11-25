"use client";

import { QRCodeSVG } from "qrcode.react";
import { Smartphone, ExternalLink } from "lucide-react";

export default function ARQRCode({ url }) {
    const isLocalhost = /localhost|127\.0\.0\.1/.test(url);

    return (
        <div className="flex flex-col items-center gap-5">
            <Smartphone
                size={32}
                strokeWidth={1.5}
                className="text-primary"
            />

            <div className="text-center">
                <h2 className="text-lg font-semibold">
                    View on Your Mobile
                </h2>

                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                    Scan the QR code using your mobile camera
                    to experience the printer in your space.
                </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <QRCodeSVG
                    value={url}
                    size={180}
                    level="M"
                    marginSize={4}
                />
            </div>

            {isLocalhost && (
                <p className="text-center text-xs text-amber-600">
                    Configure a mobile-accessible application URL
                    before scanning this QR code.
                </p>
            )}

            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-medium text-primary"
            >
                Open AR Experience

                <ExternalLink size={14} />
            </a>
        </div>
    );
}