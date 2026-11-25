"use client";

import { ArrowRight } from "lucide-react";

import BrandLogo from "@/components/layout/BrandLogo";

export default function HeroContent({
    onCtaMouseEnter,
    onCtaMouseLeave,
    onCtaClick,
}) {
    return (
        <div
            data-anim="content"
            className="
                pointer-events-none relative z-20
                flex h-full w-full flex-col justify-between
                px-6 py-7 text-center
                md:items-start md:justify-center md:px-0 md:py-0
                md:pl-[7.5%] md:text-left lg:pl-[9.5%] xl:pl-[10.5%]
            "
        >
            <div
                className="
                    mx-auto flex max-w-md flex-col items-center
                    md:mx-0 md:max-w-[44%] md:items-start
                "
            >
                {/* Brand: asiabusiness solutions */}
                <p
                    data-anim="brand"
                    className="
                        select-none text-lg font-bold
                        tracking-[-0.03em] text-[#3d4147]
                        sm:text-xl md:text-[1.45rem] lg:text-[1.65rem]
                    "
                >
                    <BrandLogo highlightClassName="text-[#d4141b]" />
                </p>

                {/* Main heading: SHARP SMART / SOLUTIONS */}
                <h1
                    className="
                        mt-4 select-none uppercase leading-none
                        md:mt-9 lg:mt-11
                    "
                >
                    <span
                        data-anim="heading-top"
                        className="
                            block text-[clamp(1.6rem,4.8vw,3.15rem)]
                            font-bold tracking-[-0.015em] text-[#3c4045]
                            md:text-[clamp(1.75rem,3.15vw,3.15rem)]
                        "
                    >
                        SHARP SMART
                    </span>

                    <span
                        data-anim="heading-main"
                        className="
                            mt-0.5 block
                            text-[clamp(2.25rem,7vw,4.55rem)]
                            font-black leading-[0.95] tracking-[-0.025em]
                            text-[#c90d14]
                            md:text-[clamp(2.4rem,4.55vw,4.55rem)]
                        "
                    >
                        SOLUTIONS
                    </span>
                </h1>

                {/* Tagline */}
                <p
                    data-anim="tagline"
                    className="
                        mt-3 select-none
                        text-[clamp(0.88rem,1.25vw,1.25rem)]
                        font-medium tracking-[-0.01em] text-[#4b5058]
                        md:mt-5
                    "
                >
                    The{" "}
                    <span className="font-bold text-[#c90d14]">MFP</span>{" "}
                    for tomorrow&rsquo;s business world
                </p>
            </div>

            {/* Single responsive CTA button */}
            <div className="flex justify-center pb-2 md:mt-7 md:block md:pb-0 lg:mt-8">
                <button
                    data-anim="cta"
                    type="button"
                    onClick={onCtaClick}
                    onMouseEnter={onCtaMouseEnter}
                    onMouseLeave={onCtaMouseLeave}
                    style={{
                        background:
                            "linear-gradient(180deg, #e21a22 0%, #c40c13 56%, #9e050a 100%)",
                        boxShadow:
                            "0 12px 28px -6px rgba(201, 13, 20, 0.52), 0 4px 10px rgba(0, 0, 0, 0.14)",
                    }}
                    className="
                        pointer-events-auto inline-flex items-center
                        gap-3.5 rounded-full border border-white/25
                        px-7 py-3.5 text-sm font-semibold
                        tracking-[0.01em] text-white
                        focus-visible:outline-2 focus-visible:outline-offset-4
                        focus-visible:outline-[#c90d14]
                        lg:px-8 lg:py-4 lg:text-[15px]
                    "
                >
                    <span>Explore Virtual Showroom</span>
                    <span
                        data-anim="cta-arrow"
                        aria-hidden="true"
                        className="inline-flex items-center"
                    >
                        <ArrowRight size={18} strokeWidth={2.3} />
                    </span>
                </button>
            </div>
        </div>
    );
}
