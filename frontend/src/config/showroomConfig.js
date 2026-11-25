import { getAssetURL } from "./apiConfig";

export const SHOWROOM_CONFIG = {
    product: {
        id: "base-tu11",
        name: "Base Model TU11",
        category: "Multifunction Printer",

        modelURL: getAssetURL(
            "/assets/models/products/Base-Model-TU11.glb"
        ),

        scale: 1,
        rotation: [0, 0, 0],
        position: [0, 0, 0],
    },

    camera: {
        position: [1.9, 1.55, 3.8],
        target: [0, 0.65, 0],

        fov: 42,
        near: 0.01,
        far: 100,

        minDistance: 0.9,
        maxDistance: 3.5,

        minPolarAngle: Math.PI * 0.12,
        maxPolarAngle: Math.PI * 0.49,

        autoRotateSpeed: 1,
        transitionDuration: 1.8,

        presets: {
            showroom: {
                position: [1.9, 1.55, 3.8],
                target: [0, 0.65, 0],
            },

            product: {
                position: [1.5, 1.05, 2.1],
                target: [0, 0.41, 0],
            },
        },
    },

    environment: {
        backgroundColor: "#edf0f3",
        floorColor: "#dcdfe3",
        wallColor: "#f5f5f5",
        ceilingColor: "#ffffff",
        platformColor: "#ffffff",
        accentColor: "#d71920",

        room: {
            width: 9,
            height: 3.6,
            depth: 9,
        },

        floor: {
            width: 18,
            depth: 9,
        },

        platform: {
            radiusTop: 0.95,
            radiusBottom: 1.02,
            height: 0.12,
        },
    },

    renderer: {
        dpr: [1, 1.75],
    },
};
export const ACCESSORIES = [
    {
        id: "bp-tr12",
        name: "BP-TR12",
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
