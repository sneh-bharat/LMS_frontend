import React from 'react';

interface TableProps {
    children?: React.ReactNode;
    columns?: string[];
    data?: any[];
    renderRow?: (item: any, index: number) => React.ReactNode;
    className?: string;
}

export default function Table({ children, columns, data, renderRow, className = '' }: TableProps) {
    if (columns && data) {
        return (
            <div className={`glass rounded-[2rem] overflow-hidden ${className}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                {columns.map((column, index) => (
                                    <th key={index} className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.map((item, index) =>
                                renderRow ? (
                                    renderRow(item, index)
                                ) : (
                                    <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                        {columns.map((_, colIndex) => (
                                            <td key={colIndex} className="px-8 py-5 text-slate-700 font-bold group-hover:text-green-700 transition-colors">
                                                {item[columns[colIndex]]}
                                            </td>
                                        ))}
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className={`glass rounded-[2rem] overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    {children}
                </table>
            </div>
        </div>
    );
}
