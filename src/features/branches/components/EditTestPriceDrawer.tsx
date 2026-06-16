'use client';

import { useState, useEffect } from 'react';
import { Loader, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label, RightDrawer } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  branchApi,
  type BranchTestPriceItem,
  type UpdateTestPriceInput,
} from '../services/branch.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: BranchTestPriceItem | null;
  branchId: number;
  onSaved: () => void;
}

export default function EditTestPriceDrawer({
  isOpen,
  onClose,
  item,
  branchId,
  onSaved,
}: Props) {
  const [formData, setFormData] = useState({
    price: 0,
    cghsPrice: 0,
    b2bPrice: 0,
    ipPrice: 0,
    isActive: true,
    description: '',
    termsAndConditions: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        price: item.price,
        cghsPrice: item.cghsPrice,
        b2bPrice: item.b2bPrice,
        ipPrice: item.ipPrice,
        isActive: item.isActive,
        description: '',
        termsAndConditions: '',
      });
    }
  }, [isOpen, item]);

  const parseAmount = (value: string): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const payload: UpdateTestPriceInput = {
      testId: item.testId,
      branchId,
      price: formData.price,
      cghsPrice: formData.cghsPrice,
      b2bPrice: formData.b2bPrice,
      isActive: formData.isActive,
      description: formData.description.trim() || undefined,
      termsAndConditions: formData.termsAndConditions.trim() || undefined,
    };

    if (formData.ipPrice > 0) {
      payload.ipPrice = formData.ipPrice;
    }

    setIsSubmitting(true);
    try {
      await branchApi.updateTestPrice(item.id, payload);
      toast.success('Test price updated successfully!');
      onSaved();
      onClose();
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to update test price'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex gap-3 justify-end w-full">
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md flex items-center gap-2"
      >
        {isSubmitting && <Loader size={14} className="animate-spin" />}
        <Save size={14} />
        Update Price
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Edit <span className="text-emerald-200">Test Price</span>
        </>
      }
      description={item ? `${item.testCode} · ${item.testName}` : ''}
      footer={footer}
      maxWidth="lg"
    >
      {item && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-[1px] bg-slate-200" />
              Price details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">
                  MRP (Price) *
                </Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData((p) => ({ ...p, price: parseAmount(e.target.value) }))}
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">
                  CGHS Price *
                </Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={formData.cghsPrice}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, cghsPrice: parseAmount(e.target.value) }))
                  }
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">
                  B2B Price *
                </Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={formData.b2bPrice}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, b2bPrice: parseAmount(e.target.value) }))
                  }
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">
                  IP Price *
                </Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={formData.ipPrice}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, ipPrice: parseAmount(e.target.value) }))
                  }
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">
                Status
              </Label>
              <Select
                value={formData.isActive ? 'ACTIVE' : 'INACTIVE'}
                onValueChange={(value) =>
                  setFormData((p) => ({ ...p, isActive: value === 'ACTIVE' }))
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">
                Description
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Updated pricing for CBC test"
                rows={2}
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">
                Terms & Conditions
              </Label>
              <Textarea
                value={formData.termsAndConditions}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, termsAndConditions: e.target.value }))
                }
                placeholder="Prices valid until further notice"
                rows={2}
              />
            </div>
          </section>
        </form>
      )}
    </RightDrawer>
  );
}
