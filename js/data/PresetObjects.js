/**
 * PresetObjects - Catalog of common household objects with preset dimensions
 * All dimensions in centimeters (cm)
 * Structure designed for easy API replacement in the future
 */

const PRESET_OBJECTS = {
    bedroom: {
        categoryName: "Bedroom",
        items: [
            {
                id: "single_bed",
                name: "Single Bed",
                width: 90,
                length: 190,
                height: 50,
                color: "#4A90E2" // Blue
            },
            {
                id: "double_bed",
                name: "Double Bed",
                width: 140,
                length: 190,
                height: 50,
                color: "#4A90E2"
            },
            {
                id: "queen_bed",
                name: "Queen Bed",
                width: 160,
                length: 200,
                height: 50,
                color: "#4A90E2"
            },
            {
                id: "king_bed",
                name: "King Bed",
                width: 180,
                length: 200,
                height: 50,
                color: "#4A90E2"
            },
            {
                id: "bedside_table",
                name: "Bedside Table",
                width: 40,
                length: 40,
                height: 50,
                color: "#8B4513" // Brown
            },
            {
                id: "wardrobe",
                name: "Wardrobe",
                width: 100,
                length: 60,
                height: 200,
                color: "#8B4513"
            },
            {
                id: "chest_of_drawers",
                name: "Chest of Drawers",
                width: 80,
                length: 40,
                height: 100,
                color: "#8B4513"
            },
            {
                id: "dresser",
                name: "Dresser",
                width: 120,
                length: 45,
                height: 80,
                color: "#8B4513"
            }
        ]
    },
    living_room: {
        categoryName: "Living Room",
        items: [
            {
                id: "two_seater_sofa",
                name: "2-Seater Sofa",
                width: 150,
                length: 85,
                height: 80,
                color: "#A0522D" // Sienna
            },
            {
                id: "three_seater_sofa",
                name: "3-Seater Sofa",
                width: 200,
                length: 90,
                height: 85,
                color: "#A0522D"
            },
            {
                id: "l_shaped_sofa",
                name: "L-Shaped Sofa",
                width: 250,
                length: 180,
                height: 85,
                color: "#A0522D"
            },
            {
                id: "armchair",
                name: "Armchair",
                width: 85,
                length: 85,
                height: 85,
                color: "#A0522D"
            },
            {
                id: "coffee_table",
                name: "Coffee Table",
                width: 120,
                length: 60,
                height: 45,
                color: "#D2691E" // Chocolate
            },
            {
                id: "tv_stand",
                name: "TV Stand",
                width: 150,
                length: 40,
                height: 50,
                color: "#8B4513"
            },
            {
                id: "bookshelf",
                name: "Bookshelf",
                width: 80,
                length: 30,
                height: 180,
                color: "#8B4513"
            },
            {
                id: "side_table",
                name: "Side Table",
                width: 50,
                length: 50,
                height: 55,
                color: "#D2691E"
            }
        ]
    },
    dining: {
        categoryName: "Dining",
        items: [
            {
                id: "dining_table_4",
                name: "Dining Table (4-seater)",
                width: 120,
                length: 80,
                height: 75,
                color: "#CD853F" // Peru/Tan
            },
            {
                id: "dining_table_6",
                name: "Dining Table (6-seater)",
                width: 180,
                length: 90,
                height: 75,
                color: "#CD853F"
            },
            {
                id: "dining_table_8",
                name: "Dining Table (8-seater)",
                width: 240,
                length: 100,
                height: 75,
                color: "#CD853F"
            },
            {
                id: "dining_chair",
                name: "Dining Chair",
                width: 45,
                length: 50,
                height: 90,
                color: "#8B4513"
            },
            {
                id: "bar_stool",
                name: "Bar Stool",
                width: 40,
                length: 40,
                height: 75,
                color: "#696969" // Gray
            },
            {
                id: "buffet",
                name: "Buffet/Sideboard",
                width: 160,
                length: 45,
                height: 85,
                color: "#8B4513"
            }
        ]
    },
    office: {
        categoryName: "Office",
        items: [
            {
                id: "desk",
                name: "Desk",
                width: 120,
                length: 60,
                height: 75,
                color: "#8B4513"
            },
            {
                id: "l_shaped_desk",
                name: "L-Shaped Desk",
                width: 150,
                length: 150,
                height: 75,
                color: "#8B4513"
            },
            {
                id: "office_chair",
                name: "Office Chair",
                width: 60,
                length: 60,
                height: 110,
                color: "#000000" // Black
            },
            {
                id: "filing_cabinet",
                name: "Filing Cabinet",
                width: 45,
                length: 60,
                height: 130,
                color: "#696969"
            },
            {
                id: "bookcase",
                name: "Bookcase",
                width: 80,
                length: 30,
                height: 200,
                color: "#8B4513"
            }
        ]
    },
    kitchen: {
        categoryName: "Kitchen",
        items: [
            {
                id: "refrigerator",
                name: "Refrigerator",
                width: 70,
                length: 70,
                height: 180,
                color: "#C0C0C0" // Silver
            },
            {
                id: "stove",
                name: "Stove/Oven",
                width: 60,
                length: 60,
                height: 90,
                color: "#696969"
            },
            {
                id: "dishwasher",
                name: "Dishwasher",
                width: 60,
                length: 60,
                height: 85,
                color: "#C0C0C0"
            },
            {
                id: "kitchen_island",
                name: "Kitchen Island",
                width: 120,
                length: 80,
                height: 90,
                color: "#D2691E"
            },
            {
                id: "kitchen_cabinet",
                name: "Kitchen Cabinet",
                width: 60,
                length: 60,
                height: 200,
                color: "#8B4513"
            },
            {
                id: "microwave",
                name: "Microwave",
                width: 50,
                length: 40,
                height: 30,
                color: "#696969"
            }
        ]
    },
    bathroom: {
        categoryName: "Bathroom",
        items: [
            {
                id: "bathtub",
                name: "Bathtub",
                width: 170,
                length: 75,
                height: 60,
                color: "#FFFFFF" // White
            },
            {
                id: "shower",
                name: "Shower",
                width: 90,
                length: 90,
                height: 200,
                color: "#E0E0E0" // Light gray
            },
            {
                id: "toilet",
                name: "Toilet",
                width: 40,
                length: 70,
                height: 75,
                color: "#FFFFFF"
            },
            {
                id: "sink_vanity",
                name: "Sink/Vanity",
                width: 80,
                length: 50,
                height: 85,
                color: "#FFFFFF"
            },
            {
                id: "bathroom_cabinet",
                name: "Bathroom Cabinet",
                width: 60,
                length: 35,
                height: 180,
                color: "#8B4513"
            }
        ]
    },
    storage: {
        categoryName: "Storage",
        items: [
            {
                id: "shelf_unit",
                name: "Shelf Unit",
                width: 80,
                length: 40,
                height: 180,
                color: "#8B4513"
            },
            {
                id: "storage_box",
                name: "Storage Box",
                width: 40,
                length: 30,
                height: 25,
                color: "#D2B48C" // Tan
            },
            {
                id: "coat_rack",
                name: "Coat Rack",
                width: 50,
                length: 30,
                height: 180,
                color: "#8B4513"
            },
            {
                id: "shoe_rack",
                name: "Shoe Rack",
                width: 80,
                length: 30,
                height: 90,
                color: "#8B4513"
            }
        ]
    },
    outdoor: {
        categoryName: "Outdoor/Patio",
        items: [
            {
                id: "patio_table",
                name: "Patio Table",
                width: 120,
                length: 80,
                height: 70,
                color: "#8B7355" // Burlywood
            },
            {
                id: "patio_chair",
                name: "Patio Chair",
                width: 55,
                length: 60,
                height: 85,
                color: "#8B7355"
            },
            {
                id: "lounge_chair",
                name: "Lounge Chair",
                width: 70,
                length: 180,
                height: 40,
                color: "#8B7355"
            },
            {
                id: "grill",
                name: "Grill/BBQ",
                width: 120,
                length: 60,
                height: 100,
                color: "#000000"
            }
        ]
    }
};

