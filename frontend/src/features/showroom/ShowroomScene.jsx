"use client";

import { Component, Suspense } from "react";

import { Html, useGLTF } from "@react-three/drei";

import ProductViewer from
    "@/features/product/ProductViewer";

import { useConfiguration } from
    "@/hooks/useConfiguration";

import Lighting from "@/components/three/Lighting";
import ProductStudioLighting from "@/components/three/ProductStudioLighting";
import IsolatedLightingRenderer from "@/components/three/IsolatedLightingRenderer";
import CameraControls from "@/components/three/CameraControls";
import SceneLoader from "@/components/three/SceneLoader";

import ShowroomEnvironment from "./ShowroomEnvironment";

import { useProducts } from "@/hooks/useProducts";
import { useShowroomStore } from "@/stores/useShowroomStore";

class ModelErrorBoundary extends Component {
    state = {
        hasError: false,
    };

    static getDerivedStateFromError() {
        return {
            hasError: true,
        };
    }

    componentDidCatch(error) {
        console.error("Product loading failed:", error);
    }

    retry = () => {
        useGLTF.clear(
            this.props.modelURLs ||
            this.props.modelURL
        );

        this.setState({
            hasError: false,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Html center>
                    <div
                        className="
                            w-64 rounded-xl
                            bg-white p-5
                            text-center shadow-lg
                        "
                    >
                        <p className="text-sm font-semibold">
                            Unable to load product
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                            Check the model availability
                            and backend connection.
                        </p>

                        <button
                            type="button"
                            onClick={this.retry}
                            className="
                                mt-4 rounded-lg
                                bg-primary px-4 py-2
                                text-xs text-white
                            "
                        >
                            Retry Model
                        </button>
                    </div>
                </Html>
            );
        }

        return this.props.children;
    }
}

function ProductStation({ product }) {
    const mode = useShowroomStore(
        (state) => state.mode
    );

    const enterProduct = useShowroomStore(
        (state) => state.enterProduct
    );

    const isTransitioning = useShowroomStore(
        (state) => state.isTransitioning
    );

    const { selectedAccessoryModels } =
        useConfiguration(product.id);

    const modelURLs = [
        product.modelURL,
        ...(mode === "product"
            ? selectedAccessoryModels.map(
                (part) => part.modelURL
            )
            : []),
    ];

    function selectProduct(event) {
        event.stopPropagation();

        if (
            mode === "showroom" &&
            !isTransitioning
        ) {
            enterProduct(product.id);
        }
    }

    return (
        <group
            position={[0, 0, 0]}
            onClick={selectProduct}
        >
            <ModelErrorBoundary
                key={JSON.stringify(modelURLs)}
                modelURL={product.modelURL}
                modelURLs={modelURLs}
            >
                <ProductViewer
                    product={product}
                    configurationEnabled={
                        mode === "product"
                    }
                />
            </ModelErrorBoundary>
        </group>
    );
}
export default function ShowroomScene() {
    const {
        products,
        isLoading,
    } = useProducts();

    const selectedProduct = useShowroomStore(
        (state) => state.selectedProduct
    );

    const activeProduct =
        products.find(
            (product) =>
                product.id === selectedProduct
        ) || products[0];

    return (
        <>
            <Lighting />

            <ProductStudioLighting position={[0, 0, 0]} />

            <IsolatedLightingRenderer />

            <CameraControls />

            <Suspense fallback={null}>
                <ShowroomEnvironment />
            </Suspense>

            {isLoading && <SceneLoader />}

            {activeProduct && (
                <ProductStation
                    key={activeProduct.id}
                    product={activeProduct}
                />
            )}

            {!isLoading && !activeProduct && (
                <Html center>
                    <div
                        className="
                            whitespace-nowrap rounded-xl
                            bg-white px-5 py-4
                            text-sm text-gray-500
                            shadow-md
                        "
                    >
                        No products available
                    </div>
                </Html>
            )}
        </>
    );
}