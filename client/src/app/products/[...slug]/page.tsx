import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { resolveCatalogEntityBySlug } from '@/lib/api/products';
import CategoryPageTemplate from '@/components/products/CategoryPageTemplate';
import ProductPageTemplate from '@/components/products/ProductPageTemplate';
import ModelPageTemplate from '@/components/products/ModelPageTemplate';

export const revalidate = 300;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    return { title: 'Products | AXION PackTech' };
  }

  const finalSlug = slug[slug.length - 1];
  const resolution = await resolveCatalogEntityBySlug(finalSlug);

  if (!resolution) {
    return {
      title: 'Item Not Found | AXION PackTech',
      description: 'The requested product catalog item could not be found.',
    };
  }

  if (resolution.type === 'category') {
    const cat = resolution.data.category;
    return {
      title: `${cat.name} | Industrial Packaging Solutions | AXION PackTech`,
      description:
        cat.shortDescription ||
        cat.description ||
        `Explore ${cat.name} systems and automated packaging solutions from AXION PackTech.`,
    };
  }

  if (resolution.type === 'product') {
    const prod = resolution.data.product;
    return {
      title: `${prod.name} | AXION PackTech Machinery`,
      description:
        prod.shortDescription ||
        prod.description ||
        `Technical details and model variants for ${prod.name}.`,
    };
  }

  if (resolution.type === 'model') {
    const mod = resolution.data.model;
    return {
      title: `${mod.modelNumber} - ${mod.name} | Technical Data Sheet | AXION PackTech`,
      description:
        mod.shortDescription ||
        mod.description ||
        `Engineering parameters, capacity, and specifications for model ${mod.modelNumber}.`,
    };
  }

  return { title: 'Products | AXION PackTech' };
}

export default async function CatalogCatchAllPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    notFound();
  }

  const finalSlug = slug[slug.length - 1];
  const currentPath = `/products/${slug.join('/')}`;

  const resolution = await resolveCatalogEntityBySlug(finalSlug);

  if (!resolution) {
    notFound();
  }

  if (resolution.type === 'category') {
    return <CategoryPageTemplate data={resolution.data} currentPath={currentPath} />;
  }

  if (resolution.type === 'product') {
    return <ProductPageTemplate data={resolution.data} currentPath={currentPath} />;
  }

  if (resolution.type === 'model') {
    return <ModelPageTemplate data={resolution.data} currentPath={currentPath} />;
  }

  notFound();
}
