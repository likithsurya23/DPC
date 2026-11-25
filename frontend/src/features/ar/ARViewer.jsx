"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { ArrowLeft, LoaderCircle } from "lucide-react";

import Header from "@/components/layout/Header";

import ModelViewer from "./ModelViewer";
import ARQRCode from "./ARQRCode";

import { getARConfiguration } from "@/services/arService";

import { getARPageURL } from "@/config/apiConfig";

import { useARSupport } from "@/hooks/useARSupport";

export default function ARViewer({ configurationId }) {
    const device = useARSupport();

    const {
        data: configuration,
        isPending,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["ar-configuration", configurationId],

        queryFn: ({ signal }) =>
            getARConfiguration(
                configurationId,
                { signal }
            ),

        retry: 1,
    });

    const pageURL = getARPageURL(configurationId);

    return (
        <main className="relative flex min-h-dvh flex-col bg-gray-100">
            <Header />

            <section className="flex flex-1 flex-col px-5 pb-5 pt-24 md:px-12">
                <Link
                    href="/showroom"
                    className="
                        mb-5 flex w-fit items-center gap-2
                        rounded-full bg-white px-4 py-2
                        text-xs text-gray-600 shadow-sm
                    "
                >
                    <ArrowLeft size={15} />

                    Back to Showroom
                </Link>

                {isPending ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4">
                        <LoaderCircle
                            size={36}
                            className="animate-spin text-primary"
                        />

                        <p className="text-sm text-gray-500">
                            Preparing AR experience...
                        </p>
                    </div>
                ) : isError ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4">
                        <h2 className="text-xl font-semibold">
                            Unable to load configuration
                        </h2>

                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="rounded-lg bg-primary px-6 py-3 text-sm text-white"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-5">
                            <p className="text-xs font-semibold tracking-wider text-primary">
                                AUGMENTED REALITY
                            </p>

                            <h1 className="mt-2 text-3xl font-semibold">
                                {configuration.productName}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Experience the printer in your own space.
                            </p>
                        </div>

                        <div className="flex flex-1 flex-col gap-5 lg:flex-row">
                            {/* Google Model Viewer */}
                            <div className="min-h-[450px] flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                <div className="h-[55dvh] min-h-[400px]">
                                    <ModelViewer
                                        key={configuration.modelURL}
                                        modelURL={configuration.modelURL}
                                        iosURL={configuration.iosURL}
                                        productName={configuration.productName}
                                    />
                                </div>
                            </div>

                            {/* Desktop QR code */}
                            {device.isReady && !device.isMobile && (
                                <aside className="flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 lg:w-[320px]">
                                    <ARQRCode url={pageURL} />
                                </aside>
                            )}
                        </div>

                        {device.isReady &&
                            !device.isSecureContext && (
                                <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                                    A secure HTTPS connection is required
                                    for browser-based WebXR AR.
                                </p>
                            )}
                    </>
                )}
            </section>
        </main>
    );
}