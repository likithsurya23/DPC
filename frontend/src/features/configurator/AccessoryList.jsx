"use client";

import AccessoryItem from "./AccessoryItem";

const accessoryGroups = [
    {
        title: "Paper Feed Options",
        description: "Select any one",
        ids: ["bp-tr12", "bp-tr12-variant"],
    },
    {
        title: "Additional Paper Capacity",
        ids: ["tray-de12", "large-capacitor-lc10"],
    },
    {
        title: "Finishing Options",
        ids: ["finisher-fn15"],
    },
];

export default function AccessoryList({
    accessories = [],
    selectedIds = [],
    onToggle,
}) {
    if (accessories.length === 0) {
        return (
            <p className="py-8 text-center text-sm text-gray-500">
                No accessories available.
            </p>
        );
    }

    return (
        <div className="space-y-5">
            {accessoryGroups.map((group) => {
                const items = group.ids
                    .map((id) =>
                        accessories.find(
                            (item) => item.id === id
                        )
                    )
                    .filter(Boolean);

                if (items.length === 0) return null;

                return (
                    <section
                        key={group.title}
                        className="space-y-3"
                    >
                        <div>
                            <h3 className="text-xs font-semibold text-gray-700">
                                {group.title}
                            </h3>

                            {group.description && (
                                <p className="mt-1 text-[11px] text-gray-500">
                                    {group.description}
                                </p>
                            )}
                        </div>

                        {items.map((accessory) => (
                            <AccessoryItem
                                key={accessory.id}
                                accessory={accessory}
                                selected={selectedIds.includes(
                                    accessory.id
                                )}
                                onToggle={onToggle}
                            />
                        ))}
                    </section>
                );
            })}
        </div>
    );
}