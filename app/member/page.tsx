'use client';

import { useState } from 'react';

import Card from '@/app/components/ui/Card';
import Input from '@/app/components/ui/Input';
import Table from '@/app/components/ui/Table';

export default function MembersPage() {
  const [members] = useState([]);
  const [cardNumber, setCardNumber] = useState('');
  const [registeredMobile, setRegisteredMobile] = useState('');

  const columns = [
    { key: 'id', label: '#' },
    { key: 'cardNumber', label: 'Card Number' },
    { key: 'type', label: 'Type' },
    { key: 'wallet', label: 'Wallet' },
    { key: 'details', label: 'Details' },
    { key: 'action', label: 'Action' },
  ];

  return (
    <div className="p-4">

      <Card>

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">

          {/* Left */}
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className="text-green-600">👥</span>
            Member List
          </div>

          {/* Right Inputs */}
          <div className="flex items-center gap-2 w-[350px]">
            <Input
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e: any) => setCardNumber(e.target.value)}
            />
            <Input
              placeholder="Registered Mobile"
              value={registeredMobile}
              onChange={(e: any) => setRegisteredMobile(e.target.value)}
            />
          </div>

        </div>

        {/* Table */}
        <Table columns={columns} data={members} />

      </Card>

    </div>
  );
}