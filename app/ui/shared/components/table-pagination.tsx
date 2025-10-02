'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: TablePaginationProps) {
  // No mostrar paginación si solo hay una página o ninguna
  if (totalPages <= 1) return null;

  // Generar array de números de página a mostrar
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    // Siempre mostrar la primera página
    pages.push(1);
    
    // Calcular el rango de páginas a mostrar alrededor de la página actual
    const showPages = 2; // Cuántas páginas mostrar antes y después de la actual
    let startPage = Math.max(2, currentPage - showPages);
    let endPage = Math.min(totalPages - 1, currentPage + showPages);
    
    // Agregar elipsis inicial si es necesario
    if (startPage > 2) {
      pages.push('ellipsis');
    }
    
    // Agregar páginas del rango
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Agregar elipsis final si es necesario
    if (endPage < totalPages - 1) {
      pages.push('ellipsis');
    }
    
    // Siempre mostrar la última página (si hay más de una)
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex justify-center py-4">
      <Pagination>
        <PaginationContent>
          {/* Botón Anterior */}
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (hasPrevious) onPageChange(currentPage - 1);
              }}
              className={!hasPrevious ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              aria-disabled={!hasPrevious}
            />
          </PaginationItem>

          {/* Números de página */}
          {pageNumbers.map((page, index) => (
            <PaginationItem key={`page-${page}-${index}`}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Botón Siguiente */}
          <PaginationItem>
            <PaginationNext 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (hasNext) onPageChange(currentPage + 1);
              }}
              className={!hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              aria-disabled={!hasNext}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

