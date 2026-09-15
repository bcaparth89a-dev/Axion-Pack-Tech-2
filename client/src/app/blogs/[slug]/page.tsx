import { redirect } from "next/navigation";

export const revalidate = 300;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogsSlugAliasPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/blog/${slug}`);
}
