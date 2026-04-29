import type { ListLinksQuery } from '@/schemas/link';
import type { ListProductsQuery } from '@/schemas/product';
import type { ListTagsQuery } from '@/schemas/tag';

export const linksKeys = {
  all: ['links'] as const,
  lists: () => [...linksKeys.all, 'list'] as const,
  list: (filters: Partial<ListLinksQuery> = {}) => [...linksKeys.lists(), filters] as const,
  details: () => [...linksKeys.all, 'detail'] as const,
  detail: (id: string) => [...linksKeys.details(), id] as const,
  platforms: () => [...linksKeys.all, 'platforms'] as const,
};

export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filters: Partial<ListProductsQuery> = {}) => [...productsKeys.lists(), filters] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
};

export const tagsKeys = {
  all: ['tags'] as const,
  lists: () => [...tagsKeys.all, 'list'] as const,
  list: (filters: Partial<ListTagsQuery> = {}) => [...tagsKeys.lists(), filters] as const,
  details: () => [...tagsKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagsKeys.details(), id] as const,
};
