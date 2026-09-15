import { redirect } from 'next/navigation';

export default function AdminBlogCategoriesRedirect() {
  redirect('/admin/blogs?tab=categories');
}
