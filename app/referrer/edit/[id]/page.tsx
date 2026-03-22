'use client';

import React from 'react';

interface EditReferrerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReferrerPage({ params }: EditReferrerPageProps) {
  const { id } = await params;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Referrer</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>Edit referrer information for ID: {id}</p>
      </div>
    </div>
  );
}
