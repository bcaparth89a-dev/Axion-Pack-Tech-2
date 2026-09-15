'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CmsImage } from '@/components/common/CmsImage';
import Link from 'next/link';
import {
  getCatalogProductsAdmin,
  getCatalogProductTreeAdmin,
  CatalogHierarchyNode,
} from '@/lib/api/admin/catalogProducts';
import {
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
  reorderCategoriesAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  reorderProductsAdmin,
  createModelAdmin,
  updateModelAdmin,
  deleteModelAdmin,
  reorderModelsAdmin,
} from '@/lib/api/admin/products';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminMediaPicker } from '@/components/admin/ui/AdminMediaPicker';
import { AdminHeroEditor } from '@/components/admin/ui/AdminHeroEditor';
import { AdminGalleryManager } from '@/components/admin/ui/AdminGalleryManager';
import { AdminPdfManager } from '@/components/admin/ui/AdminPdfManager';
import { AdminSpecificationBuilder } from '@/components/admin/ui/AdminSpecificationBuilder';
import { AdminInfoAndFeaturesEditor } from '@/components/admin/ui/AdminInfoAndFeaturesEditor';
import {
  EntityHero,
  GalleryMediaItem,
  CatalogPdf,
  SpecificationTable,
} from '@/types/products';
import { useToast } from '@/context/ToastContext';

// ----------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------
type CatalogType = 'category' | 'product' | 'model';
type FilterTab = 'all' | 'categories' | 'products' | 'models' | 'published' | 'draft';

interface FlatCatalogItem {
  _id: string;
  name: string;
  slug: string;
  type: CatalogType;
  modelNumber?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  heroImage?: string;
  displayOrder: number;
  isActive: boolean;
  parentId?: string | null;
  parentType?: string | null;
  path: string;
  depth: number;
  hasChildren: boolean;
  childrenCount: number;
}

interface FormEntityState {
  _id: string;
  name: string;
  slug: string;
  type: CatalogType;
  modelNumber?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  heroImage?: string;
  displayOrder: number;
  isActive: boolean;
  parentId?: string | null;
  parentType?: string | null;
  hero?: EntityHero;
  galleryMedia?: GalleryMediaItem[];
  catalogPdf?: CatalogPdf;
  features?: string[];
  infoPoints?: string[];
  specificationsTable?: SpecificationTable;
  specifications?: Array<{ key?: string; label?: string; value: string; group?: string }>;
}

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

function flattenTree(
  nodes: CatalogHierarchyNode[],
  parentPath: string = '/products',
  depth: number = 0
): FlatCatalogItem[] {
  const result: FlatCatalogItem[] = [];

  for (const node of nodes) {
    const rawType = node.type;
    const normalizedType: CatalogType =
      rawType === 'model' ? 'model' : rawType === 'product' ? 'product' : 'category';

    const currentPath = `${parentPath}/${node.slug}`;
    const childrenCount = node.children ? node.children.length : 0;

    result.push({
      _id: node._id,
      name: node.name,
      slug: node.slug,
      type: normalizedType,
      modelNumber: node.modelNumber,
      shortDescription: node.shortDescription,
      description: node.description,
      image: node.image,
      heroImage: node.heroImage,
      displayOrder: node.displayOrder ?? 0,
      isActive: node.isActive !== false,
      parentId: node.parentId,
      parentType: node.parentType,
      path: currentPath,
      depth,
      hasChildren: childrenCount > 0,
      childrenCount,
    });

    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, currentPath, depth + 1));
    }
  }

  return result;
}

