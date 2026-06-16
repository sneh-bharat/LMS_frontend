'use client';

import { useState } from 'react';
import Button from '@/components/ui/button';
import { RightDrawer } from '@/components/ui/right-drawer';
import { STATUS_ICONS } from '../constants/sample-status';

export function BulkCollectionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [barcodes, setBarcodes] = useState('');
  const [status, setStatus] = useState('Collected');

  if (!isOpen) return null;

  const footer = (
    <div className="flex w-full gap-3">
      <Button variant="outline" onClick={onClose} className="flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider">
        Cancel
      </Button>
      <Button variant="gradient" className="flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm">
        Update Batch
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Bulk <span className="text-emerald-200">Collection</span>
        </>
      }
      description="Process multiple specimens"
      footer={footer}
      maxWidth="sm"
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="label-refined">Scan or Paste Barcodes</label>
          <textarea
            value={barcodes}
            onChange={(e) => setBarcodes(e.target.value)}
            placeholder="Enter barcodes, one per line..."
            rows={8}
            className="input-refined w-full resize-none p-4 font-bold text-slate-700"
          />
        </div>
        <div className="space-y-1.5">
          <label className="label-refined">Target Status</label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-refined w-full appearance-none px-10 font-bold"
            >
              {Object.keys(STATUS_ICONS).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{STATUS_ICONS[status].icon}</div>
          </div>
        </div>
      </div>
    </RightDrawer>
  );
}

export default BulkCollectionModal;
