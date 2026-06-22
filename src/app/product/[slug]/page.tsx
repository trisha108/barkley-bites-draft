import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getReviewsForProduct, products } from "@/data/products";
import { ProductDetailView } from "@/features/product/product-detail-view";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const reviews = getReviewsForProduct(product.id);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  return <ProductDetailView product={product} reviews={reviews} related={related} />;
}
