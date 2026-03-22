'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';

interface AddFranchiseModalProps {
    onClose: () => void;
    onSave: (form: Record<string, string>) => void;
    initialData?: Record<string, string>;
}

export default function AddFranchiseModal({ onClose, onSave, initialData }: AddFranchiseModalProps) {
    const [form, setForm] = useState({
        name: initialData?.name || '',
        mobile: initialData?.mobile || '',
        email: initialData?.email || '',
        orgType: initialData?.orgType || 'B2B',
        opType: initialData?.opType || 'Postpaid - Credit',
        status: initialData?.status || 'Active',
        amount: initialData?.amount || '',
    });

    const handleSubmit = () => {
        onSave(form);
        onClose();
    };

    return (
        <Modal onClose={onClose} title={initialData ? 'Edit Franchise' : 'Add Franchise'}>
            <div className="space-y-4">
                <FormGroup label="Franchise Name">
                    <Input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Enter franchise name"
                    />
                </FormGroup>

                <FormGroup label="Mobile Number">
                    <Input
                        type="tel"
                        value={form.mobile}
                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                        placeholder="Enter mobile number"
                    />
                </FormGroup>

                <FormGroup label="Email">
                    <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="Enter email address"
                    />
                </FormGroup>

                <FormGroup label="Organization Type">
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.orgType}
                        onChange={(e) => setForm({ ...form, orgType: e.target.value })}
                    >
                        <option value="B2B">B2B</option>
                        <option value="B2C">B2C</option>
                    </select>
                </FormGroup>

                <FormGroup label="Operation Type">
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.opType}
                        onChange={(e) => setForm({ ...form, opType: e.target.value })}
                    >
                        <option value="Postpaid - Credit">Postpaid - Credit</option>
                        <option value="Prepaid">Prepaid</option>
                    </select>
                </FormGroup>

                <FormGroup label="Status">
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </FormGroup>

                <FormGroup label="Amount">
                    <Input
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        placeholder="Enter amount"
                    />
                </FormGroup>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>{initialData ? 'Update' : 'Save'}</Button>
                </div>
            </div>
        </Modal>
    );
}
