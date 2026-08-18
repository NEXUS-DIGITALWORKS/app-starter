import type { Category, CategoryTreeNode } from '../types';

export function getChildren(categories: Category[], parentId: string | null): Category[] {
  return categories
    .filter((c) => c.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code));
}

export function findCategory(categories: Category[], id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function findCategoryByCode(categories: Category[], code: string): Category | undefined {
  return categories.find((c) => c.code === code);
}

// ルート→自分自身の順で祖先チェーンを返す。
export function getAncestors(categories: Category[], id: string): Category[] {
  const chain: Category[] = [];
  let current = findCategory(categories, id);
  while (current) {
    chain.unshift(current);
    current = current.parentId ? findCategory(categories, current.parentId) : undefined;
  }
  return chain;
}

// 指定カテゴリ配下の子孫カテゴリID一覧（自分自身は含まない）。
export function getDescendantIds(categories: Category[], id: string): string[] {
  const result: string[] = [];
  const stack = [...getChildren(categories, id)];
  while (stack.length > 0) {
    const node = stack.pop()!;
    result.push(node.id);
    stack.push(...getChildren(categories, node.id));
  }
  return result;
}

export function buildCategoryTree(categories: Category[], productCounts: Record<string, number>): CategoryTreeNode[] {
  const build = (parentId: string | null): CategoryTreeNode[] =>
    getChildren(categories, parentId).map((category) => ({
      ...category,
      productCount: productCounts[category.id] ?? 0,
      children: build(category.id),
    }));

  return build(null);
}

export function flattenTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  const result: CategoryTreeNode[] = [];
  const walk = (list: CategoryTreeNode[]) => {
    for (const node of list) {
      result.push(node);
      walk(node.children);
    }
  };
  walk(nodes);
  return result;
}
