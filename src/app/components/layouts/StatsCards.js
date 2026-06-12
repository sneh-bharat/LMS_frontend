export default function StatsCards() {
    return (
        <div className="grid grid-cols-3 gap-4">

            {/* Card 1 */}
            <div className="bg-gradient-to-r from-green-100 to-green-50 p-4 rounded shadow-sm border text-center">
                <h2 className="text-2xl text-blue-600 font-bold">0</h2>
                <p className="text-gray-600">Total Invoices</p>

                <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <p>0 <br /> Advance Booking</p>
                    <p>0 <br /> Estimation</p>
                    <p>0 <br /> Home Collection</p>
                    <p>0 <br /> Investigation</p>
                </div>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-4 rounded shadow-sm border text-center">
                <h2 className="text-2xl text-blue-600 font-bold">--</h2>
                <p className="text-gray-600">Total Sale</p>

                <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <p>0 <br /> Collection Charges</p>
                    <p>0 <br /> Refund</p>
                    <p>NaN <br /> Other Charges</p>
                    <p>0 <br /> Discount</p>
                </div>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-r from-pink-100 to-pink-50 p-4 rounded shadow-sm border text-center">
                <h2 className="text-2xl text-blue-600 font-bold">0</h2>
                <p className="text-gray-600">Urgent Processing</p>

                <div className="mt-4 text-sm">
                    <p className="text-red-500">0 Deleted Invoice</p>
                    <p className="text-red-500">0 Deleted Investigation</p>
                </div>
            </div>

        </div>
    );
}