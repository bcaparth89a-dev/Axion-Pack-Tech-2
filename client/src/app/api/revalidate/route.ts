import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { path, tag } = body as { path?: string; tag?: string };

    if (tag) {
      try {
        revalidateTag(tag, 'max');
      } catch (err) {
        console.warn(`[Revalidate] Tag "${tag}" failed:`, err);
      }
    }
    if (path) {
      try {
        revalidatePath(path, 'page');
        revalidatePath(path, 'layout');
      } catch (err) {
        console.warn(`[Revalidate] Path "${path}" failed:`, err);
      }
    }

    // Always revalidate about pages if requested or by default
    if (!path || path.includes('about') || (tag && (tag.includes('about') || tag.includes('pages')))) {
      revalidatePath('/about-us', 'page');
      revalidatePath('/about', 'page');
      revalidateTag('about-page', 'max');
      revalidateTag('pages', 'max');
    }

    // Always revalidate industries if requested or by default
    if (!path || path.includes('industries') || (tag && tag.includes('industr'))) {
      revalidatePath('/industries', 'layout');
      revalidatePath('/industries', 'page');
      revalidatePath('/', 'page');
      revalidateTag('industries', 'max');
      revalidateTag('navbar', 'max');
    }

    // Always revalidate services if requested or by default
    if (!path || path.includes('services') || (tag && tag.includes('servic'))) {
      revalidatePath('/services', 'layout');
      revalidatePath('/services', 'page');
      revalidatePath('/', 'page');
      revalidateTag('services', 'max');
      revalidateTag('navbar', 'max');
    }

    // Always revalidate blogs if requested
    if (!path || path.includes('blog') || (tag && tag.includes('blog'))) {
      revalidatePath('/blog', 'layout');
      revalidatePath('/blog', 'page');
      revalidatePath('/', 'page');
      revalidateTag('blogs', 'max');
      revalidateTag('blog-categories', 'max');
    }

    // Always revalidate news if requested
    if (!path || path.includes('news') || (tag && tag.includes('news'))) {
      revalidatePath('/news', 'layout');
      revalidatePath('/news', 'page');
      revalidatePath('/', 'page');
      revalidateTag('news', 'max');
      revalidateTag('news-categories', 'max');
    }

    // Always revalidate careers if requested
    if (!path || path.includes('career') || (tag && tag.includes('career'))) {
      revalidatePath('/careers', 'layout');
      revalidatePath('/careers', 'page');
      revalidatePath('/', 'page');
      revalidateTag('careers', 'max');
    }

    // Always revalidate contact if requested
    if (!path || path.includes('contact') || (tag && tag.includes('contact'))) {
      revalidatePath('/contact', 'page');
      revalidatePath('/', 'page');
      revalidateTag('contact', 'max');
      revalidateTag('settings', 'max');
    }

    // Always revalidate site settings & company stats if requested
    if (!path || path.includes('setting') || path.includes('stat') || (tag && (tag.includes('setting') || tag.includes('stat')))) {
      revalidatePath('/', 'layout');
      revalidatePath('/', 'page');
      revalidateTag('settings', 'max');
      revalidateTag('site-settings', 'max');
      revalidateTag('company-stats', 'max');
      revalidateTag('navbar', 'max');
      revalidateTag('pages', 'max');
      revalidateTag('home', 'max');
    }

    // Always revalidate catalog / categories / products / models if requested or by default
    if (!path || path.includes('product') || path.includes('categor') || path.includes('model') || (tag && (tag.includes('catalog') || tag.includes('product') || tag.includes('categor') || tag.includes('model')))) {
      revalidatePath('/', 'layout');
      revalidatePath('/', 'page');
      revalidatePath('/products', 'layout');
      revalidatePath('/products', 'page');
      revalidatePath('/products/[...slug]', 'page');
      revalidateTag('categories', 'max');
      revalidateTag('catalog-nav', 'max');
      revalidateTag('catalog-tree', 'max');
      revalidateTag('products', 'max');
      revalidateTag('products-featured', 'max');
      revalidateTag('models', 'max');
      revalidateTag('navbar', 'max');
      revalidateTag('pages', 'max');
      revalidateTag('home', 'max');
    }


    return NextResponse.json({
      success: true,
      revalidated: true,
      path: path || '/about-us',
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to revalidate cache',
      },
      { status: 500 }
    );
  }
}
