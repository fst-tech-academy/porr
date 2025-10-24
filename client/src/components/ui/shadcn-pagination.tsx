import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

interface ShadcnPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  onRefresh?: (page: number) => void;
  theme?: 'admin' | 'landlord';
}

const ShadcnPagination: React.FC<ShadcnPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onRefresh,
  theme = 'admin'
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Theme-based styling
  const getThemeClasses = () => {
    if (theme === 'landlord') {
      return {
        active: 'bg-green-600 text-white border-green-600',
        inactive: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-700 dark:hover:bg-green-700 hover:text-black dark:hover:text-white',
        navigation: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-700 dark:hover:bg-green-700 hover:text-black dark:hover:text-white'
      };
    } else {
      // Admin theme (dark blue)
      return {
        active: 'bg-blue-900 dark:bg-blue-800 text-white border-blue-900 dark:border-blue-800',
        inactive: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-800 dark:hover:bg-blue-700 hover:text-white',
        navigation: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-800 dark:hover:bg-blue-700 hover:text-white'
      };
    }
  };

  const themeClasses = getThemeClasses();

  // Generate page numbers following shadcn/ui pattern
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Determine if ellipsis is needed at the start
      if (currentPage > Math.floor(maxVisiblePages / 2) + 1) {
        pages.push('ellipsis-start');
      }

      // Show pages around the current page
      let start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2) + 1);
      let end = Math.min(totalPages - 1, currentPage + Math.floor(maxVisiblePages / 2) - 1);

      if (currentPage <= Math.floor(maxVisiblePages / 2) + 1) {
        end = maxVisiblePages - 1;
      } else if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
        start = totalPages - maxVisiblePages + 2;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Determine if ellipsis is needed at the end
      if (currentPage < totalPages - Math.floor(maxVisiblePages / 2)) {
        pages.push('ellipsis-end');
      }

      // Always show last page if not already included
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="space-y-4">
      {/* Info bar - Always show */}
      <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 rounded-md">
        <span>
          {totalItems === 0 ? 'No items to display' : `Showing ${startItem} to ${endItem} of ${totalItems} items`}
        </span>
        <span>
          Page {currentPage} of {totalPages}
        </span>
      </div>
      
      {/* Pagination controls - Always show following shadcn/ui pattern */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) {
                  const newPage = currentPage - 1;
                  onPageChange(newPage);
                  if (onRefresh) {
                    onRefresh(newPage);
                  }
                }
              }}
              className={`${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
                ${themeClasses.navigation}`}
            />
          </PaginationItem>
          
          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                <PaginationEllipsis 
                  className="text-gray-500 dark:text-gray-400"
                />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    const newPage = page as number;
                    onPageChange(newPage);
                    if (onRefresh) {
                      onRefresh(newPage);
                    }
                  }}
                  isActive={currentPage === page}
                  className={`cursor-pointer
                    ${currentPage === page 
                      ? themeClasses.active
                      : themeClasses.inactive
                    }`}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) {
                  const newPage = currentPage + 1;
                  onPageChange(newPage);
                  if (onRefresh) {
                    onRefresh(newPage);
                  }
                }
              }}
              className={`${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
                ${themeClasses.navigation}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ShadcnPagination;