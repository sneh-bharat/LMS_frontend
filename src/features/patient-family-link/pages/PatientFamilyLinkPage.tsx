'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FamilyLinksListing from '../components/FamilyLinksListing';
import FamilyLinkForm from '../components/FamilyLinkForm';

function PatientFamilyLinkFallback() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="h-10 w-64 rounded-lg bg-slate-100 animate-pulse" />
      <div className="h-48 rounded-xl border border-slate-200 bg-white animate-pulse" />
    </div>
  );
}

/**
 * `add=1` shows the create form; otherwise shows the listing (optionally scoped with `patientId`).
 */
function PatientFamilyLinkContent() {
  const searchParams = useSearchParams();
  const showForm = searchParams.get('add') === '1' || searchParams.get('add') === 'true';
  if (showForm) {
    return <FamilyLinkForm />;
  }
  return <FamilyLinksListing />;
}

export default function PatientFamilyLinkPage() {
  return (
    <Suspense fallback={<PatientFamilyLinkFallback />}>
      <PatientFamilyLinkContent />
    </Suspense>
  );
}
