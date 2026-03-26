'use client';

import { useState } from 'react';
import { Button, Input, Label, RightDrawer } from '@/components/ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AddFranchiseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (form: Record<string, string>) => void;
    initialData?: Record<string, string>;
}

export default function AddFranchiseModal({ isOpen, onClose, onSave, initialData }: AddFranchiseModalProps) {
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
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Franchise' : 'Add New Franchise'}
            description="Enter the details of the new diagnostic center or partner lab."
            footer={
                <div className="flex w-full gap-3">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="gradient" className="flex-1" onClick={handleSubmit}>
                        {initialData ? 'Update Entity' : 'Save Entity'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Franchise Name</Label>
                    <Input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Enter franchise name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                        id="mobile"
                        type="tel"
                        value={form.mobile}
                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                        placeholder="Enter mobile number"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="Enter email address"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="org-type">Organization Type</Label>
                        <Select
                            value={form.orgType}
                            onValueChange={(value) => setForm({ ...form, orgType: value ?? '' })}
                        >
                            <SelectTrigger id="org-type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="B2B">B2B</SelectItem>
                                <SelectItem value="B2C">B2C</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={form.status}
                            onValueChange={(value) => setForm({ ...form, status: value ?? '' })}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="op-type">Operation Type</Label>
                    <Select
                        value={form.opType}
                        onValueChange={(value) => setForm({ ...form, opType: value ?? '' })}
                    >
                        <SelectTrigger id="op-type">
                            <SelectValue placeholder="Select operation type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Postpaid - Credit">Postpaid - Credit</SelectItem>
                            <SelectItem value="Prepaid">Prepaid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="amount">Initial Amount / Credit Limit</Label>
                    <Input
                        id="amount"
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        placeholder="0.00"
                    />
                </div>
            </div>
        </RightDrawer>
    );
}
