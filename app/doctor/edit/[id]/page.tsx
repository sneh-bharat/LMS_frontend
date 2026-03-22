'use client';

import React from 'react';

interface EditDoctorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDoctorPage({ params }: EditDoctorPageProps) {
  const { id } = await params;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Doctor</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>Edit doctor information for ID: {id}</p>
      </div>
    </div>
  );
}
