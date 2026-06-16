'use client';

import React, { useState } from 'react';
import RightDrawer from '@/components/ui/right-drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, XCircle, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface TubeDetail {
  type: string;
  quantity: number;
  confirmed: boolean;
}

export interface TestSample {
  id: string;
  sampleCode: string;
  patientName: string;
  collectedBy: string;
  testName: string;
  sampleType: string;
  collectedAt: string;
  status: 'Pending' | 'Processing' | 'Complete' | 'Failed';
  location: 'Clinic' | 'Laboratory' | 'Home';
  createdAt?: string;
  notes?: string;
  tubes?: TubeDetail[];
}

interface AddNewSampleProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TestSample) => void;
  editData?: TestSample | null;
  isEditMode?: boolean;
}

const SAMPLE_TYPES = [
  'Blood',
  'Urine',
  'Serum',
  'Plasma',
  'CSF',
  'Stool',
  'Saliva',
  'Nasal Swab',
  'Throat Swab',
];

const STATUS_OPTIONS = ['Pending', 'Processing', 'Complete', 'Failed'];
const LOCATION_OPTIONS = ['Clinic', 'Laboratory', 'Home'];

const AVAILABLE_TESTS = [
  'Complete Blood Count (CBC)',
  'Urine Test',
  'Liver Function Test (LFT)',
  'COVID-19 RT-PCR',
  'Blood Culture',
  'Lipid Profile',
  'Kidney Function Test (KFT)',
  'Thyroid Profile',
];

const TUBE_TYPES = [
  'EDTA (Purple)',
  'SST (Gold/Red)',
  'Sodium Citrate (Blue)',
  'Fluoride (Grey)',
  'Heparin (Green)',
];

