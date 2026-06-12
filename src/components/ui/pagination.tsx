interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    showInfo?: boolean;
    totalItems?: number;
    itemsPerPage?: number;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    showInfo = true,
    totalItems,
    itemsPerPage,
}: PaginationProps) {
    return (
        <div className="flex flex-between mt-lg">
            {showInfo && totalItems && (
                <p className="text-secondary">
                    Showing {(currentPage - 1) * (itemsPerPage || 10) + 1} to{' '}
                    {Math.min(currentPage * (itemsPerPage || 10), totalItems)} of{' '}
                    {totalItems} items
                </p>
            )}

            <div className="pagination">
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}

                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}