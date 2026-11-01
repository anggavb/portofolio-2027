export type WorkFilterId =
  | 'all'
  | 'enterprise'
  | 'golang'
  | 'laravel'
  | 'react-next'
  | 'vue-svelte'
  | 'postgres-redis';

export interface FilterableWork {
  id: string;
  filterTags: WorkFilterId[];
}

export function filterWorkItems<T extends FilterableWork>(
  items: readonly T[],
  activeFilter: string,
): T[] {
  if (!activeFilter || activeFilter === 'all') {
    return [...items];
  }
  return items.filter((item) =>
    item.filterTags.includes(activeFilter as WorkFilterId),
  );
}
