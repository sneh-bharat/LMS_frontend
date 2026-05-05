'use client';

import { useRouter } from 'next/navigation';
import { Printer, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Invoice } from './types';

interface InvoiceTableProps {
  invoices: Invoice[];
}

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  const router = useRouter();

  const handleBarcodeClick = (invoice: Invoice) => {
    router.push(`/diagnosis/invoice-details?id=${invoice.invoiceBarcode}`);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-20">
          <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
              <Printer size={32} />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold text-sm mb-1">No invoices found.</h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                Please try with <span className="text-emerald-600 font-bold">different search</span> terms or{' '}
                <span className="text-rose-500 font-bold">filter criteria</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-y border-slate-200">
            <tr>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-16">
                #
              </th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Invoice & Patient info
              </th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Ref Doctor
              </th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-bold text-slate-600">{invoice.id}</span>
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {/* Invoice Barcode & Patient Name */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleBarcodeClick(invoice)}
                        className="bg-[#FF671F] hover:bg-[#E55D1A] text-white font-bold text-[10px] px-2 py-0.5 rounded transition-colors cursor-pointer"
                      >
                        {invoice.invoiceBarcode}
                      </button>
                      <span className="text-sm font-bold text-slate-900">{invoice.patientName}</span>
                    </div>

                    {/* Patient Details */}
                    <div className="text-xs text-slate-600 space-y-1">
                      <p className="font-semibold">
                        P-ID:{invoice.patientId} | {invoice.age}Y {'>'} {invoice.gender}
                      </p>
                      <p className="font-semibold">{invoice.mobile} {invoice.address}</p>
                    </div>

                    {/* Tests */}
                    <div className="flex flex-wrap gap-1">
                      {invoice.tests.map((test, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded"
                        >
                          {test}
                        </span>
                      ))}
                    </div>

                    {/* Collection Centre & Date */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                      <div className="flex items-center gap-1">
                        <Printer size={12} className="text-green-600" />
                        <ExternalLink size={12} className="text-blue-600" />
                        <span>{invoice.collectionCentre}</span>
                      </div>
                      <span>•</span>
                      <span>Reception on {new Date(invoice.receptionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(invoice.receptionDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-900">{invoice.refDoctor}</p>
                    {invoice.paymentLink && (
                      <button className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors">
                        {invoice.paymentLink}
                      </button>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-1.5 text-right">
                    {/* Total */}
                    <div className="flex items-center justify-end gap-2">
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0">
                        T
                      </Badge>
                      <span className="text-sm font-black text-slate-900">{formatCurrency(invoice.totalAmount)}</span>
                    </div>

                    {/* Paid */}
                    <div className="flex items-center justify-end gap-2">
                      <Badge className="bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold px-1.5 py-0">
                        P
                      </Badge>
                      <span className="text-xs font-bold text-slate-700">{formatCurrency(invoice.paidAmount)}</span>
                    </div>

                    {/* Due */}
                    <div className="flex items-center justify-end gap-2">
                      <Badge className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-1.5 py-0">
                        D
                      </Badge>
                      <span className="text-xs font-bold text-slate-700">{formatCurrency(invoice.dueAmount)}</span>
                    </div>

                    {/* Balance */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-1.5 py-0">
                        B
                      </Badge>
                      <span className="text-sm font-black text-slate-900">{formatCurrency(invoice.balanceAmount)}</span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
