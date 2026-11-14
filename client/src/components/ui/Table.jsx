import React from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from './Spinner.jsx';
import { EmptyState } from './EmptyState.jsx';

export function Table({
  columns = [],
  data = [],
  loading = false,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterComponent = null,
  pagination = null,
  onPageChange = null,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching the specified criteria.',
  onRowClick = null,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search & Filters Bar */}
      {(onSearchChange || filterComponent) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {onSearchChange && (
            <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
              <Search
                size={18}
                color="#6b7280"
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
                aria-label="Search records"
              />
            </div>
          )}

          {filterComponent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {filterComponent}
            </div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="table-container glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <Spinner text="Loading records..." />
        ) : data.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <table>
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={col.accessor || index} style={{ width: col.width || 'auto' }}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={row._id || row.id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col, colIndex) => {
                    const value =
                      typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : col.accessor
                        ? row[col.accessor]
                        : null;

                    return (
                      <td key={colIndex}>
                        {col.render ? col.render(row, value) : value !== undefined && value !== null ? String(value) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.25rem',
            fontSize: '0.9rem',
            color: '#4b5563',
          }}
        >
          <div>
            Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>{' '}
            ({pagination.total} total records)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Next page"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