function findNodeById(nodes: CatalogHierarchyNode[], targetId: string): CatalogHierarchyNode | null {
  for (const node of nodes) {
    if (node._id === targetId) return node;
    if (node.children?.length) {
      const found = findNodeById(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

function getDescendantIds(node: CatalogHierarchyNode): string[] {
  const ids: string[] = [];
  const traverse = (children?: CatalogHierarchyNode[]) => {
    if (!children) return;
    for (const child of children) {
      ids.push(child._id);
      if (child.children?.length) traverse(child.children);
    }
  };
  traverse(node.children);
  return ids;
}

function findAncestorIds(
  nodes: CatalogHierarchyNode[],
  targetId: string,
  ancestors: string[] = []
): string[] | null {
  for (const node of nodes) {
    if (node._id === targetId) return ancestors;
    if (node.children?.length) {
      const found = findAncestorIds(node.children, targetId, [...ancestors, node._id]);
      if (found) return found;
    }
  }
  return null;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export default function AdminProductPages() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Data States
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [tree, setTree] = useState<CatalogHierarchyNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 2. Tree Interaction & Navigation
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<string>('basic');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  // 3. Selected Entity Editor State
  const [editingForm, setEditingForm] = useState<FormEntityState | null>(null);
  const [autoSlug, setAutoSlug] = useState(false);

  // 4. Creation Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<CatalogType>('category');
  const [createName, setCreateName] = useState('');
  const [createModelNumber, setCreateModelNumber] = useState('');
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [createStatus, setCreateStatus] = useState<'published' | 'draft'>('published');
  const [isCreating, setIsCreating] = useState(false);

  // 5. Node Quick-Add Popup & Context Menu States
  const [quickAddAnchorId, setQuickAddAnchorId] = useState<string | null>(null);
  const [contextMenuNodeId, setContextMenuNodeId] = useState<string | null>(null);

  // 6. Move Entity Modal State
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [movingNode, setMovingNode] = useState<CatalogHierarchyNode | null>(null);
  const [moveTargetParentId, setMoveTargetParentId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  // 7. Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingNode, setDeletingNode] = useState<CatalogHierarchyNode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 8. Live Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // 9. Drag & Drop State
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{
    targetId: string;
    position: 'before' | 'after' | 'inside';
  } | null>(null);

  // Close context popups when clicking elsewhere or pressing Escape
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-context-menu]') && !target.closest('[data-quick-add]')) {
        setContextMenuNodeId(null);
        setQuickAddAnchorId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenuNodeId(null);
        setQuickAddAnchorId(null);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle URL query parameters for fast creation from other screens
  useEffect(() => {
    const createParam = searchParams.get('create');
    if (createParam === 'category' || createParam === 'product' || createParam === 'model') {
      handleOpenCreateModal(createParam, null);
    }
  }, [searchParams]);

  // Keyboard shortcut Ctrl/Cmd+S to save
  const handleSaveEntityRef = useRef<() => Promise<void>>(() => Promise.resolve());
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (editingForm && !isSaving) {
          handleSaveEntityRef.current();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingForm, isSaving]);

  // --------------------------------------------------------------------
  // Load Hierarchy Data
  // --------------------------------------------------------------------
  const loadHierarchy = useCallback(
    async (productId?: string) => {
      setIsLoading(true);
      try {
        const prods = await getCatalogProductsAdmin(true);
        const targetProdId = productId || selectedProductId || (prods.length > 0 ? prods[0]._id : 'default');
        setSelectedProductId(targetProdId);
        const treeData = await getCatalogProductTreeAdmin(targetProdId, false);
        setTree(treeData);

        // Auto-expand top level nodes on initial load
        setExpandedIds((prev) => {
          if (prev.size === 0) {
            const next = new Set<string>();
            treeData.forEach((n) => next.add(n._id));
            return next;
          }
          return prev;
        });
      } catch (err: unknown) {
        showToast((err as Error)?.message || 'Failed to load catalog tree', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedProductId, showToast]
  );

  useEffect(() => {
    loadHierarchy();
  }, [loadHierarchy]);

  // Flattened tree
  const flatItems = useMemo(() => flattenTree(tree), [tree]);

  // Statistics
  const stats = useMemo(() => {
    const categoriesCount = flatItems.filter((i) => i.type === 'category').length;
    const productsCount = flatItems.filter((i) => i.type === 'product').length;
    const modelsCount = flatItems.filter((i) => i.type === 'model').length;
    const publishedCount = flatItems.filter((i) => i.isActive).length;
    const draftCount = flatItems.filter((i) => !i.isActive).length;
    return {
      categories: categoriesCount,
      products: productsCount,
      models: modelsCount,
      published: publishedCount,
      draft: draftCount,
      total: flatItems.length,
    };
  }, [flatItems]);

  // Filtered & Searched tree list
  const filteredItems = useMemo(() => {
    let items = flatItems;

    if (filterTab === 'categories') {
      items = items.filter((i) => i.type === 'category');
    } else if (filterTab === 'products') {
      items = items.filter((i) => i.type === 'product');
    } else if (filterTab === 'models') {
      items = items.filter((i) => i.type === 'model');
    } else if (filterTab === 'published') {
      items = items.filter((i) => i.isActive);
    } else if (filterTab === 'draft') {
      items = items.filter((i) => !i.isActive);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.slug.toLowerCase().includes(q) ||
          (i.modelNumber && i.modelNumber.toLowerCase().includes(q)) ||
          i.type.toLowerCase().includes(q)
      );
    }

    return items;
  }, [flatItems, filterTab, searchQuery]);

  // Auto-expand search matches
  useEffect(() => {
    if (searchQuery.trim() && tree.length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const matchedIds = flatItems
        .filter((i) => i.name.toLowerCase().includes(q) || (i.modelNumber && i.modelNumber.toLowerCase().includes(q)))
        .map((i) => i._id);

      const toExpand = new Set<string>(expandedIds);
      matchedIds.forEach((id) => {
        const ancestors = findAncestorIds(tree, id);
        if (ancestors) {
          ancestors.forEach((aId) => toExpand.add(aId));
        }
      });
      setExpandedIds(toExpand);
    }
  }, [searchQuery, flatItems, tree, expandedIds]);

  // --------------------------------------------------------------------
  // Select Entity for Editing
  // --------------------------------------------------------------------
  const handleSelectNode = useCallback(
    (node: { _id: string }) => {
      const fullNode = findNodeById(tree, node._id);
      if (!fullNode) return;

      const rawType = fullNode.type;
      const normalizedType: CatalogType =
        rawType === 'model' ? 'model' : rawType === 'product' ? 'product' : 'category';

      setSelectedNodeId(fullNode._id);
      setEditingForm({
        _id: fullNode._id,
        name: fullNode.name,
        slug: fullNode.slug,
        type: normalizedType,
        modelNumber: fullNode.modelNumber || '',
        shortDescription: fullNode.shortDescription || '',
        description: fullNode.description || '',
        image: fullNode.image || '',
        heroImage: fullNode.heroImage || '',
        displayOrder: fullNode.displayOrder ?? 0,
        isActive: fullNode.isActive !== false,
        parentId: fullNode.parentId,
        parentType: fullNode.parentType,
        hero: fullNode.hero,
        galleryMedia: fullNode.galleryMedia || [],
        catalogPdf: fullNode.catalogPdf,
        features: fullNode.features || [],
        infoPoints: fullNode.infoPoints || [],
        specificationsTable: fullNode.specificationsTable,
        specifications: fullNode.specifications || [],
      });

      setHasUnsavedChanges(false);
      setAutoSlug(false);
    },
    [tree]
  );

  const updateFormField = <K extends keyof FormEntityState>(field: K, value: FormEntityState[K]) => {
    setEditingForm((prev) => {
      if (!prev) return null;
      const next = { ...prev, [field]: value };
      if (field === 'name' && autoSlug) {
        next.slug = generateSlug(String(value));
      }
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Expand / Collapse toggler
  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const all = new Set<string>();
    flatItems.forEach((i) => all.add(i._id));
    setExpandedIds(all);
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  // --------------------------------------------------------------------
  // Entity Creation Flow
  // --------------------------------------------------------------------
  const handleOpenCreateModal = (type: CatalogType = 'category', parentId: string | null = null) => {
    setCreateType(type);
    setCreateParentId(parentId);
    setCreateName('');
    setCreateModelNumber('');
    setCreateStatus('published');
    setCreateModalOpen(true);
    setQuickAddAnchorId(null);
    setContextMenuNodeId(null);
  };

  const handleExecuteCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      showToast('Please enter a name', 'error');
      return;
    }

    const slug = generateSlug(createName);
    setIsCreating(true);

    try {
      let createdId = '';

      if (createType === 'category') {
        const cat = await createCategoryAdmin({
          name: createName.trim(),
          slug,
          catalogProductId: selectedProductId || undefined,
          parentCategoryId: createParentId || null,
          parentId: createParentId || null,
          isActive: createStatus === 'published',
          displayOrder: 99,
        });
        createdId = cat._id;
      } else if (createType === 'product') {
        const prod = await createProductAdmin({
          name: createName.trim(),
          slug,
          categoryId: createParentId || null,
          parentId: createParentId || null,
          catalogProductId: selectedProductId || undefined,
          isActive: createStatus === 'published',
          displayOrder: 99,
        });
        createdId = prod._id;
      } else if (createType === 'model') {
        const model = await createModelAdmin({
          name: createName.trim(),
          modelNumber: createModelNumber.trim() || createName.trim(),
          slug,
          productId: createParentId || null,
          parentId: createParentId || null,
          catalogProductId: selectedProductId || undefined,
          isActive: createStatus === 'published',
          displayOrder: 99,
        });
        createdId = model._id;
      }

      showToast(`✓ ${createType.toUpperCase()} "${createName.trim()}" created successfully`, 'success');
      setCreateModalOpen(false);

      // Refresh tree and auto-select newly created entity
      if (selectedProductId) {
        const updatedTree = await getCatalogProductTreeAdmin(selectedProductId, false);
        setTree(updatedTree);

        if (createdId) {
          const newNode = findNodeById(updatedTree, createdId);
          if (newNode) {
            handleSelectNode(newNode);
            const ancestors = findAncestorIds(updatedTree, createdId);
            if (ancestors) {
              setExpandedIds((prev) => {
                const next = new Set(prev);
                ancestors.forEach((a) => next.add(a));
                return next;
              });
            }
          }
        }
      }
    } catch (err: unknown) {
      showToast((err as Error)?.message || 'Failed to create item', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // --------------------------------------------------------------------
  // Save Entity Changes
  // --------------------------------------------------------------------
  const handleSaveEntity = async () => {
    if (!editingForm) return;

    setIsSaving(true);
    try {
      const { _id, type } = editingForm;

      if (type === 'category') {
        await updateCategoryAdmin(_id, {
          name: editingForm.name,
          slug: editingForm.slug || generateSlug(editingForm.name),
          parentCategoryId: editingForm.parentId || null,
          parentId: editingForm.parentId || null,
          shortDescription: editingForm.shortDescription,
          description: editingForm.description,
          media: {
            image: editingForm.image,
            heroImage: editingForm.heroImage,
          },
          hero: editingForm.hero,
          galleryMedia: editingForm.galleryMedia,
          catalogPdf: editingForm.catalogPdf,
          isActive: editingForm.isActive,
          displayOrder: editingForm.displayOrder,
        });
      } else if (type === 'product') {
        await updateProductAdmin(_id, {
          name: editingForm.name,
          slug: editingForm.slug || generateSlug(editingForm.name),
          categoryId: editingForm.parentId || null,
          parentId: editingForm.parentId || null,
          shortDescription: editingForm.shortDescription,
          description: editingForm.description,
          media: {
            image: editingForm.image,
            heroImage: editingForm.heroImage,
          },
          hero: editingForm.hero,
          galleryMedia: editingForm.galleryMedia,
          catalogPdf: editingForm.catalogPdf,
          features: editingForm.features,
          infoPoints: editingForm.infoPoints,
          isActive: editingForm.isActive,
          displayOrder: editingForm.displayOrder,
        });
      } else if (type === 'model') {
        await updateModelAdmin(_id, {
          name: editingForm.name,
          modelNumber: editingForm.modelNumber || editingForm.name,
          slug: editingForm.slug || generateSlug(editingForm.name),
          productId: editingForm.parentId || null,
          parentId: editingForm.parentId || null,
          shortDescription: editingForm.shortDescription,
          description: editingForm.description,
          media: {
            image: editingForm.image,
          },
          hero: editingForm.hero,
          galleryMedia: editingForm.galleryMedia,
          catalogPdf: editingForm.catalogPdf,
          specificationsTable: editingForm.specificationsTable,
          specifications: editingForm.specifications,
          isActive: editingForm.isActive,
          displayOrder: editingForm.displayOrder,
        });
      }

      showToast(`✓ Changes saved for ${editingForm.name}`, 'success');
      setHasUnsavedChanges(false);

      if (selectedProductId) {
        const updatedTree = await getCatalogProductTreeAdmin(selectedProductId, false);
        setTree(updatedTree);
      }
    } catch (err: unknown) {
      showToast((err as Error)?.message || 'Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    handleSaveEntityRef.current = handleSaveEntity;
  }, [handleSaveEntity]);

  // --------------------------------------------------------------------
  // Move Entity Handler
  // --------------------------------------------------------------------
  const handleOpenMoveModal = (node: CatalogHierarchyNode) => {
    setMovingNode(node);
    setMoveTargetParentId(node.parentId || null);
    setMoveModalOpen(true);
    setContextMenuNodeId(null);
  };

  const handleExecuteMove = async () => {
    if (!movingNode) return;

    if (moveTargetParentId === movingNode._id) {
      showToast('An item cannot be its own parent', 'error');
      return;
    }

    const descendants = getDescendantIds(movingNode);
    if (moveTargetParentId && descendants.includes(moveTargetParentId)) {
      showToast('Cannot move an item under one of its own descendants', 'error');
      return;
    }

    setIsMoving(true);
    try {
      const rawType = movingNode.type;
      if (rawType === 'mainCategory' || rawType === 'subCategory') {
        await updateCategoryAdmin(movingNode._id, {
          parentCategoryId: moveTargetParentId || null,
          parentId: moveTargetParentId || null,
        });
      } else if (rawType === 'product') {
        await updateProductAdmin(movingNode._id, {
          categoryId: moveTargetParentId || null,
          parentId: moveTargetParentId || null,
        });
      } else if (rawType === 'model') {
        await updateModelAdmin(movingNode._id, {
          productId: moveTargetParentId || null,
          parentId: moveTargetParentId || null,
        });
      }

      showToast(`✓ Moved "${movingNode.name}" successfully`, 'success');
      setMoveModalOpen(false);
      setMovingNode(null);

      if (selectedProductId) {
        const updatedTree = await getCatalogProductTreeAdmin(selectedProductId, false);
        setTree(updatedTree);
      }
    } catch (err: unknown) {
      showToast((err as Error)?.message || 'Failed to move item', 'error');
    } finally {
      setIsMoving(false);
    }
  };

  // --------------------------------------------------------------------
  // Sibling Reordering (1-Click Move Up / Move Down)
  // --------------------------------------------------------------------
  const getSiblingsForNode = useCallback(
    (targetNodeId: string) => {
      const node = findNodeById(tree, targetNodeId);
      if (!node) return { siblings: [] as CatalogHierarchyNode[], parentId: null as string | null };
      if (!node.parentId || node.parentId === selectedProductId) {
        return { siblings: tree, parentId: null };
      }
      const parent = findNodeById(tree, node.parentId);
      return { siblings: parent?.children || [], parentId: node.parentId };
    },
    [tree, selectedProductId]
  );

  const handleReorder = async (node: CatalogHierarchyNode, direction: 'up' | 'down') => {
    setContextMenuNodeId(null);

    const { siblings } = getSiblingsForNode(node._id);
    const currentIndex = siblings.findIndex((s) => s._id === node._id);
    if (currentIndex === -1) return;

    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === siblings.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const reordered = [...siblings];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const orders = reordered.map((item, idx) => ({
      id: item._id,
      displayOrder: idx + 1,
    }));

    try {
      const rawType = node.type;
      if (rawType === 'mainCategory' || rawType === 'subCategory') {
        await reorderCategoriesAdmin(orders);
      } else if (rawType === 'product') {
        await reorderProductsAdmin(orders);
      } else if (rawType === 'model') {
        await reorderModelsAdmin(orders);
      }

      showToast(`✓ Order updated for "${node.name}"`, 'success');
      if (selectedProductId) {
        const updatedTree = await getCatalogProductTreeAdmin(selectedProductId, false);
        setTree(updatedTree);
      }
    } catch (err: unknown) {
      showToast((err as Error)?.message || 'Failed to update order', 'error');
    }
  };

  // --------------------------------------------------------------------
  // Toggle Publish / Unpublish
  // --------------------------------------------------------------------
  const handleTogglePublish = async (node: CatalogHierarchyNode) => {
    setContextMenuNodeId(null);
    const newStatus = !node.isActive;

    try {
      const rawType = node.type;
      if (rawType === 'mainCategory' || rawType === 'subCategory') {
        await updateCategoryAdmin(node._id, { isActive: newStatus });
      } else if (rawType === 'product') {
        await updateProductAdmin(node._id, { isActive: newStatus });
      } else if (rawType === 'model') {
        await updateModelAdmin(node._id, { isActive: newStatus });
      }

      showToast(newStatus ? `Published "${node.name}"` : `Unpublished "${node.name}"`, 'success');

      if (editingForm && editingForm._id === node._id) {
        setEditingForm((prev) => (prev ? { ...prev, isActive: newStatus } : null));
      }

      if (selectedProductId) {
        const updatedTree = await getCatalogProductTreeAdmin(selectedProductId, false);
        setTree(updatedTree);
      }
    } catch (err: unknown) {
      showToast((err as Error)?.message || 'Failed to update status', 'error');
    }
  };

  // --------------------------------------------------------------------
  // Duplicate Entity
  // --------------------------------------------------------------------
  const handleDuplicate = async (node: CatalogHierarchyNode) => {
    setContextMenuNodeId(null);
    try {
      const rawType = node.type;
      const copySuffix = `-copy-${Date.now().toString().slice(-4)}`;

      if (rawType === 'model') {
        await createModelAdmin({
          name: `${node.name} (Copy)`,
          modelNumber: `${node.modelNumber || node.name}-COPY`,
          slug: `${node.slug}${copySuffix}`,
          productId: node.parentId || null,
          parentId: node.parentId || null,
          shortDescription: node.shortDescription,
          description: node.description,
          media: { image: node.image },
          hero: node.hero,
          galleryMedia: node.galleryMedia,
          catalogPdf: node.catalogPdf,
          specificationsTable: node.specificationsTable,
          specifications: node.specifications,
          isActive: false,
        });
      } else if (rawType === 'product') {
        await createProductAdmin({
          name: `${node.name} (Copy)`,
          slug: `${node.slug}${copySuffix}`,
          categoryId: node.parentId || null,
          parentId: node.parentId || null,
          shortDescription: node.shortDescription,
          description: node.description,
          media: { image: node.image, heroImage: node.heroImage },
          hero: node.hero,
          galleryMedia: node.galleryMedia,
          catalogPdf: node.catalogPdf,
          features: node.features,
          infoPoints: node.infoPoints,
          isActive: false,
        });
      } else {
        await createCategoryAdmin({
          name: `${node.name} (Copy)`,
          slug: `${node.slug}${copySuffix}`,
          parentCategoryId: node.parentId || null,
          parentId: node.parentId || null,
          shortDescription: node.shortDescription,
          description: node.description,
          media: { image: node.image, heroImage: node.heroImage },
          hero: node.hero,
          galleryMedia: node.galleryMedia,
          catalogPdf: node.catalogPdf,
          isActive: false,
        });
      }

      showToast(`✓ Duplicated "${node.name}" as draft`, 'success');
      if (selectedProductId) {
        const updatedTree = await getCatalogProductTreeAdmin(selectedProductId, false);
        setTree(updatedTree);
      }
    } catch (err: unknown) {
      showToast((err as Error)?.message || 'Failed to duplicate entity', 'error');
    }
  };

  // --------------------------------------------------------------------
  // Delete Entity
  // --------------------------------------------------------------------
  const handleOpenDelete = (node: CatalogHierarchyNode) => {
    setDeletingNode(node);
    setDeleteModalOpen(true);
    setContextMenuNodeId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingNode) return;

    setIsDeleting(true);
    try {
      const rawType = deletingNode.type;
      if (rawType === 'mainCategory' || rawType === 'subCategory') {
        await deleteCategoryAdmin(deletingNode._id, true);
      } else if (rawType === 'product') {
        await deleteProductAdmin(deletingNode._id, true);
      } else if (rawType === 'model') {
        await deleteModelAdmin(deletingNode._id);
      }

      showToast(`✓ "${deletingNode.name}" deleted successfully`, 'success');
      setDeleteModalOpen(false);
      setDeletingNode(null);

      if (selectedNodeId === deletingNode._id) {
        setSelectedNodeId(null);
        setEditingForm(null);
      }

      if (selectedProductId) {
        const updatedTree = await getCatalogProductTreeAdmin(selectedProductId, false);
        setTree(updatedTree);
      }
    } catch (err: unknown) {
      showToast((err as Error)?.message || 'Failed to delete entity', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // --------------------------------------------------------------------
  // Drag & Drop Handlers
  // --------------------------------------------------------------------
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedNodeId(id);
  };

  const handleDragOverNode = (e: React.DragEvent, targetNode: CatalogHierarchyNode) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedNodeId || draggedNodeId === targetNode._id) return;

    const draggedNode = findNodeById(tree, draggedNodeId);
    if (!draggedNode) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const isSameParent = (draggedNode.parentId || null) === (targetNode.parentId || null);

    if (isSameParent) {
      if (offsetY < rect.height / 2) {
        setDragOverInfo({ targetId: targetNode._id, position: 'before' });
      } else {
        setDragOverInfo({ targetId: targetNode._id, position: 'after' });
      }
    } else {
      const descendants = getDescendantIds(draggedNode);
      if (!descendants.includes(targetNode._id)) {
        setDragOverInfo({ targetId: targetNode._id, position: 'inside' });
      }
    }
  };

  const handleDragLeaveNode = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (dragOverInfo?.targetId === targetId) {
      setDragOverInfo(null);
    }
  };

  const handleDropOnNode = async (e: React.DragEvent, targetNode: CatalogHierarchyNode) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = draggedNodeId || e.dataTransfer.getData('text/plain');
    const info = dragOverInfo;
    setDraggedNodeId(null);
    setDragOverInfo(null);

    if (!sourceId || sourceId === targetNode._id || !info) return;

    const sourceNode = findNodeById(tree, sourceId);
    if (!sourceNode) return;

    if (info.position === 'inside') {
      const descendants = getDescendantIds(sourceNode);
      if (descendants.includes(targetNode._id)) {
        showToast('Cannot move an item inside its own descendant', 'error');
        return;
      }

      try {
        const rawType = sourceNode.type;
        if (rawType === 'mainCategory' || rawType === 'subCategory') {
          await updateCategoryAdmin(sourceNode._id, {
            parentCategoryId: targetNode._id,
            parentId: targetNode._id,
          });
        } else if (rawType === 'product') {
          await updateProductAdmin(sourceNode._id, {
            categoryId: targetNode._id,
            parentId: targetNode._id,
          });
        } else if (rawType === 'model') {
          await updateModelAdmin(sourceNode._id, {
            productId: targetNode._id,
            parentId: targetNode._id,
          });
        }

        showToast(`✓ Moved "${sourceNode.name}" inside "${targetNode.name}"`, 'success');
        if (selectedProductId) {
          const updatedTree = await getCatalogProductTreeAdmin(selectedProductId, false);
          setTree(updatedTree);
        }
      } catch (err: unknown) {
        showToast((err as Error)?.message || 'Failed to move item', 'error');
      }
      return;
    }

    const { siblings } = getSiblingsForNode(targetNode._id);
    const sourceIndex = siblings.findIndex((s) => s._id === sourceId);
    let targetIndex = siblings.findIndex((s) => s._id === targetNode._id);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const reordered = [...siblings];
    const [moved] = reordered.splice(sourceIndex, 1);
    targetIndex = reordered.findIndex((s) => s._id === targetNode._id);
    if (info.position === 'after') {
      targetIndex += 1;
    }
    reordered.splice(targetIndex, 0, moved);

    const orders = reordered.map((item, idx) => ({
      id: item._id,
      displayOrder: idx + 1,
    }));

    try {
      const rawType = sourceNode.type;
      if (rawType === 'mainCategory' || rawType === 'subCategory') {
        await reorderCategoriesAdmin(orders);
      } else if (rawType === 'product') {
        await reorderProductsAdmin(orders);
      } else if (rawType === 'model') {
        await reorderModelsAdmin(orders);
      }

      showToast(`✓ Reordered "${sourceNode.name}"`, 'success');
      if (selectedProductId) {
        const updatedTree = await getCatalogProductTreeAdmin(selectedProductId, false);
        setTree(updatedTree);
      }
    } catch (err: unknown) {
      showToast((err as Error)?.message || 'Failed to reorder items', 'error');
    }
  };

  // --------------------------------------------------------------------
  // Preview Live Website Page
  // --------------------------------------------------------------------
  const handleOpenPreview = (nodeOrForm: CatalogHierarchyNode | FormEntityState | FlatCatalogItem) => {
    let path = '/products';
    const item = flatItems.find((i) => i._id === nodeOrForm._id);
    if (item) {
      path = item.path;
    } else if ('slug' in nodeOrForm && nodeOrForm.slug) {
      path = `/products/${nodeOrForm.slug}`;
    }
    setPreviewUrl(path);
    setPreviewModalOpen(true);
    setContextMenuNodeId(null);
  };

  // --------------------------------------------------------------------
  // Parent Dropdown Options Generator
  // --------------------------------------------------------------------
  const renderParentOptions = (nodes: CatalogHierarchyNode[], depth: number = 0, excludeIds: string[] = []): React.ReactNode[] => {
    const options: React.ReactNode[] = [];
    const prefix = '— '.repeat(depth);

    for (const node of nodes) {
      if (excludeIds.includes(node._id)) continue;

      const rawType = node.type;
      const typeBadge = rawType === 'model' ? '[MODEL]' : rawType === 'product' ? '[PRODUCT]' : '[CATEGORY]';

      options.push(
        <option key={node._id} value={node._id}>
          {prefix} {typeBadge} {node.name} {node.modelNumber ? `(${node.modelNumber})` : ''}
        </option>
      );

      if (node.children && node.children.length > 0) {
        options.push(...renderParentOptions(node.children, depth + 1, excludeIds));
      }
    }

    return options;
  };

  // --------------------------------------------------------------------
  // Render Recursive Tree Node
  // --------------------------------------------------------------------
  const renderTreeNode = (node: CatalogHierarchyNode, depth: number = 0) => {
    const rawType = node.type;
    const normalizedType: CatalogType =
      rawType === 'model' ? 'model' : rawType === 'product' ? 'product' : 'category';

    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node._id);
    const isSelected = selectedNodeId === node._id;

    const isDropBefore = dragOverInfo?.targetId === node._id && dragOverInfo.position === 'before';
    const isDropAfter = dragOverInfo?.targetId === node._id && dragOverInfo.position === 'after';
    const isDropInside = dragOverInfo?.targetId === node._id && dragOverInfo.position === 'inside';

    const { siblings } = getSiblingsForNode(node._id);
    const siblingIndex = siblings.findIndex((s) => s._id === node._id);
    const isFirstSibling = siblingIndex === 0;
    const isLastSibling = siblingIndex === siblings.length - 1;

    let matchesFilter = true;
    if (filterTab === 'categories' && normalizedType !== 'category') matchesFilter = false;
    if (filterTab === 'products' && normalizedType !== 'product') matchesFilter = false;
    if (filterTab === 'models' && normalizedType !== 'model') matchesFilter = false;
    if (filterTab === 'published' && !node.isActive) matchesFilter = false;
    if (filterTab === 'draft' && node.isActive) matchesFilter = false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const directMatch =
        node.name.toLowerCase().includes(q) ||
        node.slug.toLowerCase().includes(q) ||
        (node.modelNumber && node.modelNumber.toLowerCase().includes(q));

      const hasMatchingDescendant = flatItems.some(
        (i) =>
          (i.parentId === node._id || i.path.includes(node.slug)) &&
          (i.name.toLowerCase().includes(q) || (i.modelNumber && i.modelNumber.toLowerCase().includes(q)))
      );

      if (!directMatch && !hasMatchingDescendant) {
        matchesFilter = false;
      }
    }

    if (!matchesFilter && !searchQuery.trim()) {
      return null;
    }

    const badgeConfig = {
      category: {
        label: 'CATEGORY',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        icon: '📁',
      },
      product: {
        label: 'PRODUCT',
        badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        icon: '⚙️',
      },
      model: {
        label: 'MODEL',
        badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: '🏷️',
      },
    };

    const currentBadge = badgeConfig[normalizedType];

    return (
      <div key={node._id} className="select-none relative">
        {/* Drop Before Indicator */}
        {isDropBefore && (
          <div className="h-1 -my-0.5 mx-2 bg-sky-400 rounded-full shadow-[0_0_10px_#38bdf8] z-20 animate-pulse" />
        )}

        <div
          draggable
          onDragStart={(e) => handleDragStart(e, node._id)}
          onDragOver={(e) => handleDragOverNode(e, node)}
          onDragLeave={(e) => handleDragLeaveNode(e, node._id)}
          onDrop={(e) => handleDropOnNode(e, node)}
          onClick={() => handleSelectNode(node)}
          style={{ paddingLeft: `${Math.max(10, depth * 22)}px` }}
          className={`group relative flex items-center justify-between py-2.5 pr-3 my-1 rounded-2xl border transition-all duration-150 cursor-pointer ${
            isSelected
              ? 'bg-sky-500/20 border-sky-500/60 shadow-[0_0_20px_rgba(14,165,233,0.2)] text-white ring-1 ring-sky-400/40'
              : isDropInside
              ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400 text-amber-200'
              : isDropBefore || isDropAfter
              ? 'bg-sky-950/80 border-sky-400 text-sky-100'
              : 'bg-[#08182b]/70 border-slate-800/80 hover:bg-[#0c223c] hover:border-slate-700 text-slate-300'
          }`}
        >
          {/* Left: Drag Handle + Expand Chevron + Status Dot + Image/Icon + Name + Type Badge */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
            {/* Drag Handle */}
            <div
              title="Drag to reposition or reorder"
              className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-sky-400 p-0.5 rounded transition-colors text-xs font-mono select-none"
            >
              ⋮⋮
            </div>

            {/* Chevron */}
            <button
              type="button"
              onClick={(e) => toggleExpand(node._id, e)}
              className={`w-5 h-5 flex items-center justify-center rounded-lg hover:bg-slate-700/60 transition-transform ${
                !hasChildren ? 'opacity-0 pointer-events-none' : ''
              }`}
              aria-label={isExpanded ? 'Collapse branch' : 'Expand branch'}
            >
              <svg
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90 text-sky-400' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Status Dot */}
            <span
              title={node.isActive ? 'Published (Live)' : 'Draft (Unpublished)'}
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                node.isActive
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
              }`}
            />

            {/* Thumbnail or Fallback Icon */}
            {node.image ? (
              <div className="w-6 h-6 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-700">
                <CmsImage
                  src={node.image}
                  alt={node.name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-mono flex-shrink-0">{currentBadge.icon}</span>
            )}

            {/* Name + Model Number */}
            <div className="flex items-center gap-1.5 truncate min-w-0">
              <span className="font-bold text-xs truncate text-slate-100">{node.name}</span>
              {node.modelNumber && (
                <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 shrink-0">
                  {node.modelNumber}
                </span>
              )}
            </div>

            {/* Type Badge */}
            <span
              className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full border shrink-0 ${currentBadge.badgeClass}`}
            >
              {currentBadge.label}
            </span>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            {/* Quick 1-Click Move Up / Move Down */}
            <div className="hidden sm:flex items-center gap-0.5 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                title="Move Up"
                disabled={isFirstSibling}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReorder(node, 'up');
                }}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-sky-600 hover:text-white text-slate-400 disabled:opacity-20 transition-colors text-[9px]"
              >
                ▲
              </button>
              <button
                type="button"
                title="Move Down"
                disabled={isLastSibling}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReorder(node, 'down');
                }}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-sky-600 hover:text-white text-slate-400 disabled:opacity-20 transition-colors text-[9px]"
              >
                ▼
              </button>
            </div>

            {/* Quick Add Child [+] Popover */}
            <div className="relative" data-quick-add>
              <button
                type="button"
                title={`Add child entity under ${node.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickAddAnchorId(quickAddAnchorId === node._id ? null : node._id);
                  setContextMenuNodeId(null);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-sky-600 hover:text-white text-slate-300 transition-colors border border-slate-700 shadow-sm"
              >
                <span className="text-sm font-black leading-none">+</span>
              </button>

              {/* Quick Add Dropdown Menu Overlay */}
              {quickAddAnchorId === node._id && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 bg-[#0a1b2e] border border-slate-700 rounded-2xl shadow-2xl p-1.5 z-50 text-xs font-medium space-y-1 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1 text-[10px] text-sky-400 uppercase tracking-widest font-bold border-b border-slate-800 mb-1 truncate">
                    + Child under {node.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateModal('category', node._id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-amber-500/20 text-amber-300 transition-colors text-left"
                  >
                    <span>📁</span> + Sub Category
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateModal('product', node._id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-sky-500/20 text-sky-300 transition-colors text-left"
                  >
                    <span>⚙️</span> + Product System
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateModal('model', node._id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 text-emerald-300 transition-colors text-left"
                  >
                    <span>🏷️</span> + Machine Model
                  </button>
                </div>
              )}
            </div>

            {/* Context Action Menu [•••] */}
            <div className="relative" data-context-menu>
              <button
                type="button"
                title="Actions"
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenuNodeId(contextMenuNodeId === node._id ? null : node._id);
                  setQuickAddAnchorId(null);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 shadow-sm"
              >
                <span className="text-xs font-bold leading-none">•••</span>
              </button>

              {/* Context Actions Dropdown Overlay */}
              {contextMenuNodeId === node._id && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 bg-[#0a1b2e] border border-slate-700 rounded-2xl shadow-2xl p-1.5 z-50 text-xs font-medium space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setContextMenuNodeId(null);
                      handleSelectNode(node);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors text-left"
                  >
                    <span>✏️</span>
                    <span>Edit Specifications</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenMoveModal(node)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors text-left"
                  >
                    <span>⇄</span>
                    <span>Move / Reparent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPreview(node)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-sky-300 transition-colors text-left"
                  >
                    <span>↗</span>
                    <span>Live Page Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(node)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors text-left"
                  >
                    <span>⧉</span>
                    <span>Duplicate as Draft</span>
                  </button>

                  <div className="h-px bg-slate-800 my-1" />

                  <button
                    type="button"
                    onClick={() => handleTogglePublish(node)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition-colors text-left"
                  >
                    <span>{node.isActive ? '○' : '●'}</span>
                    <span>{node.isActive ? 'Unpublish (Draft)' : 'Publish Live'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenDelete(node)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-950/40 text-rose-400 transition-colors text-left"
                  >
                    <span>🗑</span>
                    <span>Delete Permanently</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drop After Indicator */}
        {isDropAfter && (
          <div className="h-1 -my-0.5 mx-2 bg-sky-400 rounded-full shadow-[0_0_10px_#38bdf8] z-20 animate-pulse" />
        )}

        {/* Recursive Sub-tree */}
        {hasChildren && isExpanded && (
          <div className="relative pl-3 border-l-2 border-slate-800/80 ml-4 my-1">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // --------------------------------------------------------------------
  // Main Render Structure
  // --------------------------------------------------------------------
  return (
    <div ref={containerRef} className="space-y-6 pb-20">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP SUMMARY METRIC CARDS                                    */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Categories Card */}
        <div className="p-4 rounded-2xl bg-[#08182b] border border-amber-500/30 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Categories</span>
            <span className="text-base">📁</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">{stats.categories}</div>
          <span className="text-[10px] text-slate-400 mt-1">Main Divisions</span>
        </div>

        {/* Products Card */}
        <div className="p-4 rounded-2xl bg-[#08182b] border border-sky-500/30 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Products</span>
            <span className="text-base">⚙️</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">{stats.products}</div>
          <span className="text-[10px] text-slate-400 mt-1">Machine Systems</span>
        </div>

        {/* Models Card */}
        <div className="p-4 rounded-2xl bg-[#08182b] border border-emerald-500/30 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Models</span>
            <span className="text-base">🏷️</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">{stats.models}</div>
          <span className="text-[10px] text-slate-400 mt-1">Technical Variants</span>
        </div>

        {/* Published Card */}
        <div className="p-4 rounded-2xl bg-[#08182b] border border-green-500/30 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Published</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">{stats.published}</div>
          <span className="text-[10px] text-slate-400 mt-1">Live on Website</span>
        </div>

        {/* Draft Card */}
        <div className="p-4 rounded-2xl bg-[#08182b] border border-yellow-500/30 shadow-lg flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Draft</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">{stats.draft}</div>
          <span className="text-[10px] text-slate-400 mt-1">Unpublished Items</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. PROMINENT ACTION BAR & QUICK CREATION BUTTONS             */}
      {/* ------------------------------------------------------------- */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#061220] via-[#091b30] to-[#061220] border border-slate-800/80 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-sky-500/20 text-sky-300 border border-sky-500/30">
              CMS WORKSPACE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Total Entities: {stats.total}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Equipment Catalog Hierarchy
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Single source of truth for Category ➔ Product ➔ Model structures and specifications.
          </p>
        </div>

        {/* 3 Prominent 1-Click Creation Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenCreateModal('category', null)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-950/40 transition-all active:scale-95"
          >
            <span>📁</span>
            <span>+ Add Category</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreateModal('product', null)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-950/40 transition-all active:scale-95"
          >
            <span>⚙️</span>
            <span>+ Add Product</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreateModal('model', null)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
          >
            <span>🏷️</span>
            <span>+ Add Model</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. FILTER TABS & SEARCH TOOLBAR                               */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#08182b] border border-slate-800">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {(
            [
              { id: 'all', label: 'ALL', count: stats.total },
              { id: 'categories', label: 'CATEGORIES', count: stats.categories },
              { id: 'products', label: 'PRODUCTS', count: stats.products },
              { id: 'models', label: 'MODELS', count: stats.models },
              { id: 'published', label: 'PUBLISHED', count: stats.published },
              { id: 'draft', label: 'DRAFT', count: stats.draft },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filterTab === tab.id
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterTab === tab.id ? 'bg-sky-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input + Tree Controls */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <input
              type="text"
              placeholder="Filter by name, slug or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
            />
            <svg
              className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            title="Expand all branches"
            onClick={handleExpandAll}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-mono font-bold"
          >
            [ + ]
          </button>
          <button
            type="button"
            title="Collapse all branches"
            onClick={handleCollapseAll}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-mono font-bold"
          >
            [ − ]
          </button>
          <button
            type="button"
            title="Reload catalog data"
            onClick={() => loadHierarchy()}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. MAIN WORKSPACE: TREE (LEFT) + COMPREHENSIVE EDITOR (RIGHT)  */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: VISUAL CATALOG TREE EXPLORER (5/12 cols) */}
        <div className="lg:col-span-5 bg-[#061220] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Visual Hierarchy Tree
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {filteredItems.length} node{filteredItems.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Hierarchy Tree Node List */}
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">Loading catalog structure...</span>
            </div>
          ) : tree.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-2xl">
                📁
              </div>
              <div>
                <p className="font-bold text-slate-200 text-sm">Catalog is Currently Empty</p>
                <p className="text-slate-400 mt-1">Create your first root category to start organizing machinery.</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenCreateModal('category', null)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
              >
                + Create Root Category
              </button>
            </div>
          ) : (
            <div className="space-y-0.5 max-h-[800px] overflow-y-auto pr-1 custom-scrollbar">
              {tree.map((rootNode) => renderTreeNode(rootNode, 0))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SELECTED ENTITY EDITOR (7/12 cols) */}
        <div className="lg:col-span-7 bg-[#061220] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden min-h-[650px] flex flex-col justify-between">
          {editingForm ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Editor Header Bar */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-[#040d18] via-[#08182b] to-[#040d18] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                          editingForm.type === 'category'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : editingForm.type === 'product'
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {editingForm.type}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        ID: {editingForm._id.slice(-6)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          editingForm.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {editingForm.isActive ? '● Published' : '○ Draft'}
                      </span>
                      {hasUnsavedChanges && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                          • Unsaved changes
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                      {editingForm.name}
                    </h2>
                  </div>

                  {/* Actions: View Live & Save */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(editingForm)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <span>↗</span>
                      <span>Preview Live</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveEntity}
                      disabled={isSaving}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-extrabold shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>✓</span>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Editor Tabs Navigation */}
                <div className="flex items-center gap-1.5 px-5 py-3 bg-[#040d18] border-b border-slate-800 overflow-x-auto custom-scrollbar">
                  {[
                    { id: 'basic', label: '1. Basic Info' },
                    { id: 'media', label: '2. Media' },
                    { id: 'description', label: '3. Overview & Highlights' },
                    ...(editingForm.type === 'model' || editingForm.type === 'product'
                      ? [{ id: 'specifications', label: '4. Technical Specs' }]
                      : []),
                    { id: 'documents', label: '5. Catalog PDF' },
                    { id: 'gallery', label: '6. Gallery' },
                    { id: 'hero', label: '7. ✨ Hero Banner' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveEditorTab(tab.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        activeEditorTab === tab.id
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content Body */}
                <div className="p-6 space-y-6">
                  {/* TAB 1: BASIC INFORMATION */}
                  {activeEditorTab === 'basic' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                            Entity Name *
                          </label>
                          <input
                            type="text"
                            value={editingForm.name}
                            onChange={(e) => updateFormField('name', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                            placeholder="e.g. Rotary High Speed Capper"
                          />
                        </div>

                        {/* URL Slug */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                              URL Slug *
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                updateFormField('slug', generateSlug(editingForm.name));
                              }}
                              className="text-[10px] text-sky-400 hover:underline font-mono"
                            >
                              Auto-Generate
                            </button>
                          </div>
                          <input
                            type="text"
                            value={editingForm.slug}
                            onChange={(e) => updateFormField('slug', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs font-mono text-sky-300 placeholder-slate-500 focus:outline-none transition-colors"
                            placeholder="rotary-high-speed-capper"
                          />
                        </div>
                      </div>

                      {/* Model Number (for Model type) */}
                      {editingForm.type === 'model' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                            Model Number / Code *
                          </label>
                          <input
                            type="text"
                            value={editingForm.modelNumber || ''}
                            onChange={(e) => updateFormField('modelNumber', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none transition-colors"
                            placeholder="e.g. AX-RC-8000"
                          />
                        </div>
                      )}

                      {/* Parent Entity Selector */}
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Parent Entity Hierarchy (Root vs Nested)
                        </label>
                        <select
                          value={editingForm.parentId || ''}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            updateFormField('parentId', val === '' ? null : val);
                          }}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-xl text-xs text-white focus:outline-none transition-colors"
                        >
                          <option value="">⭐ No Parent (Root Level Category / Standalone Product)</option>
                          {renderParentOptions(tree, 0, [editingForm._id])}
                        </select>
                        <p className="text-[11px] text-slate-400">
                          Select <span className="text-amber-400 font-semibold">&ldquo;No Parent&rdquo;</span> to position this item at the top root level, or select a Category/Product to nest it.
                        </p>
                      </div>

                      {/* Display Order & Status */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                            Sort / Display Order
                          </label>
                          <input
                            type="number"
                            value={editingForm.displayOrder}
                            onChange={(e) => updateFormField('displayOrder', parseInt(e.target.value) || 0)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                            Publish Status
                          </label>
                          <div className="flex items-center gap-3 pt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="entity_status"
                                checked={editingForm.isActive}
                                onChange={() => updateFormField('isActive', true)}
                                className="accent-sky-500"
                              />
                              <span className="text-xs font-bold text-emerald-400">● Published</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="entity_status"
                                checked={!editingForm.isActive}
                                onChange={() => updateFormField('isActive', false)}
                                className="accent-amber-500"
                              />
                              <span className="text-xs font-bold text-amber-400">○ Draft (Hidden)</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: MEDIA ASSETS */}
                  {activeEditorTab === 'media' && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Card Thumbnail Image (Catalog Grid &amp; Navigation)
                        </h3>
                        <AdminMediaPicker
                          label="Thumbnail Image"
                          value={editingForm.image || ''}
                          onChange={(url) => updateFormField('image', url)}
                        />
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Hero Header Background Image (Public Page Header)
                        </h3>
                        <AdminMediaPicker
                          label="Header Banner Image"
                          value={editingForm.heroImage || ''}
                          onChange={(url) => updateFormField('heroImage', url)}
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 3: OVERVIEW & DESCRIPTION */}
                  {activeEditorTab === 'description' && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                          Short Description (Summary Teaser)
                        </label>
                        <textarea
                          rows={2}
                          value={editingForm.shortDescription || ''}
                          onChange={(e) => updateFormField('shortDescription', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                          placeholder="Brief 1-2 sentence engineering overview for cards and listings..."
                        />
                      </div>

                      <div className="pt-2">
                        <AdminInfoAndFeaturesEditor
                          entityType={editingForm.type}
                          description={editingForm.description || ''}
                          infoPoints={editingForm.infoPoints || []}
                          features={editingForm.features || []}
                          onChangeDescription={(desc: string) => updateFormField('description', desc)}
                          onChangeInfoPoints={(points: string[]) => updateFormField('infoPoints', points)}
                          onChangeFeatures={(feats: string[]) => updateFormField('features', feats)}
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 4: TECHNICAL SPECIFICATIONS */}
                  {activeEditorTab === 'specifications' && (
                    <div className="space-y-4">
                      <AdminSpecificationBuilder
                        specTable={editingForm.specificationsTable}
                        legacySpecs={editingForm.specifications || []}
                        onChange={(specTable, specList) => {
                          setEditingForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  specificationsTable: specTable,
                                  specifications: specList,
                                }
                              : null
                          );
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  )}

                  {/* TAB 5: DOCUMENTS & PDF */}
                  {activeEditorTab === 'documents' && (
                    <div className="space-y-4">
                      <AdminPdfManager
                        entityType={editingForm.type}
                        entityName={editingForm.name}
                        catalogPdf={editingForm.catalogPdf}
                        onChange={(pdf) => updateFormField('catalogPdf', pdf)}
                      />
                    </div>
                  )}

                  {/* TAB 6: GALLERY */}
                  {activeEditorTab === 'gallery' && (
                    <div className="space-y-4">
                      <AdminGalleryManager
                        entityType={editingForm.type}
                        entityName={editingForm.name}
                        galleryMedia={editingForm.galleryMedia || []}
                        onChange={(galleryMedia) => updateFormField('galleryMedia', galleryMedia)}
                      />
                    </div>
                  )}

                  {/* TAB 7: CINEMATIC HERO SECTION */}
                  {activeEditorTab === 'hero' && (
                    <div className="space-y-4">
                      <AdminHeroEditor
                        entityType={editingForm.type}
                        entityName={editingForm.name}
                        hero={
                          editingForm.hero || {
                            enabled: true,
                            eyebrow: '',
                            title: editingForm.name,
                            description: editingForm.shortDescription || '',
                            ctaText: 'Request Quote',
                            ctaLink: '/contact',
                            mediaItems: [],
                          }
                        }
                        onChange={(hero) => updateFormField('hero', hero)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky Bottom Action Bar */}
              <div className="p-4 sm:p-5 bg-[#040d18] border-t border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono text-sky-400">Tip:</span>
                  <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[10px]">Ctrl+S</kbd> anytime to save.</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasUnsavedChanges || confirm('Discard unsaved changes?')) {
                        handleSelectNode(editingForm);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
                  >
                    Discard Changes
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveEntity}
                    disabled={isSaving}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-extrabold shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : '✓ Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full space-y-4 my-auto">
              <div className="w-16 h-16 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-3xl shadow-xl">
                👈
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-white">Select a Catalog Entity to Edit</h3>
                <p className="text-slate-400 text-xs">
                  Click any Category, Product, or Model in the hierarchy tree on the left to edit its parameters, specifications, hero banner, and media assets.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('category', null)}
                  className="px-4 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all"
                >
                  + Add Category
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('product', null)}
                  className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition-all"
                >
                  + Add Product
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('model', null)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all"
                >
                  + Add Model
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. CREATE ENTITY MODAL                                        */}
      {/* ------------------------------------------------------------- */}
      <AdminModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={`Add New ${createType.toUpperCase()}`}
        description="Create a new catalog item. Root-level items will appear at the top level without a parent."
        maxWidth="lg"
      >
        <form onSubmit={handleExecuteCreate} className="space-y-4">
          {/* Type Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            {(['category', 'product', 'model'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setCreateType(t)}
                className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  createType === t
                    ? t === 'category'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : t === 'product'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'category' ? '📁 Category' : t === 'product' ? '⚙️ Product' : '🏷️ Model'}
              </button>
            ))}
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              {createType.toUpperCase()} Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              placeholder={`Enter ${createType} title...`}
            />
          </div>

          {/* Model Number (for Model type) */}
          {createType === 'model' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Model Number / Code *
              </label>
              <input
                type="text"
                required
                value={createModelNumber}
                onChange={(e) => setCreateModelNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
                placeholder="e.g. AX-RC-8000"
              />
            </div>
          )}

          {/* Parent Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Parent Entity (Hierarchy Location)
            </label>
            <select
              value={createParentId || ''}
              onChange={(e) => {
                const val = e.target.value.trim();
                setCreateParentId(val === '' ? null : val);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="">⭐ No Parent (Root Level Item)</option>
              {renderParentOptions(tree, 0)}
            </select>
          </div>

          {/* Initial Status */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Initial Status
            </label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="create_status"
                  checked={createStatus === 'published'}
                  onChange={() => setCreateStatus('published')}
                  className="accent-sky-500"
                />
                <span className="text-xs font-bold text-emerald-400">● Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="create_status"
                  checked={createStatus === 'draft'}
                  onChange={() => setCreateStatus('draft')}
                  className="accent-amber-500"
                />
                <span className="text-xs font-bold text-amber-400">○ Draft</span>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-extrabold shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : `Create ${createType.toUpperCase()}`}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ------------------------------------------------------------- */}
      {/* 6. MOVE ENTITY MODAL                                          */}
      {/* ------------------------------------------------------------- */}
      <AdminModal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        title={`Move "${movingNode?.name}"`}
        description="Reparent this item under a different Category or Product, or make it Root-level."
        maxWidth="md"
      >
        {movingNode && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Select New Parent
              </label>
              <select
                value={moveTargetParentId || ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  setMoveTargetParentId(val === '' ? null : val);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="">⭐ No Parent (Move to Root Level)</option>
                {renderParentOptions(tree, 0, [movingNode._id, ...getDescendantIds(movingNode)])}
              </select>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setMoveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteMove}
                disabled={isMoving}
                className="px-6 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-extrabold shadow-lg shadow-sky-500/20 disabled:opacity-50"
              >
                {isMoving ? 'Moving...' : 'Move Entity'}
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* ------------------------------------------------------------- */}
      {/* 7. DELETE CONFIRMATION MODAL                                  */}
      {/* ------------------------------------------------------------- */}
      <AdminModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Permanent Deletion"
        maxWidth="md"
      >
        {deletingNode && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs space-y-2">
              <p className="font-extrabold text-sm text-rose-100">
                Are you sure you want to delete &ldquo;{deletingNode.name}&rdquo;?
              </p>
              <p>
                This action is <span className="font-bold underline">permanent</span>. All child entities nested under this item (subcategories, products, models) will also be deleted from MongoDB and purged from Redis cache.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-lg shadow-rose-950/40 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* ------------------------------------------------------------- */}
      {/* 8. LIVE PREVIEW MODAL                                         */}
      {/* ------------------------------------------------------------- */}
      <AdminModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Live Website Preview"
        description={`Previewing URL: ${previewUrl}`}
        maxWidth="5xl"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
            <span className="truncate">Path: {previewUrl}</span>
            <Link
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline shrink-0"
            >
              Open in new tab ↗
            </Link>
          </div>

          <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
            <iframe
              src={previewUrl}
              title="Live Preview"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
