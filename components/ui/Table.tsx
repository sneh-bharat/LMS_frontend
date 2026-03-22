import React from 'react';

interface TableProps {
    children?: React.ReactNode;
    columns?: string[];
    data?: any[];
    renderRow?: (item: any, index: number) => React.ReactNode;
}

export default function Table({ children, columns, data, renderRow }: TableProps) {
    if (columns && data) {
        return (
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) =>
                        renderRow ? (
                            renderRow(item, index)
                        ) : (
                            <tr key={index}>
                                {columns.map((_, colIndex) => (
                                    <td key={colIndex} className="px-4 py-3 whitespace-nowrap">
                                        {item[columns[colIndex]]}
                                    </td>
                                ))}
                            </tr>
                        )
                    )}
                </tbody>
            </table>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                {children}
            </table>
        </div>
    );
}
