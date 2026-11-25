"use client";

export function BaseModelThumbnail() {
    return (
        <svg
            viewBox="0 0 64 56"
            className="h-12 w-14 shrink-0"
            aria-hidden="true"
        >
            {/* Top document feeder */}
            <polygon points="16,10 42,6 50,11 24,15" fill="#4b5563" />
            <rect x="16" y="10" width="26" height="5" rx="1" fill="#1f2937" />
            {/* Mid dark chassis & touchscreen */}
            <rect x="15" y="15" width="28" height="10" fill="#111827" />
            <polygon points="43,15 51,12 51,23 43,25" fill="#374151" />
            <rect x="33" y="17" width="11" height="6" rx="1" fill="#0ea5e9" opacity="0.85" />
            {/* Silver-gray lower body & cassette */}
            <rect x="15" y="25" width="28" height="22" rx="1" fill="#9ca3af" />
            <polygon points="43,25 51,23 51,44 43,47" fill="#6b7280" />
            <rect x="20" y="39" width="18" height="6" rx="0.8" fill="#6b7280" />
            <rect x="25" y="29" width="8" height="1.5" rx="0.5" fill="#e5e7eb" />
        </svg>
    );
}

export default function AccessoryThumbnail({ accessoryId }) {
    switch (accessoryId) {
        case "bp-tr12":
            return (
                <svg
                    viewBox="0 0 64 42"
                    className="h-9 w-12 shrink-0"
                    aria-hidden="true"
                >
                    <polygon points="8,20 40,10 56,16 24,27" fill="#9ca3af" />
                    <polygon points="8,20 24,27 24,33 8,26" fill="#6b7280" />
                    <polygon points="24,27 56,16 56,22 24,33" fill="#4b5563" />
                    <polygon points="15,19 39,12 49,16 25,24" fill="#d1d5db" />
                </svg>
            );

        case "bp-tr12-variant":
            return (
                <svg
                    viewBox="0 0 64 42"
                    className="h-9 w-12 shrink-0"
                    aria-hidden="true"
                >
                    <polygon points="12,18 40,10 52,16 24,25" fill="#6b7280" />
                    <polygon points="12,18 24,25 24,32 12,25" fill="#4b5563" />
                    <polygon points="24,25 52,16 52,23 24,32" fill="#374151" />
                    <polygon points="18,18 39,12 46,16 25,22" fill="#9ca3af" />
                </svg>
            );

        case "finisher-fn15":
            return (
                <svg
                    viewBox="0 0 64 42"
                    className="h-9 w-12 shrink-0"
                    aria-hidden="true"
                >
                    <polygon points="10,12 22,17 22,20 10,15" fill="#4b5563" />
                    <polygon points="12,20 22,23 22,26 12,23" fill="#6b7280" />
                    <rect x="22" y="7" width="16" height="29" rx="1.5" fill="#374151" />
                    <polygon points="38,7 46,10 46,34 38,36" fill="#1f2937" />
                    <rect x="24" y="10" width="12" height="12" rx="1" fill="#4b5563" />
                </svg>
            );

        case "large-capacitor-lc10":
            return (
                <svg
                    viewBox="0 0 64 42"
                    className="h-9 w-12 shrink-0"
                    aria-hidden="true"
                >
                    <polygon points="18,12 36,7 48,11 30,16" fill="#d1d5db" />
                    <rect x="18" y="12" width="18" height="23" rx="1" fill="#9ca3af" />
                    <polygon points="36,12 48,11 48,33 36,35" fill="#6b7280" />
                    <rect x="22" y="17" width="10" height="2.5" rx="0.5" fill="#4b5563" />
                    <circle cx="21" cy="36" r="1.5" fill="#374151" />
                    <circle cx="34" cy="36" r="1.5" fill="#374151" />
                </svg>
            );

        case "tray-de12":
        default:
            return (
                <svg
                    viewBox="0 0 64 42"
                    className="h-9 w-12 shrink-0"
                    aria-hidden="true"
                >
                    <polygon points="10,17 34,11 54,16 30,22" fill="#e5e7eb" />
                    <rect x="10" y="17" width="24" height="15" rx="1" fill="#d1d5db" />
                    <polygon points="34,17 54,16 54,30 34,32" fill="#9ca3af" />
                    <rect x="13" y="20" width="18" height="4" rx="0.8" fill="#f3f4f6" />
                    <rect x="13" y="26" width="18" height="4" rx="0.8" fill="#f3f4f6" />
                </svg>
            );
    }
}

