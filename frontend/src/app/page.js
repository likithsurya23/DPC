import Link from "next/link";

import { ArrowRight } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { APP_CONFIG } from "@/config/appConfig";

export default function HomePage() {
  return (
    <main
      className="
                relative flex min-h-dvh w-full
                items-center justify-center
                overflow-hidden bg-[#f2f3f5]
            "
    >
      {/* Background */}
      <div
        className="
                    pointer-events-none absolute inset-0
                    bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#e1e3e7_100%)]
                "
      />

      {/* Decorative elements */}
      <div
        className="
                    pointer-events-none absolute
                    h-[650px] w-[650px]
                    rounded-full border border-white/90
                "
      />

      <div
        className="
                    pointer-events-none absolute
                    h-[900px] w-[900px]
                    rounded-full border border-white/60
                "
      />

      {/* Header */}
      <Header>
        <span
          className="
                        text-[10px] font-medium
                        uppercase tracking-[0.2em]
                        text-gray-500
                    "
        >
          Virtual Experience
        </span>
      </Header>

      {/* Main content */}
      <section
        className="
                    relative z-10 mx-auto
                    max-w-4xl px-6 py-28
                    text-center
                "
      >
        <p
          className="
                        mb-6 text-xs font-semibold
                        uppercase tracking-[0.3em]
                        text-primary
                    "
        >
          Digital Product Catalogue
        </p>

        <h1
          className="
                        text-5xl font-semibold
                        leading-tight tracking-tight
                        text-gray-900
                        md:text-7xl lg:text-8xl
                    "
        >
          Explore.
          <br />
          Configure.
          <br />
          Experience.
        </h1>

        <p
          className="
                        mx-auto mt-6 max-w-md
                        text-sm leading-relaxed
                        text-gray-500 md:text-base
                    "
        >
          Discover SHARP products through an
          interactive and immersive
          three-dimensional experience.
        </p>

        <Link
          href={APP_CONFIG.routes.showroom}
          className="
                        group mt-10 inline-flex items-center
                        gap-5 rounded-full bg-primary
                        px-8 py-4 text-sm font-medium
                        text-white transition-colors
                        hover:bg-primary-hover
                    "
        >
          Enter Virtual Showroom

          <ArrowRight
            size={18}
            className="
                            transition-transform
                            group-hover:translate-x-1
                        "
          />
        </Link>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}