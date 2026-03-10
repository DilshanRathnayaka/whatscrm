import React, { useMemo, useState } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon } from
'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  actions?: React.ReactNode;
  title?: string;
}
export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  actions,
  title
}: TableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
    Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data, search]);
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortDir]);
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };
  const getValue = (row: T, key: string): unknown => {
    return key.split('.').reduce((obj: unknown, k) => {
      if (obj && typeof obj === 'object')
      return (obj as Record<string, unknown>)[k];
      return undefined;
    }, row);
  };
  return (
    <div className="flex flex-col gap-0 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-[var(--card-shadow)]">
      {(title || searchable || actions) &&
      <div className="flex items-center justify-between gap-4 p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3 flex-1">
            {title &&
          <h3 className="text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap">
                {title}
              </h3>
          }
            {searchable &&
          <div className="max-w-xs w-full">
                <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<SearchIcon size={14} />} />

              </div>
          }
          </div>
          {actions &&
        <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
        }
        </div>
      }

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              {columns.map((col) =>
              <th
                key={String(col.key)}
                className={`px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap ${col.width || ''} ${col.sortable ? 'cursor-pointer hover:text-[var(--text-primary)] select-none' : ''}`}
                onClick={() => col.sortable && handleSort(String(col.key))}>

                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable &&
                  <span className="flex flex-col">
                        <ChevronUpIcon
                      size={10}
                      className={
                      sortKey === col.key && sortDir === 'asc' ?
                      'text-brand-green' :
                      'opacity-30'
                      } />

                        <ChevronDownIcon
                      size={10}
                      className={
                      sortKey === col.key && sortDir === 'desc' ?
                      'text-brand-green' :
                      'opacity-30'
                      } />

                      </span>
                  }
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ?
            Array.from({
              length: 5
            }).map((_, i) =>
            <tr key={i} className="border-b border-[var(--border-color)]">
                  {columns.map((col) =>
              <td key={String(col.key)} className="px-4 py-3">
                      <div className="h-4 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                    </td>
              )}
                </tr>
            ) :
            paginated.length === 0 ?
            <tr>
                <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-[var(--text-muted)]">

                  {emptyMessage}
                </td>
              </tr> :

            paginated.map((row, i) =>
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-[var(--border-color)] last:border-0 table-row-hover transition-colors duration-100 ${onRowClick ? 'cursor-pointer' : ''}`}>

                  {columns.map((col) =>
              <td
                key={String(col.key)}
                className="px-4 py-3 text-[var(--text-primary)]">

                      {col.render ?
                col.render(getValue(row, String(col.key)), row) :
                String(getValue(row, String(col.key)) ?? '')}
                    </td>
              )}
                </tr>
            )
            }
          </tbody>
        </table>
      </div>

      {totalPages > 1 &&
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-muted)]">
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
            variant="ghost"
            size="xs"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            icon={<ChevronLeftIcon size={14} />} />

            {Array.from({
            length: Math.min(totalPages, 5)
          }).map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 text-xs rounded-md font-medium transition-colors ${page === p ? 'bg-brand-green text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}>

                  {p}
                </button>);

          })}
            <Button
            variant="ghost"
            size="xs"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            icon={<ChevronRightIcon size={14} />} />

          </div>
        </div>
      }
    </div>);

}