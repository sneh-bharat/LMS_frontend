interface TableProps {
    columns?: Array<{
        key: string;
        label: string;
        render?: (value: any, row: any, index: number) => React.ReactNode;
    }>;
    data?: any[];
    loading?: boolean;
    onRowClick?: (row: any) => void;
}

export default function Table({
    columns = [],
    data = [],
    loading = false,
    onRowClick,
}: TableProps) {

    if (loading) {
        return <div className="py-6 text-center text-sm">Loading...</div>;
    }

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="w-full text-xs">

                {/* Header */}
                <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className="px-3 py-2 text-left font-medium">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Body */}
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length || 1}
                                className="text-center py-6 text-gray-500"
                            >
                                No record found. Please try with different search criteria.
                            </td>
                        </tr>
                    ) : (
                        data.map((row, idx) => (
                            <tr
                                key={idx}
                                onClick={() => onRowClick?.(row)}
                                className={`border-t ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                                    }`}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-3 py-2">
                                        {col.render
                                            ? col.render(row[col.key], row, idx)
                                            : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>

            </table>
        </div>
    );
}