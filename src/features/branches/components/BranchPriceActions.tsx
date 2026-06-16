'use client';

import { CreditCard, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui';

export interface BranchPriceActionsProps {
  onConfigure: () => void;
  onListing: () => void;
  variant: 'grid' | 'list';
}

/** Price configure / listing actions for a branch (grid icon buttons or list pills). */
export function BranchPriceActions({ onConfigure, onListing, variant }: BranchPriceActionsProps) {
  if (variant === 'grid') {
    return (
      <>
        <Button
          variant="outline"
          className="aspect-square h-10 w-10 rounded-2xl border-green-200 p-3 text-green-700 hover:border-green-300 hover:bg-green-50"
          onClick={onConfigure}
          title="Configure prices"
        >
          <CreditCard size={18} />
        </Button>
        <Button
          variant="outline"
          className="aspect-square h-10 w-10 rounded-2xl border-blue-200 p-3 text-blue-700 hover:border-blue-300 hover:bg-blue-50"
          onClick={onListing}
          title="Price listing"
        >
          <ListOrdered size={18} />
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl text-[10px] font-black uppercase tracking-widest text-green-700 border-green-200 hover:bg-green-50"
        onClick={onConfigure}
      >
        <CreditCard size={14} className="mr-1" />
        Price
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-700 border-blue-200 hover:bg-blue-50"
        onClick={onListing}
      >
        <ListOrdered size={14} className="mr-1" />
        Listing
      </Button>
    </>
  );
}

export default BranchPriceActions;
