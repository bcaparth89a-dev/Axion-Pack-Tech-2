import mongoose, { Model } from 'mongoose';

/**
 * Transforms any title or string into a clean, URL-safe slug.
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Ensures a generated slug is unique across the given model collection.
 * Appends -1, -2, etc. if duplicates are found.
 */
export async function generateUniqueSlug(
  name: string,
  model: Model<any>,
  excludeId?: string | mongoose.Types.ObjectId | null,
  providedSlug?: string | null
): Promise<string> {
  const base = providedSlug && providedSlug.trim().length > 0 ? slugify(providedSlug) : slugify(name);
  let candidate = base || 'item';
  let counter = 1;

  while (true) {
    const query: Record<string, unknown> = { slug: candidate };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const exists = await model.findOne(query).select('_id').lean();
    if (!exists) {
      return candidate;
    }
    candidate = `${base}-${counter}`;
    counter++;
  }
}
