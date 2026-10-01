// utils/productData.js

export const products = {
  "1": {
    name: "Tense Jeans - Relaxed Wide-Leg Denim",
    description: "Shop Tense Jeans Relaxed Wide-Leg Denim at Anevix. Made from premium cotton denim, offering absolute comfort and style.",
    price: "Rs. 5,490",
    category: "Jeans",
    image: "/assets/images/jeans1.png",
    keywords: "wide leg jeans, relaxed denim, tense jeans, blue jeans, premium denim"
  },
  "2": {
    name: "Avenue Denim - High Rise Straight Fit",
    description: "Shop Avenue Denim High Rise Straight Fit. Features a flattering high rise cut and premium stretch denim for all-day comfort.",
    price: "Rs. 5,390",
    category: "Jeans",
    image: "/assets/images/jeans2.png",
    keywords: "high rise jeans, straight fit denim, women jeans, black jeans, avenue denim"
  },
  "3": {
    name: "Cobalt Street - Slim Cargo Denim",
    description: "Shop Cobalt Street Slim Cargo Denim. Sleek cargo pocket design meets classic durable slim-fit denim pants.",
    price: "Rs. 5,990",
    category: "Jeans",
    image: "/assets/images/jeans3.png",
    keywords: "cargo jeans, slim fit denim, cobalt street cargo, cargo pants men"
  },
  "4": {
    name: "Urban Loop - Comfort Stretch Denim",
    description: "Shop Urban Loop Comfort Stretch Denim. Flexible, breathable, and highly durable stretch denim tailored for everyday use.",
    price: "Rs. 5,790",
    category: "Jeans",
    image: "/assets/images/jeans4.png",
    keywords: "stretch jeans, comfort denim, urban loop jeans, flexible denim"
  },
  "5": {
    name: "Denim Edge - Vintage Flare Jeans",
    description: "Shop Denim Edge Vintage Flare Jeans. Retro-inspired flare silhouette crafted from authentic heavyweight denim.",
    price: "Rs. 6,190",
    category: "Jeans",
    image: "/assets/images/jeans5.png",
    keywords: "flare jeans, vintage denim, retro jeans, denim edge"
  }
};

export const defaultProduct = {
  name: "Spooky Creative Starry Sky Ceramic Mug",
  description: "Adorable 3D Cat Design ceramic mug (420ml). Perfect for coffee, tea, hot chocolate, or as a premium gift.",
  price: "Rs. 756",
  category: "Kitchenware",
  image: "/images/mug-1.png",
  keywords: "ceramic mug, cat mug, 3d cat mug, spooky mug, coffee mug, gift mug"
};

export function getProductById(id) {
  return products[id] || { 
    ...defaultProduct, 
    name: id ? `${defaultProduct.name} - Product #${id}` : defaultProduct.name 
  };
}
