import { redirect } from 'next/navigation';

export default function AdminNewsCategoriesRedirect() {
  redirect('/admin/news?tab=categories');
}