export default function AddNewSample({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
  isEditMode = false,
}: AddNewSampleProps) {
  const [formData, setFormData] = useState<TestSample>(
    editData || {
      id: '',
      sampleCode: '',
      patientName: '',
      collectedBy: '',
      testName: '',
      sampleType: '',
      collectedAt: '',
      status: 'Pending',
      location: 'Clinic',
      notes: '',
      tubes: [],
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tubes, setTubes] = useState<TubeDetail[]>(
    editData?.tubes || [{ type: '', quantity: 1, confirmed: false }]
  );

  React.useEffect(() => {
    if (editData) {
      setFormData(editData);
      setTubes(editData.tubes || [{ type: '', quantity: 1, confirmed: false }]);
    } else {
      setFormData({
        id: '',
        sampleCode: '',
        patientName: '',
        collectedBy: '',
        testName: '',
        sampleType: '',
        collectedAt: '',
        status: 'Pending',
        location: 'Clinic',
        notes: '',
        tubes: [],
      });
      setTubes([{ type: '', quantity: 1, confirmed: false }]);
    }
    setErrors({});
  }, [editData, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleTubeChange = (index: number, field: keyof TubeDetail, value: any) => {
    const updated = [...tubes];
    updated[index] = { ...updated[index], [field]: value };
    setTubes(updated);
  };

  const addTubeRow = () => {
    setTubes([...tubes, { type: '', quantity: 1, confirmed: false }]);
  };

  const removeTubeRow = (index: number) => {
    const updated = tubes.filter((_, i) => i !== index);
    setTubes(updated);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sampleCode.trim()) {
      newErrors.sampleCode = 'Sample Code is required';
    }
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient Name is required';
    }
    if (!formData.collectedBy.trim()) {
      newErrors.collectedBy = 'Collected By is required';
    }
    if (!formData.testName) {
      newErrors.testName = 'Test Name is required';
    }
    if (!formData.sampleType) {
      newErrors.sampleType = 'Sample Type is required';
    }
    if (!formData.collectedAt) {
      newErrors.collectedAt = 'Collection date and time is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const finalData = {
        ...formData,
        tubes: tubes.filter(t => t.type),
      };
      onSubmit(finalData);
      onClose();
    }
  };

  const handleCancel = () => {
    setFormData({
      id: '',
      sampleCode: '',
      patientName: '',
      collectedBy: '',
      testName: '',
      sampleType: '',
      collectedAt: '',
      status: 'Pending',
      location: 'Clinic',
      notes: '',
      tubes: [],
    });
    setTubes([{ type: '', quantity: 1, confirmed: false }]);
    setErrors({});
    onClose();
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleCancel}
      title={isEditMode ? 'Edit Test Sample' : 'Add New Test Sample'}
      description={isEditMode ? 'Update the sample details below.' : 'Fill in the form to add a new test sample.'}
      footer={
        <>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isEditMode ? 'Update Sample' : 'Add Sample'}
          </Button>
        </>
      }
       maxWidth="xl"
    >
      <div className="space-y-6 py-4">
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the errors below to continue.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Sample Code */}
          <div className="space-y-2">
            <Label htmlFor="sampleCode">Sample Code *</Label>
            <Input
              id="sampleCode"
              name="sampleCode"
              placeholder="S001"
              value={formData.sampleCode}
              onChange={handleInputChange}
              disabled={isEditMode}
              className={errors.sampleCode ? 'border-red-500' : ''}
            />
            {errors.sampleCode && (
              <p className="text-xs text-red-500">{errors.sampleCode}</p>
            )}
          </div>

          {/* Patient Name */}
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name *</Label>
            <Input
              id="patientName"
              name="patientName"
              placeholder="John Doe"
              value={formData.patientName}
              onChange={handleInputChange}
              className={errors.patientName ? 'border-red-500' : ''}
            />
            {errors.patientName && (
              <p className="text-xs text-red-500">{errors.patientName}</p>
            )}
          </div>
        </div>

        {/* Collected By */}
        <div className="space-y-2">
          <Label htmlFor="collectedBy">Collected By *</Label>
          <Input
            id="collectedBy"
            name="collectedBy"
            placeholder="Enter collector name"
            value={formData.collectedBy}
            onChange={handleInputChange}
            className={errors.collectedBy ? 'border-red-500' : ''}
          />
          {errors.collectedBy && (
            <p className="text-xs text-red-500">{errors.collectedBy}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Test Name */}
          <div className="space-y-2">
            <Label htmlFor="testName">Test Name *</Label>
            <Select
              value={formData.testName}
              onValueChange={(value) =>
                handleSelectChange('testName', value || '')
              }
            >
              <SelectTrigger
                id="testName"
                className={errors.testName ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Select test" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_TESTS.map((test) => (
                  <SelectItem key={test} value={test}>
                    {test}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.testName && (
              <p className="text-xs text-red-500">{errors.testName}</p>
            )}
          </div>

          {/* Sample Type */}
          <div className="space-y-2">
            <Label htmlFor="sampleType">Sample Type *</Label>
            <Select
              value={formData.sampleType}
              onValueChange={(value) =>
                handleSelectChange('sampleType', value || '')
              }
            >
              <SelectTrigger
                id="sampleType"
                className={errors.sampleType ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sampleType && (
              <p className="text-xs text-red-500">{errors.sampleType}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Collected At */}
          <div className="space-y-2">
            <Label htmlFor="collectedAt">Collection Date & Time *</Label>
            <Input
              id="collectedAt"
              name="collectedAt"
              type="datetime-local"
              value={formData.collectedAt}
              onChange={handleInputChange}
              className={errors.collectedAt ? 'border-red-500' : ''}
            />
            {errors.collectedAt && (
              <p className="text-xs text-red-500">{errors.collectedAt}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                handleSelectChange('status', value as any)
              }
            >
              <SelectTrigger
                id="status"
                className={errors.status ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-red-500">{errors.status}</p>
            )}
          </div>
        </div>
        {/* Sample Collect at Location */}

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Select
              value={formData.location}
              onValueChange={(value) =>
                handleSelectChange('location', value as any)
              }
            >
              <SelectTrigger
                id="status"
                className={errors.status ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_OPTIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.location && (
              <p className="text-xs text-red-500">{errors.location}</p>
            )}
          </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Add any notes about this sample..."
            value={formData.notes || ''}
            onChange={handleInputChange}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Tube Collection Section */}
        <div className="border-t border-slate-200 pt-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tube Type & Quantity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Auto-display + Confirm each tube collected</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addTubeRow}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Tube
            </Button>
          </div>

          <div className="space-y-3">
            {tubes.map((tube, index) => (
              <div 
                key={index} 
                className={`flex items-end gap-3 p-4 rounded-lg border ${
                  tube.confirmed 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex-1">
                  <Label className="text-xs font-semibold">Tube Type</Label>
                  <Select
                    value={tube.type}
                    onValueChange={(value) => handleTubeChange(index, 'type', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select tube type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TUBE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24">
                  <Label className="text-xs font-semibold">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={tube.quantity}
                    onChange={(e) => handleTubeChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center gap-2 pb-2">
                  <Button
                    variant={tube.confirmed ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTubeChange(index, 'confirmed', !tube.confirmed)}
                    className={tube.confirmed ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                    title={tube.confirmed ? 'Confirmed' : 'Mark as confirmed'}
                  >
                    {tube.confirmed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </Button>
                  {tubes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTubeRow(index)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {tubes.some(t => t.confirmed) && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="default" className="bg-emerald-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {tubes.filter(t => t.confirmed).length} Confirmed
              </Badge>
              <Badge variant="outline">
                Total: {tubes.reduce((sum, t) => sum + t.quantity, 0)} tubes
              </Badge>
            </div>
          )}
        </div>
      </div>
    </RightDrawer>
  );
}