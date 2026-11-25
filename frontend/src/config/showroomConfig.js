import { APP_CONFIG } from "./appConfig";
import { getAssetURL } from "./apiConfig";

export const SHOWROOM_CONFIG = {
    product: {
        id: APP_CONFIG.defaultProductId,
        name: "Base Model TU11",
        category: "Multifunction Printer",
        description: "Multi-function industrial printer base unit.",

        modelURL: getAssetURL(
            "/assets/models/products/Base-Model-TU11.glb"
        ),

        supportsHotspots: true,
        scale: 1,
        rotation: [0, 0, 0],
        position: [0, 0, 0],
    },

    camera: {
        position: [1.05, 0.92, 2.42],
        target: [0, 0.4, 0],

        fov: 36,
        near: 0.01,
        far: 100,

        minDistance: 0.9,
        maxDistance: 5.4,

        minPolarAngle: Math.PI * 0.12,
        maxPolarAngle: Math.PI * 0.49,

        autoRotateSpeed: 1,
        transitionDuration: 1.4,

        presets: {
            showroom: {
                position: [1.05, 0.92, 2.42],
                target: [0, 0.4, 0],
                viewOffset: [-0.145, 0.01],
            },

            showroomMobile: {
                position: [1.1, 1.28, 3.55],
                target: [0, 0.42, 0],
                viewOffset: [0, -0.08],
            },

            showroomIntroStart: {
                position: [1.35, 1.18, 3.25],
                target: [0, 0.36, 0],
                viewOffset: [-0.11, 0.01],
            },

            product: {
                position: [1.15, 1.16, 2.65],
                target: [0, 0.4, 0],
                viewOffset: [0.165, 0],
            },

            productSummary: {
                position: [1.15, 1.16, 2.75],
                target: [0, 0.4, 0],
                viewOffset: [0.165, 0],
            },

            productMobile: {
                position: [1.1, 1.28, 3.45],
                target: [0, 0.4, 0],
                viewOffset: [0, 0.14],
            },
        },
    },

    environment: {
        backgroundColor: "#f4f5f7",
        floorColor: "#f0f2f5",
        wallColor: "#f7f8fa",
        ceilingColor: "#ffffff",
        platformColor: "#eaecf0",
        accentColor: "#c90d14",
        accentDeep: "#9b070c",

        room: {
            width: 12.4,
            height: 4.2,
            depth: 12.4,
        },

        floor: {
            width: 18,
            depth: 12,
        },

        platform: {
            radiusTop: 0.86,
            radiusBottom: 0.91,
            height: 0.15,
            productScale: 1.22,
        },
    },

    renderer: {
        dpr: [1, 1.75],
    },
};
export const ACCESSORIES = [
    {
        id: "bp-tr12",
        name: "BP TR12",
        description:
            "Extended upper output exit tray for high-volume document separation.",
        modelURL: getAssetURL(
            "/assets/models/accessories/BP-TR12.glb"
        ),
        exclusiveGroup: "bp-tr12-group",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1,
    },
    {
        id: "bp-tr12-variant",
        name: "BP-TR12 Variant",
        description:
            "Compact upper exit tray optimized for smaller office footprints.",
        modelURL: getAssetURL(
            "/assets/models/accessories/BP-TR12 1.glb"
        ),
        exclusiveGroup: "bp-tr12-group",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1,
    },
    {
        id: "finisher-fn15",
        name: "Finisher FN15",
        description:
            "Multi-tray floor-standing finisher with stapling and sorting support.",
        modelURL: getAssetURL(
            "/assets/models/accessories/Finisher-FN15.glb"
        ),
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1,
    },
    {
        id: "large-capacitor-lc10",
        name: "Large Capacitor LC10",
        description:
            "Side high-capacity paper feed cabinet for continuous print runs.",
        modelURL: getAssetURL(
            "/assets/models/accessories/Large-Capacitor-LC10.glb"
        ),
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1,
    },
    {
        id: "tray-de12",
        name: "Tray DE12",
        description:
            "Dual-drawer pedestal paper cassette unit supporting extra media sizes.",
        modelURL: getAssetURL(
            "/assets/models/accessories/TRAY-DE12.glb"
        ),
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1,
    },
];

export const HOTSPOTS = [
    {
        id: "touchscreen-display",
        number: 1,
        title: "Smart Touchscreen Display",
        description:
            "10.1-inch tiltable capacitive touchscreen with an intuitive smartphone-style user interface, easy navigation, and customizable quick-access shortcuts.",
        anchor: [0.72, 0.82, 0.88],
        videoURL: null,
    },
    {
        id: "document-feeder",
        number: 2,
        title: "Duplexing Document Feeder",
        description:
            "High-capacity single-pass duplexing document feeder (DSPF) capable of rapid two-sided scanning with multi-feed detection.",
        anchor: [0.5, 0.98, 0.5],
        videoURL: null,
    },
    {
        id: "output-tray",
        number: 3,
        title: "Internal Output Tray",
        description:
            "Central output paper delivery area with integrated paper sensor, sorting capability, and LED notification indicators.",
        anchor: [0.32, 0.72, 0.65],
        videoURL: null,
    },
    {
        id: "toner-compartment",
        number: 4,
        title: "Front Toner Access Panel",
        description:
            "Ergonomic front-opening compartment for fast, mess-free toner cartridge replacement with automatic cartridge locking.",
        anchor: [0.5, 0.58, 0.95],
        videoURL: null,
    },
    {
        id: "paper-drawers",
        number: 5,
        title: "Universal Paper Cassettes",
        description:
            "High-capacity dual paper cassettes supporting a wide range of media weights and custom document formats.",
        anchor: [0.5, 0.28, 0.9],
        videoURL: null,
    },
];
