export const cropCategories = [
    {
        name: "Cereals & Grains",
        crops: ["Wheat", "Rice", "Maize", "Bajra (Pearl Millet)", "Jowar (Sorghum)", "Ragi (Finger Millet)", "Barley"]
    },
    {
        name: "Pulses",
        crops: ["Tur/Arhar (Pigeon Pea)", "Chana (Chickpea)", "Moong (Green Gram)", "Urad (Black Gram)", "Masoor (Lentil)"]
    },
    {
        name: "Oilseeds",
        crops: ["Soybean", "Groundnut", "Mustard", "Sunflower", "Sesame", "Castor"]
    },
    {
        name: "Cash Crops",
        crops: ["Cotton", "Sugarcane", "Jute", "Tobacco"]
    },
    {
        name: "Vegetables",
        crops: ["Onion", "Potato", "Tomato", "Brinjal", "Cauliflower", "Cabbage", "Chilli", "Garlic", "Ginger"]
    },
    {
        name: "Fruits",
        crops: ["Mango", "Banana", "Grapes", "Pomegranate", "Orange", "Papaya"]
    },
    {
        name: "Spices",
        crops: ["Turmeric", "Coriander", "Cumin", "Fenugreek"]
    }
];

export const allCrops = cropCategories.flatMap(cat => cat.crops);
