export const LANDING_ACCESSORY_IDS = [
    "tray-de12",
    "finisher-fn15",
    "large-capacitor-lc10",
    "bp-tr12",
];

export const LANDING_SCENE_CONFIG = {
    room: {
        centerZ: 2.2,
        radius: 6.0,
        wallHeight: 3.4,
        arcHalfAngle: 1.18,
    },

    platform: {
        radiusTop: 1.02,
        radiusBottom: 1.06,
        height: 0.15,
    },

    printer: {
        baseRotationY: -0.1,
        scale: 1,
    },

    colors: {
        background: "#f4f5f7",
        wallWhite: "#f7f8fa",
        floorWhite: "#f0f2f5",
        redPrimary: "#c90d14",
        redDeep: "#9b070c",
        redBright: "#e01a22",
        ledWhite: "#ffffff",
        ledPinkTint: "#ffd4d6",
        podiumDeck: "#eaecf0",
    },

    layouts: {
        desktop: {
            showcaseX: 0.9,
            printerScale: 1,
            cameraPosition: [0, 0.78, 4.32],
            cameraTarget: [0, 0.78, 0],
            introStartPosition: [0.2, 0.9, 5.35],
            introStartTarget: [0.12, 0.9, 0],
            pushInPosition: [0.85, 0.74, 2.25],
            pushInTarget: [0.9, 0.74, 0],
            fov: 35,
            parallax: { x: 0.14, y: 0.06 },
        },
        tablet: {
            showcaseX: 0.72,
            printerScale: 0.92,
            cameraPosition: [0, 0.82, 4.8],
            cameraTarget: [0, 0.82, 0],
            introStartPosition: [0.18, 0.94, 5.8],
            introStartTarget: [0.1, 0.94, 0],
            pushInPosition: [0.68, 0.76, 2.55],
            pushInTarget: [0.72, 0.76, 0],
            fov: 38,
            parallax: { x: 0.1, y: 0.05 },
        },
        mobile: {
            showcaseX: 0,
            printerScale: 0.84,
            cameraPosition: [0, 0.88, 4.95],
            cameraTarget: [0, 0.88, 0],
            introStartPosition: [0, 1.02, 5.9],
            introStartTarget: [0, 1.02, 0],
            pushInPosition: [0, 0.78, 2.65],
            pushInTarget: [0, 0.78, 0],
            fov: 42,
            parallax: { x: 0.05, y: 0.03 },
        },
    },
};

export function getViewportLayout(width) {
    if (width < 768) {
        return "mobile";
    }
    if (width < 1100) {
        return "tablet";
    }
    return "desktop";
}
