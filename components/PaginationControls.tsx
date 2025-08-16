// components/PaginationControls.tsx
"use client";

import { FC } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalCount: number;
  itemsPerPage: number;
}

export const PaginationControls: FC<PaginationControlsProps> = ({
  hasNextPage,
  hasPrevPage,
  totalCount,
  itemsPerPage,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get('page') ?? '1';
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleNavigation = (direction: 'prev' | 'next') => {
    const newParams = new URLSearchParams(searchParams.toString());
    const newPage = direction === 'prev' ? Number(page) - 1 : Number(page) + 1;
    newParams.set('page', String(newPage));
    router.push(`/?${newParams.toString()}`);
  };

  return (
    <div className='flex items-center justify-between mt-4'>
      <div className="text-sm text-muted-foreground">
        Halaman {page} dari {totalPages}
      </div>
      <div className='flex items-center gap-2'>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevPage}
          onClick={() => handleNavigation('prev')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => handleNavigation('next')}>
          Selanjutnya
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
