"use client";

import { QRCodeSVG } from "qrcode.react";
import { Smartphone, ExternalLink } from "lucide-react";

import { isLoopbackURL } from "@/config/apiConfig";

export default function ARQRCode({ url }) {
    const isLocalhost = isLoopbackURL(url);

    return (
        <div className="flex w-full flex-col items-center gap-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fdf0f1] text-[#d71920]">
                <Smartphone size={28} strokeWidth={1.7} />
            </div>

            <div>
                <h2 className="text-lg font-bold tracking-tight text-[#152336]">
                    View on Your Mobile
                </h2>

                <p className="mt-2 max-w-[260px] text-xs leading-relaxed text-gray-500">
                    Scan the QR code using your mobile camera to experience the printer in your space.
                </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
                <QRCodeSVG
                    value={url}
                    size={176}
                    level="M"
                    marginSize={4}
                />
            </div>

            {isLocalhost && (
                <p className="max-w-[270px] rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-700">
                    Configure a mobile-accessible application URL before scanning this QR code.
                </p>
            )}

            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                    inline-flex w-full items-center justify-center gap-2
                    rounded-full bg-[#e01920] px-6 py-3
                    text-xs font-semibold text-white
                    shadow-[0_10px_24px_-6px_rgba(224,25,32,0.5)]
                    transition-colors hover:bg-[#c81218]
                "
            >
                <span>Open AR Experience</span>
                <ExternalLink size={14} />
            </a>
        </div>
    );
}
