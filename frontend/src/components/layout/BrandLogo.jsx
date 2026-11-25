import { APP_CONFIG } from "@/config/appConfig";

export default function BrandLogo({
    className = "",
    highlightClassName = "text-[#d71920]",
    ...props
}) {
    const { prefix, highlight, suffix } = APP_CONFIG.brandDisplay;

    return (
        <span className={className} {...props}>
            <span>{prefix}</span>
            <span className={highlightClassName}>{highlight}</span>
            <span> {suffix}</span>
        </span>
    );
}

