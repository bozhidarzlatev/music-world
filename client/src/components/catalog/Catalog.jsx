import { useEffect } from "react";
import { Link } from "react-router"
import { useParams } from 'react-router';
import { useItems } from "../../api/itemApi";
import CatalogCard from "./CatalogCard";

const products = [
  {
    id: 1,
    title: "Acoustic Guitar",
    category: "Instruments",
    price: "$299",
    rating: 4.5,
    image: "https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg",
  },
  {
    id: 2,
    title: "Acoustic Guitar",
    category: "Instruments",
    price: "$299",
    rating: 4.5,
    image: "https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg",
  },
  {
    id: 3,
    title: "Electric Keyboard",
    category: "Instruments",
    price: "$499",
    rating: 4.2,
    image: "https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg",
  },
  {
    id: 4,
    title: "Drum Set",
    category: "Instruments",
    price: "$799",
    rating: 4.8,
    image: "https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg",
  },
];
export default function Catalog() {
  const { categoriId } = useParams();
  const { items } = useItems(categoriId)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">{categoriId} Catalog</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {items.map((item) => 
          <CatalogCard categoriId={categoriId} item={item}/>
        )}
      </div>
    </div>
  );


};


