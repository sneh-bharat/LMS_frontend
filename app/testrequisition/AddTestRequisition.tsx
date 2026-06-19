'use client';

import { toast } from 'sonner';
import type { BookingInvestigation } from '@/app/Apis/booking/mapBookingToTestOrder';
import { mapInvestigationsToRequisitionItems } from '@/app/Apis/testRequest/TestRequestApi';
import { useAddTestRequisitionItems } from '@/app/Apis/testRequest/useTestRequisitions';
import AddInvestigationsModal from '@/app/diagnosis/diagnostic-booking/AddInvestigationsModal';

export interface AddTestRequisitionProps {
  isOpen: boolean;
  onClose: () => void;
  requisitionId: number | null;
  branchId: number | null;
  onSuccess?: () => void;
}

export default function AddTestRequisition({
  isOpen,
  onClose,
  requisitionId,
  branchId,
  onSuccess,
}: AddTestRequisitionProps) {
  const addItemsMutation = useAddTestRequisitionItems();

  const handleAdd = (investigations: BookingInvestigation[]) => {
    if (requisitionId == null || requisitionId <= 0) {
      toast.error('Requisition id is missing.');
      return;
    }

    const items = mapInvestigationsToRequisitionItems(investigations);

    addItemsMutation.mutate(
      { requisitionId, items },
      {
        onSuccess: (res) => {
          toast.success(
            res.message?.trim() ||
              `${items.length} test${items.length > 1 ? 's' : ''} added to requisition.`,
          );
          onClose();
          onSuccess?.();
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to add test(s).');
        },
      },
    );
  };

  const handleClose = () => {
    if (addItemsMutation.isPending) return;
    onClose();
  };

  return (
    <AddInvestigationsModal
      isOpen={isOpen}
      onClose={handleClose}
      onAdd={handleAdd}
      branchId={branchId ?? 0}
    />
  );
}
