import type { DogSize, Product, ProductCategory } from "@/types";

export type ShopFilters = {
  query: string;
  category: ProductCategory | "all";
  flavors: string[];
  dogSizes: DogSize[];
  dietary: string[];
  priceRange: [number, number];
  minRating: number;
  inStockOnly: boolean;
  sort:
    | "popularity"
    | "newest"
    | "bestselling"
    | "price-asc"
    | "price-desc";
};

const defaultFilters: ShopFilters = {
  query: "",
  category: "all",
  flavors: [],
  dogSizes: [],
  dietary: [],
  priceRange: [0, 200],
  minRating: 0,
  inStockOnly: false,
  sort: "popularity",
};

export function getDefaultShopFilters(): ShopFilters {
  return { ...defaultFilters, priceRange: [...defaultFilters.priceRange] as [number, number] };
}

export function filterAndSortProducts(products: Product[], filters: ShopFilters): Product[] {
  const q = filters.query.trim().toLowerCase();

  let next = products.filter((p) => {
    if (filters.category !== "all" && p.category !== filters.category) return false;
    if (filters.inStockOnly && !p.inStock) return false;
    if (p.rating < filters.minRating) return false;
    if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;

    if (filters.flavors.length) {
      const ok = filters.flavors.some((f) => p.flavors.map((x) => x.toLowerCase()).includes(f.toLowerCase()));
      if (!ok) return false;
    }

    if (filters.dogSizes.length) {
      const ok = filters.dogSizes.some((size) => p.dogSizes.includes(size));
      if (!ok) return false;
    }

    if (filters.dietary.length) {
      const ok = filters.dietary.every((tag) =>
        p.dietary.map((d) => d.toLowerCase()).includes(tag.toLowerCase()),
      );
      if (!ok) return false;
    }

    if (q) {
      const haystack = `${p.name} ${p.tagline} ${p.description} ${p.category} ${p.flavors.join(" ")}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  next = [...next].sort((a, b) => {
    switch (filters.sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "bestselling":
        return b.reviewCount - a.reviewCount;
      case "newest":
        return b.id.localeCompare(a.id);
      case "popularity":
      default:
        return b.rating * b.reviewCount - a.rating * a.reviewCount;
    }
  });

  return next;
}
