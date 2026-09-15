'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { CmsImage } from '@/components/common/CmsImage';
import {
  getAllBlogsAdmin,
  createBlogAdmin,
  updateBlogAdmin,
  deleteBlogAdmin,
  getAllBlogCategoriesAdmin,
  createBlogCategoryAdmin,
  updateBlogCategoryAdmin,
  deleteBlogCategoryAdmin,
} from '@/lib/api/admin';
import { uploadAndOptimizeImageAdmin } from '@/lib/api/admin/media';
import { BlogPost, BlogCategory, BlogContentSection } from '@/data/blogs';
import { AdminTable } from '@/components/admin/ui/AdminTable';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminMediaPicker } from '@/components/admin/ui/AdminMediaPicker';
import { useToast } from '@/context/ToastContext';


type ActiveTab = 'posts' | 'categories';

export default function AdminBlogsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('posts');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting for Posts
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Search for Categories
  const [catSearchQuery, setCatSearchQuery] = useState('');

  // Blog Post Modal State
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null);

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<string | null>(null);

  // Media Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [mediaInputMode, setMediaInputMode] = useState<'url' | 'upload'>('url');

  const { showToast } = useToast();

  // Blog Post Form State
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    category: '',
    excerpt: '',
    author: 'AXION PackTech Team',
    authorRole: 'Packaging Machinery Specialist',
    readingTime: '5 min read',
    publishedDate: '',
    image: '',
    featured: false,
    published: true,
    introduction: '',
    sections: [] as BlogContentSection[],
    conclusion: '',
    tagsString: '',
    metaTitle: '',
    metaDescription: '',
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    slug: '',
    description: '',
    badge: 'Technology',
    icon: '⚙️',
    sortOrder: 0,
  });

  // Load All Data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [blogsRes, catsRes] = await Promise.all([
        getAllBlogsAdmin({ limit: 100 }),
        getAllBlogCategoriesAdmin(),
      ]);
      setBlogs(blogsRes.items || []);
      setCategories(catsRes || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load blog data';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Read tab from URL query if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'categories' || tabParam === 'posts') {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Category Blog Count Map
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of blogs) {
      const key = (b.categorySlug || b.category || '').toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [blogs]);

  // Slugify Helper
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Open Create Blog Modal
  const handleOpenCreatePost = () => {
    const defaultCat = categories[0]?.slug || 'packaging-technology';
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    setEditingPost(null);
    setPostForm({
      title: '',
      slug: '',
      category: defaultCat,
      excerpt: '',
      author: 'AXION PackTech Team',
      authorRole: 'Packaging Machinery Specialist',
      readingTime: '5 min read',
      publishedDate: today,
      image: '/images/blog/blog-default.jpg',
      featured: false,
      published: true,
      introduction: '',
      sections: [
        {
          heading: 'Technical Architecture & Operations',
          body: '',
          bulletPoints: [''],
          callout: '',
        },
      ],
      conclusion: '',
      tagsString: 'packaging, engineering, technology',
      metaTitle: '',
      metaDescription: '',
    });
    setPostModalOpen(true);
  };

  // Open Edit Blog Modal
  const handleOpenEditPost = (b: BlogPost) => {
    setEditingPost(b);

    const sections: BlogContentSection[] = Array.isArray(b.sections) && b.sections.length > 0
      ? b.sections
      : [
          {
            heading: 'Overview',
            body: b.excerpt || '',
            bulletPoints: [],
            callout: '',
          },
        ];

    setPostForm({
      title: b.title,
      slug: b.slug,
      category: b.categorySlug || b.category,
      excerpt: b.excerpt || '',
      author: b.author || 'AXION PackTech Team',
      authorRole: b.authorRole || 'Packaging Machinery Specialist',
      readingTime: b.readingTime || b.readTime || '5 min read',
      publishedDate: b.publishedDate || '',
      image: b.image || b.featuredImage || '/images/blog/blog-default.jpg',
      featured: Boolean(b.featured),
      published: b.published !== false,
      introduction: b.introduction || '',
      sections,
      conclusion: b.conclusion || '',
      tagsString: Array.isArray(b.tags) ? b.tags.join(', ') : '',
      metaTitle: b.title || '',
      metaDescription: b.excerpt || '',
    });
    setPostModalOpen(true);
  };

  // Save Blog (Create or Update)
  const handleSavePost = async (asPublished?: boolean) => {
    if (!postForm.title.trim() || !postForm.slug.trim() || !postForm.category) {
      showToast('Please provide a title, slug, and category.', 'warning');
      return;
    }

    const isPub = asPublished !== undefined ? asPublished : postForm.published;
    setIsSavingPost(true);

    try {
      const selectedCatObj = categories.find((c) => c.slug === postForm.category);
      const tags = postForm.tagsString
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      // Clean structured sections
      const cleanedSections = postForm.sections
        .map((sec) => ({
          heading: sec.heading?.trim() || '',
          body: sec.body?.trim() || '',
          bulletPoints: (sec.bulletPoints || []).map((b) => b.trim()).filter(Boolean),
          callout: sec.callout?.trim() || '',
        }))
        .filter((sec) => sec.heading || sec.body || (sec.bulletPoints && sec.bulletPoints.length > 0));

      const payload: Record<string, unknown> = {
        title: postForm.title.trim(),
        slug: postForm.slug.trim(),
        categorySlug: postForm.category,
        categoryName: selectedCatObj ? selectedCatObj.title : undefined,
        excerpt: postForm.excerpt.trim(),
        author: postForm.author.trim() || 'AXION PackTech Technical Editorial',
        authorRole: postForm.authorRole.trim() || 'Packaging Machinery Specialist',
        readingTime: postForm.readingTime.trim() || '5 min read',
        readTime: postForm.readingTime.trim() || '5 min read',
        publishedDate: postForm.publishedDate.trim() || new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        image: postForm.image.trim() || '/images/blog/blog-default.jpg',
        featuredImage: postForm.image.trim() || '/images/blog/blog-default.jpg',
        featured: Boolean(postForm.featured),
        published: isPub,
        tags,
        introduction: postForm.introduction.trim() || postForm.excerpt.trim(),
        sections: cleanedSections.length > 0 ? cleanedSections : [
          {
            heading: 'Details',
            body: postForm.excerpt.trim(),
            bulletPoints: [],
            callout: '',
          },
        ],
        conclusion: postForm.conclusion.trim(),
        seo: {
          metaTitle: postForm.metaTitle.trim() || postForm.title.trim(),
          metaDescription: postForm.metaDescription.trim() || postForm.excerpt.trim(),
        },
      };

      if (editingPost) {
        await updateBlogAdmin(editingPost.slug, payload);
        showToast(`Post "${postForm.title}" updated successfully`, 'success');
      } else {
        await createBlogAdmin(payload);
        showToast(`Post "${postForm.title}" created successfully`, 'success');
      }

      setPostModalOpen(false);
      window.dispatchEvent(new CustomEvent('blogs-updated'));
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save blog post';
      showToast(msg, 'error');
    } finally {
      setIsSavingPost(false);
    }
  };

  // Toggle Published Status Fast Click
  const handleTogglePublished = async (b: BlogPost) => {
    try {
      const newStatus = b.published === false;
      await updateBlogAdmin(b.slug, { published: newStatus });
      showToast(`Post "${b.title}" marked as ${newStatus ? 'Published' : 'Draft'}`, 'success');
      window.dispatchEvent(new CustomEvent('blogs-updated'));
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update post status';
      showToast(msg, 'error');
    }
  };

  // Delete Blog Post
  const handleDeletePost = async (slug: string) => {
    try {
      await deleteBlogAdmin(slug);
      showToast('Blog post deleted successfully', 'success');
      setDeleteConfirmSlug(null);
      window.dispatchEvent(new CustomEvent('blogs-updated'));
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete post';
      showToast(msg, 'error');
    }
  };

  // Open Create Category Modal
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      title: '',
      slug: '',
      description: '',
      badge: 'Technology',
      icon: '⚙️',
      sortOrder: categories.length + 1,
    });
    setCategoryModalOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEditCategory = (cat: BlogCategory) => {
    setEditingCategory(cat);
    setCategoryForm({
      title: cat.title,
      slug: cat.slug,
      description: cat.description || '',
      badge: cat.badge || 'Technology',
      icon: cat.icon || '⚙️',
      sortOrder: cat.sortOrder || 0,
    });
    setCategoryModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.title.trim() || !categoryForm.slug.trim()) {
      showToast('Category title and slug are required.', 'warning');
      return;
    }

    setIsSavingCategory(true);
    try {
      if (editingCategory) {
        await updateBlogCategoryAdmin(editingCategory.slug, categoryForm);
        showToast(`Category "${categoryForm.title}" updated successfully`, 'success');
      } else {
        await createBlogCategoryAdmin(categoryForm);
        showToast(`Category "${categoryForm.title}" created successfully`, 'success');
      }
      setCategoryModalOpen(false);
      window.dispatchEvent(new CustomEvent('blogs-updated'));
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save category';
      showToast(msg, 'error');
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (slug: string) => {
    try {
      await deleteBlogCategoryAdmin(slug);
      showToast('Category deleted successfully', 'success');
      setDeleteConfirmCategory(null);
      window.dispatchEvent(new CustomEvent('blogs-updated'));
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete category';
      showToast(msg, 'error');
    }
  };

  // Handle Image Upload File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'blog');
      const res = await uploadAndOptimizeImageAdmin(formData);
      if (res && res.url) {
        setPostForm((prev) => ({ ...prev, image: res.url }));
        showToast('Image uploaded and optimized successfully', 'success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image upload failed. You can paste a public URL instead.';
      showToast(msg, 'warning');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Structured Sections Helpers
  const handleAddSection = () => {
    setPostForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          heading: '',
          body: '',
          bulletPoints: [],
          callout: '',
        },
      ],
    }));
  };

  const handleRemoveSection = (idx: number) => {
    setPostForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateSectionHeading = (idx: number, heading: string) => {
    setPostForm((prev) => {
      const next = [...prev.sections];
      next[idx] = { ...next[idx], heading };
      return { ...prev, sections: next };
    });
  };

  const handleUpdateSectionBody = (idx: number, body: string) => {
    setPostForm((prev) => {
      const next = [...prev.sections];
      next[idx] = { ...next[idx], body };
      return { ...prev, sections: next };
    });
  };

  const handleUpdateSectionCallout = (idx: number, callout: string) => {
    setPostForm((prev) => {
      const next = [...prev.sections];
      next[idx] = { ...next[idx], callout };
      return { ...prev, sections: next };
    });
  };

  const handleAddBulletToSection = (secIdx: number) => {
    setPostForm((prev) => {
      const next = [...prev.sections];
      const bulletPoints = next[secIdx].bulletPoints ? [...next[secIdx].bulletPoints, ''] : [''];
      next[secIdx] = { ...next[secIdx], bulletPoints };
      return { ...prev, sections: next };
    });
  };

  const handleUpdateBullet = (secIdx: number, bIdx: number, text: string) => {
    setPostForm((prev) => {
      const next = [...prev.sections];
      const bulletPoints = next[secIdx].bulletPoints ? [...next[secIdx].bulletPoints] : [];
      bulletPoints[bIdx] = text;
      next[secIdx] = { ...next[secIdx], bulletPoints };
      return { ...prev, sections: next };
    });
  };

  const handleRemoveBullet = (secIdx: number, bIdx: number) => {
    setPostForm((prev) => {
      const next = [...prev.sections];
      const bulletPoints = (next[secIdx].bulletPoints || []).filter((_, i) => i !== bIdx);
      next[secIdx] = { ...next[secIdx], bulletPoints };
      return { ...prev, sections: next };
    });
  };

  // Filtered and Sorted Blog Posts
  const filteredBlogs = useMemo(() => {
    return blogs
      .filter((b) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          b.title.toLowerCase().includes(query) ||
          b.slug.toLowerCase().includes(query) ||
          (b.excerpt && b.excerpt.toLowerCase().includes(query)) ||
          (Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase().includes(query)));

        const catSlug = (b.categorySlug || b.category || '').toLowerCase();
        const matchesCat =
          selectedCategory === 'all' || catSlug === selectedCategory.toLowerCase();

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'published' && b.published !== false) ||
          (statusFilter === 'draft' && b.published === false);

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.publishedDate || 0).getTime() - new Date(a.publishedDate || 0).getTime();
        }
        return new Date(a.publishedDate || 0).getTime() - new Date(b.publishedDate || 0).getTime();
      });
  }, [blogs, searchQuery, selectedCategory, statusFilter, sortBy]);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const query = catSearchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query))
      );
    });
  }, [categories, catSearchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>📝</span>
            <span>Technical Blogs &amp; Insights</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, edit, publish, and organize engineering whitepapers, machinery guides, and blog categories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'posts' ? (
            <button
              onClick={handleOpenCreatePost}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-sky-950/40 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Blog</span>
            </button>
          ) : (
            <button
              onClick={handleOpenCreateCategory}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-sky-950/40 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Unified Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'posts'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span>📝 Blog Posts</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
              activeTab === 'posts' ? 'bg-sky-700/80 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {blogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'categories'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span>📂 Categories</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
              activeTab === 'categories' ? 'bg-sky-700/80 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {categories.length}
          </span>
        </button>
      </div>

      {/* 3. TAB 1: Blog Posts Management */}
      {activeTab === 'posts' && (
        <AdminTable
          title="All Technical Insights & Articles"
          description="Manage packaging machinery guides, engineering deep-dives, and automation whitepapers."
          totalCount={filteredBlogs.length}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search blogs by title, slug, topic..."
          filterComponent={
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Categories ({blogs.length})</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.icon || '📁'} {c.title} ({categoryCounts[c.slug.toLowerCase()] || 0})
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>

              {/* Sort Order */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Article Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author &amp; Role</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <p className="text-sm font-semibold">No blog posts found matching criteria.</p>
                      <button
                        onClick={handleOpenCreatePost}
                        className="mt-3 px-4 py-1.5 bg-sky-600/80 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold"
                      >
                        + Create First Blog Post
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((b) => {
                    const catSlug = b.categorySlug || b.category;
                    const cat = categories.find((c) => c.slug === catSlug);
                    return (
                      <tr key={b.slug} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="py-3.5 px-4 max-w-sm sm:max-w-md">
                          <div className="flex items-start gap-3">
                            {b.image || b.featuredImage ? (
                              <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 mt-0.5">
                                <CmsImage
                                  src={b.image || b.featuredImage || '/images/blog/blog-default.jpg'}
                                  alt={b.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                            ) : null}
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate text-xs sm:text-sm">
                                {b.title}
                              </span>
                              <span className="text-[11px] text-slate-400 block line-clamp-2 mt-0.5">
                                {b.excerpt}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                                /blog/{b.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-sky-400">
                            <span>{cat?.icon || '⚙️'}</span>
                            <span>{cat?.title || catSlug}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-300 font-medium truncate max-w-[140px]">
                            {b.author || 'AXION PackTech Team'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[140px] mt-0.5">
                            {b.authorRole || 'Specialist'}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleTogglePublished(b)}
                            title="Click to toggle publish status"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <AdminBadge variant={b.published !== false ? 'success' : 'neutral'}>
                              {b.published !== false ? 'Published' : 'Draft'}
                            </AdminBadge>
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/blog/${b.slug}`}
                              target="_blank"
                              title="View Live on Customer Website"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </Link>

                            <button
                              onClick={() => handleOpenEditPost(b)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg font-medium transition-colors"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => setDeleteConfirmSlug(b.slug)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950/60 text-rose-400 rounded-lg font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </AdminTable>
      )}

      {/* 4. TAB 2: Categories Management */}
      {activeTab === 'categories' && (
        <AdminTable
          title="Blog Categories"
          description="Manage taxonomy for technical packaging engineering topics and guides."
          totalCount={filteredCategories.length}
          isLoading={isLoading}
          searchQuery={catSearchQuery}
          onSearchChange={setCatSearchQuery}
          searchPlaceholder="Search categories..."
          actionButton={
            <button
              onClick={handleOpenCreateCategory}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Category</span>
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Category Name &amp; Icon</th>
                  <th className="py-3 px-4">Slug / URL</th>
                  <th className="py-3 px-4">Badge Label</th>
                  <th className="py-3 px-4 text-center">Articles Count</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <p className="text-sm font-semibold">No categories found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const count = categoryCounts[cat.slug.toLowerCase()] || 0;
                    return (
                      <tr key={cat.slug} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{cat.icon || '⚙️'}</span>
                            <div>
                              <span className="font-bold text-white block">{cat.title}</span>
                              <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                                {cat.description}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-400">/blog/category/{cat.slug}</td>

                        <td className="py-3 px-4">
                          <AdminBadge variant="info">{cat.badge || 'Category'}</AdminBadge>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-sky-400 font-mono font-bold text-xs">
                            {count} {count === 1 ? 'Article' : 'Articles'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditCategory(cat)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg font-medium transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirmCategory(cat.slug)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950/60 text-rose-400 rounded-lg font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </AdminTable>
      )}

      {/* 5. ADD / EDIT BLOG POST MODAL */}
      <AdminModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        title={editingPost ? 'Edit Blog Post' : 'Create Blog Post'}
        description="Organize your technical article into basic details, structured content, media, and SEO."
        maxWidth="4xl"
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pr-3 select-text">
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <span>📌</span>
                <span>Basic Information</span>
              </h3>
              <span className="text-[11px] text-slate-400">* Required Fields</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">Blog Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Comparative Engineering: VFFS vs HFFS Automation for Dry Powders"
                  value={postForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setPostForm((prev) => ({
                      ...prev,
                      title,
                      slug: editingPost ? prev.slug : slugify(title),
                    }));
                  }}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">Category *</label>
                    <button
                      type="button"
                      onClick={handleOpenCreateCategory}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold"
                    >
                      + New Category
                    </button>
                  </div>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.icon || '⚙️'} {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Author Name</label>
                  <input
                    type="text"
                    value={postForm.author}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="AXION PackTech Team"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Author Role / Specialization</label>
                  <input
                    type="text"
                    value={postForm.authorRole}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, authorRole: e.target.value }))}
                    placeholder="Packaging Machinery Specialist"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Published Date Display</label>
                  <input
                    type="text"
                    value={postForm.publishedDate}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, publishedDate: e.target.value }))}
                    placeholder="e.g. March 15, 2026"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Estimated Reading Time</label>
                  <input
                    type="text"
                    value={postForm.readingTime}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, readingTime: e.target.value }))}
                    placeholder="5 min read"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">Short Description / Excerpt *</label>
                <textarea
                  rows={2}
                  required
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Summary shown on blog listing cards and search engine snippets..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: URL & SLUG */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <span>🔗</span>
              <span>Web Address (URL)</span>
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">URL Slug *</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">/blog/</span>
                <input
                  type="text"
                  required
                  value={postForm.slug}
                  onChange={(e) => setPostForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Customer website URL: <span className="font-mono text-sky-300">/blog/{postForm.slug || 'your-slug'}</span>
              </p>
            </div>
          </div>

          {/* SECTION 3: CONTENT */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <span>📝</span>
                <span>Article Content</span>
              </h3>
              <span className="text-[11px] text-slate-400">Renders on the Customer Detail Page</span>
            </div>

            {/* Introduction Lead */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Introduction Lead <span className="text-slate-500">(Highlighted Intro Box)</span>
              </label>
              <textarea
                rows={3}
                value={postForm.introduction}
                onChange={(e) => setPostForm((prev) => ({ ...prev, introduction: e.target.value }))}
                placeholder="Opening thoughts and overview introducing the engineering concepts..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Structured Section Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Content Sections &amp; Technical Subsections</label>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-2.5 py-1 bg-sky-600/80 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <span>+ Add Section</span>
                </button>
              </div>

              {postForm.sections.map((section, sIdx) => (
                <div key={sIdx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/90 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-sky-400">Section {sIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sIdx)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                    >
                      Remove Section
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Section Heading *</label>
                    <input
                      type="text"
                      value={section.heading}
                      onChange={(e) => handleUpdateSectionHeading(sIdx, e.target.value)}
                      placeholder="e.g. Sealing Dynamics and Heat Transfer Efficiency"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Section Body Text</label>
                    <textarea
                      rows={3}
                      value={section.body}
                      onChange={(e) => handleUpdateSectionBody(sIdx, e.target.value)}
                      placeholder="Detailed explanation, mechanical concepts, and operational analysis..."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-2 pt-1 border-t border-slate-900">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-400">Key Feature Points / Bullets (Optional)</label>
                      <button
                        type="button"
                        onClick={() => handleAddBulletToSection(sIdx)}
                        className="text-[11px] text-sky-400 hover:text-sky-300"
                      >
                        + Add Bullet
                      </button>
                    </div>
                    {(section.bulletPoints || []).map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <span className="text-sky-500 text-xs">✓</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => handleUpdateBullet(sIdx, bIdx, e.target.value)}
                          placeholder="e.g. ±0.2°C temperature precision via PID closed-loop control"
                          className="w-full px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveBullet(sIdx, bIdx)}
                          className="p-1 text-slate-500 hover:text-rose-400 text-xs"
                          title="Remove bullet"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Callout Box */}
                  <div className="space-y-1 pt-1 border-t border-slate-900">
                    <label className="text-[11px] text-slate-400">Key Takeaway / Highlight Box (Optional)</label>
                    <input
                      type="text"
                      value={section.callout || ''}
                      onChange={(e) => handleUpdateSectionCallout(sIdx, e.target.value)}
                      placeholder="e.g. Tip: Regularly calibrate jaw tension sensors to prevent seal fatigue."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Conclusion */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Conclusion / Summary <span className="text-slate-500">(Final Takeaways)</span>
              </label>
              <textarea
                rows={3}
                value={postForm.conclusion}
                onChange={(e) => setPostForm((prev) => ({ ...prev, conclusion: e.target.value }))}
                placeholder="Concluding summary recapping the engineering recommendations and best practices..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* SECTION 4: MEDIA & FEATURED IMAGE */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <span>🖼️</span>
              <span>Featured Cover Image</span>
            </h3>

            <div className="space-y-3">
              <AdminMediaPicker
                label="Featured Cover Image"
                description="Main blog post banner displayed in cards, listings, and post hero"
                type="image"
                folder="blogs"
                value={postForm.image}
                onChange={(url) => setPostForm((prev) => ({ ...prev, image: url }))}
                required
              />
            </div>
          </div>

          {/* SECTION 5: SEO & TAGS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <span>🔍</span>
              <span>Search Engine Optimization (SEO) &amp; Tags</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">Article Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={postForm.tagsString}
                  onChange={(e) => setPostForm((prev) => ({ ...prev, tagsString: e.target.value }))}
                  placeholder="vffs, sealing, automation, industrial-design"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Meta Title</label>
                  <input
                    type="text"
                    value={postForm.metaTitle}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="Defaults to Post Title"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Meta Description</label>
                  <input
                    type="text"
                    value={postForm.metaDescription}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Defaults to Excerpt"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={postForm.featured}
                    onChange={(e) => setPostForm((prev) => ({ ...prev, featured: e.target.checked }))}
                    className="rounded border-slate-800 text-sky-600 focus:ring-sky-500 bg-slate-950"
                  />
                  <span className="text-xs font-semibold text-slate-300">Highlight as Featured Technical Guide</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPostModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSavingPost}
              onClick={() => handleSavePost(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold disabled:opacity-50"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={isSavingPost}
              onClick={() => handleSavePost(true)}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-950/40 disabled:opacity-50"
            >
              {isSavingPost ? 'Saving...' : editingPost ? 'Update & Publish' : 'Publish Blog'}
            </button>
          </div>
        </div>
      </AdminModal>

      {/* 6. ADD / EDIT CATEGORY MODAL */}
      <AdminModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Blog Category' : 'Create Blog Category'}
        description="Categories group technical posts on the customer website and blog filters."
        maxWidth="md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Category Title *</label>
            <input
              type="text"
              required
              value={categoryForm.title}
              onChange={(e) => {
                const title = e.target.value;
                setCategoryForm((prev) => ({
                  ...prev,
                  title,
                  slug: editingCategory ? prev.slug : slugify(title),
                }));
              }}
              placeholder="e.g. Packaging Technology"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Slug *</label>
              <input
                type="text"
                required
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Icon (Emoji)</label>
              <input
                type="text"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, icon: e.target.value }))}
                placeholder="⚙️"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white text-center focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Badge Label</label>
            <input
              type="text"
              value={categoryForm.badge}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, badge: e.target.value }))}
              placeholder="e.g. Smart Factory, Machine Innovation"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Category Description</label>
            <textarea
              rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of packaging engineering topics grouped in this category..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setCategoryModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingCategory}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md disabled:opacity-50"
            >
              {isSavingCategory ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* 7. DELETE BLOG POST CONFIRMATION MODAL */}
      <AdminModal
        isOpen={!!deleteConfirmSlug}
        onClose={() => setDeleteConfirmSlug(null)}
        title="Confirm Post Deletion"
        description="Are you sure you want to permanently delete this blog post?"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            {deleteConfirmSlug}
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteConfirmSlug(null)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirmSlug && handleDeletePost(deleteConfirmSlug)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
            >
              Delete Post
            </button>
          </div>
        </div>
      </AdminModal>

      {/* 8. DELETE CATEGORY CONFIRMATION MODAL */}
      <AdminModal
        isOpen={!!deleteConfirmCategory}
        onClose={() => setDeleteConfirmCategory(null)}
        title="Confirm Category Deletion"
        description="Are you sure you want to permanently delete this blog category?"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            {deleteConfirmCategory}
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteConfirmCategory(null)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirmCategory && handleDeleteCategory(deleteConfirmCategory)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
            >
              Delete Category
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
