'use client';

export interface PriceListEditPageProps {
  id: string;
}

export function PriceListEditPage({ id }: PriceListEditPageProps) {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Edit Price Item</h1>
      <div className="rounded-lg bg-white p-6 shadow">
        <p>Edit price item for ID: {id}</p>
      </div>
    </div>
  );
}

export default PriceListEditPage;
