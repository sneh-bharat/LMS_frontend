'use client';

import React from 'react';

interface EditPricePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPricePage({ params }: EditPricePageProps) {
  const { id } = await params;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Price Item</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>Edit price item for ID: {id}</p>
      </div>
    </div>
  );
}
