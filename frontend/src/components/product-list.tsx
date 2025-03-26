"use client";

import React from 'react';
import ProductCard from './product-card';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  sellerId: string;
}

interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
};

export default ProductList;
