'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { CmsImage } from '@/components/common/CmsImage';
import {
  getAllNewsAdmin,
  createNewsAdmin,
  updateNewsAdmin,
  deleteNewsAdmin,
  getAllNewsCategoriesAdmin,
  createNewsCategoryAdmin,
  updateNewsCategoryAdmin,
  deleteNewsCategoryAdmin,
} from '@/lib/api/admin';
import { uploadAndOptimizeImageAdmin } from '@/lib/api/admin/media';
import { NewsArticle, NewsCategory, ArticleSection } from '@/data/news';
import { AdminTable } from '@/components/admin/ui/AdminTable';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminMediaPicker } from '@/components/admin/ui/AdminMediaPicker';
import { useToast } from '@/context/ToastContext';


type ActiveTab = 'articles' | 'categories';

export default function AdminNewsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('articles');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting for Articles
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Search for Categories
  const [catSearchQuery, setCatSearchQuery] = useState('');

  // News Article Modal State
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [isSavingArticle, setIsSavingArticle] = useState(false);
  const [deleteConfirmArticle, setDeleteConfirmArticle] = useState<string | null>(null);

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<NewsCategory | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<string | null>(null);

  // Media Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [mediaInputMode, setMediaInputMode] = useState<'url' | 'upload'>('url');

  const { showToast } = useToast();

  // News Article Form State
  const [articleForm, setArticleForm] = useState({
    title: '',
    slug: '',
    categorySlug: '',
    excerpt: '',
    author: 'AXION PackTech Editorial Desk',
    readTime: '4 min read',
    publishedDate: '',
    featuredImage: '',
    featured: false,
    published: true,
    lead: '',
    sections: [] as ArticleSection[],
    quoteText: '',
    quoteAuthor: '',
    quoteRole: '',
    videoUrl: '',
    tagsString: '',
    metaTitle: '',
    metaDescription: '',
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    slug: '',
    description: '',
    badge: 'News',
    icon: '📰',
    sortOrder: 0,
  });

  // Load All Data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [newsRes, catsRes] = await Promise.all([
        getAllNewsAdmin({ limit: 100 }),
        getAllNewsCategoriesAdmin(),
      ]);
      setArticles(newsRes.items || []);
      setCategories(catsRes || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load news data';
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
      if (tabParam === 'categories' || tabParam === 'articles') {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Category Article Count Map
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const art of articles) {
      const key = art.categorySlug?.toLowerCase() || '';
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [articles]);

  // Handle Slug Auto-Generation
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Open Create Article Modal
  const handleOpenCreateArticle = () => {
    const defaultCat = categories[0]?.slug || 'company-news';
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    setEditingArticle(null);
    setArticleForm({
      title: '',
      slug: '',
      categorySlug: defaultCat,
      excerpt: '',
      author: 'AXION PackTech Editorial Desk',
      readTime: '4 min read',
      publishedDate: today,
      featuredImage: '/images/news/news-default.jpg',
      featured: false,
      published: true,
      lead: '',
      sections: [
        {
          heading: 'Overview & Key Highlights',
          paragraphs: [''],
          bullets: [''],
        },
      ],
      quoteText: '',
      quoteAuthor: 'Executive Leadership',
      quoteRole: 'AXION PackTech Management',
      videoUrl: '',
      tagsString: 'packaging, machinery, innovation',
      metaTitle: '',
      metaDescription: '',
    });
    setArticleModalOpen(true);
  };

  // Open Edit Article Modal
  const handleOpenEditArticle = (art: NewsArticle) => {
    setEditingArticle(art);

    const lead = typeof art.content === 'object' && art.content ? art.content.lead || art.excerpt || '' : art.excerpt || '';
    const sections: ArticleSection[] =
      typeof art.content === 'object' && art.content && Array.isArray(art.content.sections)
        ? art.content.sections
        : [
            {
              heading: 'Overview',
              paragraphs: [typeof art.content === 'string' ? art.content : art.excerpt || ''],
              bullets: [],
            },
          ];

    const quote = typeof art.content === 'object' && art.content ? art.content.quote : undefined;

    setArticleForm({
      title: art.title,
      slug: art.slug,
      categorySlug: art.categorySlug || 'company-news',
      excerpt: art.excerpt || '',
      author: art.author || 'AXION PackTech Editorial Desk',
      readTime: art.readTime || '4 min read',
      publishedDate: art.publishedDate || '',
      featuredImage: art.featuredImage || art.image || '/images/news/news-default.jpg',
      featured: Boolean(art.featured),
      published: art.published !== false,
      lead,
      sections,
      quoteText: quote?.text || '',
      quoteAuthor: quote?.author || '',
      quoteRole: quote?.role || '',
      videoUrl: art.video?.url || art.videoUrl || '',
      tagsString: Array.isArray(art.tags) ? art.tags.join(', ') : '',
      metaTitle: art.seo?.metaTitle || '',
      metaDescription: art.seo?.metaDescription || '',
    });
    setArticleModalOpen(true);
  };

  // Save Article (Create or Update)
  const handleSaveArticle = async (asPublished?: boolean) => {
    if (!articleForm.title.trim() || !articleForm.slug.trim() || !articleForm.categorySlug) {
      showToast('Please provide an article title, slug, and category.', 'warning');
      return;
    }

    const isPub = asPublished !== undefined ? asPublished : articleForm.published;
    setIsSavingArticle(true);

    try {
      const selectedCatObj = categories.find((c) => c.slug === articleForm.categorySlug);
      const tags = articleForm.tagsString
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      // Clean structured sections
      const cleanedSections = articleForm.sections
        .map((sec) => ({
          heading: sec.heading?.trim() || '',
          paragraphs: sec.paragraphs.map((p) => p.trim()).filter(Boolean),
          bullets: (sec.bullets || []).map((b) => b.trim()).filter(Boolean),
        }))
        .filter((sec) => sec.heading || sec.paragraphs.length > 0 || sec.bullets.length > 0);

      const contentObj = {
        lead: articleForm.lead.trim() || articleForm.excerpt.trim(),
        sections: cleanedSections.length > 0 ? cleanedSections : [
          {
            heading: 'Details',
            paragraphs: [articleForm.excerpt.trim()],
            bullets: [],
          },
        ],
        quote: articleForm.quoteText.trim()
          ? {
              text: articleForm.quoteText.trim(),
              author: articleForm.quoteAuthor.trim() || 'AXION PackTech Management',
              role: articleForm.quoteRole.trim() || 'Executive Team',
            }
          : undefined,
      };

      const payload: Record<string, unknown> = {
        title: articleForm.title.trim(),
        slug: articleForm.slug.trim(),
        categorySlug: articleForm.categorySlug,
        category: articleForm.categorySlug,
        categoryName: selectedCatObj ? selectedCatObj.title : undefined,
        excerpt: articleForm.excerpt.trim() || articleForm.lead.trim(),
        author: articleForm.author.trim(),
        readTime: articleForm.readTime.trim(),
        publishedDate: articleForm.publishedDate.trim(),
        featuredImage: articleForm.featuredImage.trim() || '/images/news/news-default.jpg',
        image: articleForm.featuredImage.trim() || '/images/news/news-default.jpg',
        featured: articleForm.featured,
        published: isPub,
        tags,
        content: contentObj,
        videoUrl: articleForm.videoUrl.trim() || undefined,
        video: articleForm.videoUrl.trim()
          ? {
              type: articleForm.videoUrl.includes('embed') || articleForm.videoUrl.includes('youtube') ? 'embed' : 'local',
              url: articleForm.videoUrl.trim(),
            }
          : undefined,
        seo: {
          metaTitle: articleForm.metaTitle.trim() || articleForm.title.trim(),
          metaDescription: articleForm.metaDescription.trim() || articleForm.excerpt.trim(),
        },
      };

      if (editingArticle) {
        await updateNewsAdmin(editingArticle.slug, payload);
        showToast(`Article "${articleForm.title}" updated successfully`, 'success');
      } else {
        await createNewsAdmin(payload);
        showToast(`Article "${articleForm.title}" created successfully`, 'success');
      }

      setArticleModalOpen(false);
      window.dispatchEvent(new CustomEvent('news-updated'));
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save news article';
      showToast(msg, 'error');
    } finally {
      setIsSavingArticle(false);
    }
  };

  // Toggle Published Status Fast Click
  const handleTogglePublished = async (art: NewsArticle) => {
    try {
      const newStatus = !art.published;
      await updateNewsAdmin(art.slug, { published: newStatus });
      showToast(`Article "${art.title}" marked as ${newStatus ? 'Published' : 'Draft'}`, 'success');
      window.dispatchEvent(new CustomEvent('news-updated'));
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update article status';
      showToast(msg, 'error');
    }
  };

  // Delete Article
  const handleDeleteArticle = async (slug: string) => {
    try {
      await deleteNewsAdmin(slug);
      showToast('Article deleted successfully', 'success');
      setDeleteConfirmArticle(null);
      window.dispatchEvent(new CustomEvent('news-updated'));
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete article';
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
      badge: 'News',
      icon: '📰',
      sortOrder: categories.length + 1,
    });
    setCategoryModalOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEditCategory = (cat: NewsCategory) => {
    setEditingCategory(cat);
    setCategoryForm({
      title: cat.title,
      slug: cat.slug,
      description: cat.description || '',
      badge: cat.badge || 'News',
      icon: cat.icon || '📰',
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
        await updateNewsCategoryAdmin(editingCategory.slug, categoryForm);
        showToast(`Category "${categoryForm.title}" updated successfully`, 'success');
      } else {
        await createNewsCategoryAdmin(categoryForm);
        showToast(`Category "${categoryForm.title}" created successfully`, 'success');
      }
      setCategoryModalOpen(false);
      window.dispatchEvent(new CustomEvent('news-updated'));
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
      await deleteNewsCategoryAdmin(slug);
      showToast('Category deleted successfully', 'success');
      setDeleteConfirmCategory(null);
      window.dispatchEvent(new CustomEvent('news-updated'));
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
      formData.append('folder', 'news');
      const res = await uploadAndOptimizeImageAdmin(formData);
      if (res && res.url) {
        setArticleForm((prev) => ({ ...prev, featuredImage: res.url }));
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
    setArticleForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          heading: '',
          paragraphs: [''],
          bullets: [],
        },
      ],
    }));
  };

  const handleRemoveSection = (idx: number) => {
    setArticleForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateSectionHeading = (idx: number, heading: string) => {
    setArticleForm((prev) => {
      const next = [...prev.sections];
      next[idx] = { ...next[idx], heading };
      return { ...prev, sections: next };
    });
  };

  const handleUpdateSectionParagraph = (secIdx: number, pIdx: number, text: string) => {
    setArticleForm((prev) => {
      const next = [...prev.sections];
      const paragraphs = [...next[secIdx].paragraphs];
      paragraphs[pIdx] = text;
      next[secIdx] = { ...next[secIdx], paragraphs };
      return { ...prev, sections: next };
    });
  };

  const handleAddParagraphToSection = (secIdx: number) => {
    setArticleForm((prev) => {
      const next = [...prev.sections];
      next[secIdx] = {
        ...next[secIdx],
        paragraphs: [...next[secIdx].paragraphs, ''],
      };
      return { ...prev, sections: next };
    });
  };

  const handleRemoveParagraphFromSection = (secIdx: number, pIdx: number) => {
    setArticleForm((prev) => {
      const next = [...prev.sections];
      next[secIdx] = {
        ...next[secIdx],
        paragraphs: next[secIdx].paragraphs.filter((_, i) => i !== pIdx),
      };
      return { ...prev, sections: next };
    });
  };

  const handleAddBulletToSection = (secIdx: number) => {
    setArticleForm((prev) => {
      const next = [...prev.sections];
      const bullets = next[secIdx].bullets ? [...next[secIdx].bullets, ''] : [''];
      next[secIdx] = { ...next[secIdx], bullets };
      return { ...prev, sections: next };
    });
  };

  const handleUpdateBullet = (secIdx: number, bIdx: number, text: string) => {
    setArticleForm((prev) => {
      const next = [...prev.sections];
      const bullets = next[secIdx].bullets ? [...next[secIdx].bullets] : [];
      bullets[bIdx] = text;
      next[secIdx] = { ...next[secIdx], bullets };
      return { ...prev, sections: next };
    });
  };

  const handleRemoveBullet = (secIdx: number, bIdx: number) => {
    setArticleForm((prev) => {
      const next = [...prev.sections];
      const bullets = (next[secIdx].bullets || []).filter((_, i) => i !== bIdx);
      next[secIdx] = { ...next[secIdx], bullets };
      return { ...prev, sections: next };
    });
  };

  // Filtered and Sorted Articles
  const filteredArticles = useMemo(() => {
    return articles
      .filter((art) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          art.title.toLowerCase().includes(query) ||
          art.slug.toLowerCase().includes(query) ||
          (art.excerpt && art.excerpt.toLowerCase().includes(query)) ||
          (Array.isArray(art.tags) && art.tags.some((t) => t.toLowerCase().includes(query)));

        const matchesCat =
          selectedCategory === 'all' || art.categorySlug === selectedCategory;

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'published' && art.published !== false) ||
          (statusFilter === 'draft' && art.published === false);

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.publishedDate || 0).getTime() - new Date(a.publishedDate || 0).getTime();
        }
        return new Date(a.publishedDate || 0).getTime() - new Date(b.publishedDate || 0).getTime();
      });
  }, [articles, searchQuery, selectedCategory, statusFilter, sortBy]);

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
            <span>📰</span>
            <span>News &amp; Media Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, edit, publish, and organize press releases, announcements, and news categories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'articles' ? (
            <button
              onClick={handleOpenCreateArticle}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-sky-950/40 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add News</span>
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
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'articles'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span>📰 News Articles</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
              activeTab === 'articles' ? 'bg-sky-700/80 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {articles.length}
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

      {/* 3. TAB 1: News Articles Management */}
      {activeTab === 'articles' && (
        <AdminTable
          title="All News Releases & Articles"
          description="Manage corporate press releases, machine launch announcements, and media publications."
          totalCount={filteredArticles.length}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search news by title, slug, keywords..."
          filterComponent={
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Categories ({articles.length})</option>
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
                  <th className="py-3 px-4">Headline / Article</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author &amp; Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <p className="text-sm font-semibold">No news articles found matching criteria.</p>
                      <button
                        onClick={handleOpenCreateArticle}
                        className="mt-3 px-4 py-1.5 bg-sky-600/80 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold"
                      >
                        + Create First Article
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((art) => {
                    const cat = categories.find((c) => c.slug === art.categorySlug);
                    return (
                      <tr key={art.slug} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="py-3.5 px-4 max-w-sm sm:max-w-md">
                          <div className="flex items-start gap-3">
                            {art.featuredImage || art.image ? (
                              <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 mt-0.5">
                                <CmsImage
                                  src={art.featuredImage || art.image || '/images/news/news-default.jpg'}
                                  alt={art.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                            ) : null}
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate text-xs sm:text-sm">
                                {art.title}
                              </span>
                              <span className="text-[11px] text-slate-400 block line-clamp-2 mt-0.5">
                                {art.excerpt}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                                /news/{art.categorySlug}/{art.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-sky-400">
                            <span>{cat?.icon || '📁'}</span>
                            <span>{cat?.title || art.categorySlug}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-300 font-medium truncate max-w-[140px]">
                            {art.author || 'Editorial Desk'}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{art.publishedDate}</div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleTogglePublished(art)}
                            title="Click to toggle publish status"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <AdminBadge variant={art.published !== false ? 'success' : 'neutral'}>
                              {art.published !== false ? 'Published' : 'Draft'}
                            </AdminBadge>
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/news/${art.categorySlug}/${art.slug}`}
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
                              onClick={() => handleOpenEditArticle(art)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg font-medium transition-colors"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => setDeleteConfirmArticle(art.slug)}
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
          title="News Categories"
          description="Manage taxonomy and groups for organizing press releases and articles."
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
                  <th className="py-3 px-4 text-center">Article Count</th>
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
                            <span className="text-lg">{cat.icon || '📁'}</span>
                            <div>
                              <span className="font-bold text-white block">{cat.title}</span>
                              <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                                {cat.description}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-400">/news/{cat.slug}</td>

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

      {/* 5. ADD / EDIT NEWS ARTICLE MODAL */}
      <AdminModal
        isOpen={articleModalOpen}
        onClose={() => setArticleModalOpen(false)}
        title={editingArticle ? 'Edit News Article' : 'Create News Article'}
        description="Organize your release into basic information, rich content sections, media, and SEO."
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
                <label className="text-xs font-semibold text-slate-200">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AXION Launches High-Speed Intelligent VFFS Packaging System"
                  value={articleForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setArticleForm((prev) => ({
                      ...prev,
                      title,
                      slug: editingArticle ? prev.slug : slugify(title),
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
                    value={articleForm.categorySlug}
                    onChange={(e) => setArticleForm((prev) => ({ ...prev, categorySlug: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.icon || '📁'} {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Author / Source</label>
                  <input
                    type="text"
                    value={articleForm.author}
                    onChange={(e) => setArticleForm((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="AXION PackTech Editorial Desk"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Published Date Display</label>
                  <input
                    type="text"
                    value={articleForm.publishedDate}
                    onChange={(e) => setArticleForm((prev) => ({ ...prev, publishedDate: e.target.value }))}
                    placeholder="e.g. March 15, 2026"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Estimated Read Time</label>
                  <input
                    type="text"
                    value={articleForm.readTime}
                    onChange={(e) => setArticleForm((prev) => ({ ...prev, readTime: e.target.value }))}
                    placeholder="4 min read"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">Short Description / Excerpt *</label>
                <textarea
                  rows={2}
                  required
                  value={articleForm.excerpt}
                  onChange={(e) => setArticleForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Summary shown on news listings, cards, and search result previews..."
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
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                  /news/{articleForm.categorySlug}/
                </span>
                <input
                  type="text"
                  required
                  value={articleForm.slug}
                  onChange={(e) => setArticleForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Customer website URL: <span className="font-mono text-sky-300">/news/{articleForm.categorySlug}/{articleForm.slug || 'your-slug'}</span>
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

            {/* Lead Paragraph */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Lead Overview Paragraph <span className="text-slate-500">(Highlighted Intro Box)</span>
              </label>
              <textarea
                rows={3}
                value={articleForm.lead}
                onChange={(e) => setArticleForm((prev) => ({ ...prev, lead: e.target.value }))}
                placeholder="Opening paragraph highlighted at the top of the article..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Structured Section Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Content Sections &amp; Headings</label>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-2.5 py-1 bg-sky-600/80 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <span>+ Add Section</span>
                </button>
              </div>

              {articleForm.sections.map((section, sIdx) => (
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
                    <label className="text-[11px] text-slate-400">Section Heading (Optional)</label>
                    <input
                      type="text"
                      value={section.heading || ''}
                      onChange={(e) => handleUpdateSectionHeading(sIdx, e.target.value)}
                      placeholder="e.g. Next-Generation Automation Features"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Paragraphs in Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-400">Paragraphs</label>
                      <button
                        type="button"
                        onClick={() => handleAddParagraphToSection(sIdx)}
                        className="text-[11px] text-sky-400 hover:text-sky-300"
                      >
                        + Add Paragraph
                      </button>
                    </div>
                    {section.paragraphs.map((para, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2">
                        <textarea
                          rows={2}
                          value={para}
                          onChange={(e) => handleUpdateSectionParagraph(sIdx, pIdx, e.target.value)}
                          placeholder="Enter paragraph text..."
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                        {section.paragraphs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveParagraphFromSection(sIdx, pIdx)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                            title="Remove paragraph"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Bullet Points in Section */}
                  <div className="space-y-2 pt-1 border-t border-slate-900">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-400">Bullet Points / Features (Optional)</label>
                      <button
                        type="button"
                        onClick={() => handleAddBulletToSection(sIdx)}
                        className="text-[11px] text-sky-400 hover:text-sky-300"
                      >
                        + Add Bullet
                      </button>
                    </div>
                    {(section.bullets || []).map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <span className="text-sky-500 text-xs">✓</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => handleUpdateBullet(sIdx, bIdx, e.target.value)}
                          placeholder="e.g. Speeds up to 120 bags per minute with dual servo control"
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
                </div>
              ))}
            </div>

            {/* Optional Quote / Callout */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-200">
                Executive Quote / Callout <span className="text-slate-500">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={articleForm.quoteText}
                onChange={(e) => setArticleForm((prev) => ({ ...prev, quoteText: e.target.value }))}
                placeholder="Quote text highlighting an executive statement or key insight..."
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={articleForm.quoteAuthor}
                  onChange={(e) => setArticleForm((prev) => ({ ...prev, quoteAuthor: e.target.value }))}
                  placeholder="Quote Author (e.g. Chief Technical Officer)"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <input
                  type="text"
                  value={articleForm.quoteRole}
                  onChange={(e) => setArticleForm((prev) => ({ ...prev, quoteRole: e.target.value }))}
                  placeholder="Author Role (e.g. AXION PackTech Leadership)"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: MEDIA & FEATURED IMAGE */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <span>🖼️</span>
              <span>Featured Media &amp; Video</span>
            </h3>

            <div className="space-y-4">
              <AdminMediaPicker
                label="Featured Image"
                description="Main cover image displayed on news catalog cards and article header"
                type="image"
                folder="news"
                value={articleForm.featuredImage}
                onChange={(url) => setArticleForm((prev) => ({ ...prev, featuredImage: url }))}
                required
              />

              <AdminMediaPicker
                label="Article Video (Optional)"
                description="Embedded or direct video player displayed inside the news article"
                type="video"
                folder="news/videos"
                value={articleForm.videoUrl}
                onChange={(url) => setArticleForm((prev) => ({ ...prev, videoUrl: url }))}
                allowClear
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
                  value={articleForm.tagsString}
                  onChange={(e) => setArticleForm((prev) => ({ ...prev, tagsString: e.target.value }))}
                  placeholder="packaging, vffs, engineering, automation"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Meta Title</label>
                  <input
                    type="text"
                    value={articleForm.metaTitle}
                    onChange={(e) => setArticleForm((prev) => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="Defaults to Article Title"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Meta Description</label>
                  <input
                    type="text"
                    value={articleForm.metaDescription}
                    onChange={(e) => setArticleForm((prev) => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Defaults to Excerpt"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={articleForm.featured}
                    onChange={(e) => setArticleForm((prev) => ({ ...prev, featured: e.target.checked }))}
                    className="rounded border-slate-800 text-sky-600 focus:ring-sky-500 bg-slate-950"
                  />
                  <span className="text-xs font-semibold text-slate-300">Highlight as Featured Article</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setArticleModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSavingArticle}
              onClick={() => handleSaveArticle(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold disabled:opacity-50"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={isSavingArticle}
              onClick={() => handleSaveArticle(true)}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-950/40 disabled:opacity-50"
            >
              {isSavingArticle ? 'Saving...' : editingArticle ? 'Update & Publish' : 'Publish Article'}
            </button>
          </div>
        </div>
      </AdminModal>

      {/* 6. ADD / EDIT CATEGORY MODAL */}
      <AdminModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? 'Edit News Category' : 'Create News Category'}
        description="Categories group news articles on the customer website and navigation menu."
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
              placeholder="e.g. Technology Innovations"
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
                placeholder="📰"
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
              placeholder="e.g. Release, Update, Global"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-200">Category Description</label>
            <textarea
              rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of articles grouped in this category..."
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

      {/* 7. DELETE ARTICLE CONFIRMATION MODAL */}
      <AdminModal
        isOpen={!!deleteConfirmArticle}
        onClose={() => setDeleteConfirmArticle(null)}
        title="Confirm Article Deletion"
        description="Are you sure you want to permanently delete this news article?"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            {deleteConfirmArticle}
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteConfirmArticle(null)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirmArticle && handleDeleteArticle(deleteConfirmArticle)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
            >
              Delete Article
            </button>
          </div>
        </div>
      </AdminModal>

      {/* 8. DELETE CATEGORY CONFIRMATION MODAL */}
      <AdminModal
        isOpen={!!deleteConfirmCategory}
        onClose={() => setDeleteConfirmCategory(null)}
        title="Confirm Category Deletion"
        description="Are you sure you want to permanently delete this news category?"
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
