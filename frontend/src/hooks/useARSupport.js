"use client";

import { useSyncExternalStore } from "react";

const SERVER_SNAPSHOT = {
    isMobile: false,
    isAndroid: false,
    isIOS: false,
    isSecureContext: false,
    isReady: false,
};

let clientSnapshot = null;

function subscribe() {
    return () => {};
}

function getClientSnapshot() {
    if (!clientSnapshot) {
        const userAgent = navigator.userAgent;
        const isAndroid = /Android/i.test(userAgent);
        const isIOS =
            /iPhone|iPad|iPod/i.test(userAgent) ||
            (
                navigator.platform === "MacIntel" &&
                navigator.maxTouchPoints > 1
            );

        clientSnapshot = {
            isMobile: isAndroid || isIOS,
            isAndroid,
            isIOS,
            isSecureContext: window.isSecureContext,
            isReady: true,
        };
    }

    return clientSnapshot;
}

function getServerSnapshot() {
    return SERVER_SNAPSHOT;
}

export function useARSupport() {
    return useSyncExternalStore(
        subscribe,
        getClientSnapshot,
        getServerSnapshot
    );
}