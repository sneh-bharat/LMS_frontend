import type { Patient } from '@/app/Apis/Patients/Patient_Service_API';
import {
  formatPatientFullName,
  mapPatientGender,
  patientAgeYears,
} from '@/app/Apis/Patients/patientDisplayUtils';
import type { TestOrder } from './testOrderApi';
import type { Invoice } from '@/features/diagnosis/invoice-list/types';

function resolveTestLabel(
  testId: number,
  testNameFromItem?: string | null,
  testNameFromCatalog?: string | null
): string {
  const fromItem = testNameFromItem?.trim();
  if (fromItem) return fromItem;
  const fromCatalog = testNameFromCatalog?.trim();
  if (fromCatalog) return fromCatalog;
  return `Test #${testId}`;
}

export function mapTestOrderToInvoice(
  order: TestOrder,
  patient?: Patient | null,
  testsById?: Map<number, { testName: string }>
): Invoice {
  const tests =
    order.orderItems?.length > 0
      ? order.orderItems.map((item) =>
          resolveTestLabel(item.testId, item.testName, testsById?.get(item.testId)?.testName)
        )
      : ['No tests'];

  const refDoctor =
    order.referringDoctorName?.trim() ||
    (order.referringDoctorId ? `Doctor #${order.referringDoctorId}` : '—');

  const pending =
    order.pendingAmount ?? Math.max(0, (order.actualPayable ?? 0) - (order.paidAmount ?? 0));

  const patientName = patient
    ? formatPatientFullName(patient)
    : order.patientName?.trim() || '—';

  const primaryAddress =
    patient?.addresses?.find((a) => a.isPrimary) ?? patient?.addresses?.[0];

  return {
    id: order.id,
    invoiceBarcode: order.orderNumber,
    patientName,
    patientId: order.patientId,
    patientCode: patient?.patientCode,
    age: patient ? patientAgeYears(patient.dateOfBirth) : 0,
    gender: patient ? mapPatientGender(patient.gender) : 'Other',
    mobile: patient?.mobilePrimary?.trim() || '—',
    address:
      primaryAddress
        ? [primaryAddress.addressLine1, primaryAddress.city, primaryAddress.state]
            .filter(Boolean)
            .join(', ')
        : order.clinicalNotes?.trim() || '—',
    tests,
    collectionCentre: order.collectorName || order.referrerName || '—',
    refDoctor,
    totalAmount: order.totalAmount ?? 0,
    paidAmount: order.paidAmount ?? 0,
    dueAmount: pending,
    balanceAmount: pending,
    receptionDate: order.createdAt || order.orderDate,
    paymentLink: order.paymentStatus === 'UNPAID' ? 'Collect Payment' : undefined,
    orderStatus: order.orderStatus,
    priority: order.priority,
    paymentStatus: order.paymentStatus,
    srfId: order.srfId,
    branchId: order.branchId,
  };
}