/**
 * Get all categories
 * @returns {Array} Array of category keys
 */
function getPresetCategories() {
    return Object.keys(PRESET_OBJECTS);
}

/**
 * Get items for a specific category
 * @param {string} categoryKey - Category key (e.g., 'bedroom')
 * @returns {Object|null} Category object with categoryName and items
 */
function getPresetCategory(categoryKey) {
    return PRESET_OBJECTS[categoryKey] || null;
}

/**
 * Get all preset objects as a flat array
 * @returns {Array} Array of all preset objects with category info
 */
function getAllPresetObjects() {
    const allObjects = [];
    for (const [categoryKey, category] of Object.entries(PRESET_OBJECTS)) {
        for (const item of category.items) {
            allObjects.push({
                ...item,
                category: categoryKey,
                categoryName: category.categoryName
            });
        }
    }
    return allObjects;
}

/**
 * Find a preset object by ID
 * @param {string} presetId - Preset object ID
 * @returns {Object|null} Preset object data or null
 */
function getPresetObjectById(presetId) {
    for (const category of Object.values(PRESET_OBJECTS)) {
        const item = category.items.find(i => i.id === presetId);
        if (item) {
            return { ...item };
        }
    }
    return null;
}

/**
 * Search preset objects by name
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of matching preset objects
 */
function searchPresetObjects(searchTerm) {
    const term = searchTerm.toLowerCase();
    return getAllPresetObjects().filter(obj =>
        obj.name.toLowerCase().includes(term)
    );
}
