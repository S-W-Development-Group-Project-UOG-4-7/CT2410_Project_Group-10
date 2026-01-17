export default function Overview() {
  // 🔒 Hardcoded demo data
  const stats = {
    orders: 8,
    activeOrders: 2,
    investments: 3,
    totalInvestment: "LKR 450,000",
    ideasShared: 5,
    approvedIdeas: 2,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Customer Overview
      </h1>

      {/* Top analytics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Orders Placed</p>
          <p className="text-3xl font-bold text-gray-800">{stats.orders}</p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.activeOrders} active orders
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Investments</p>
          <p className="text-3xl font-bold text-gray-800">
            {stats.investments}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Total: {stats.totalInvestment}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Ideas Shared</p>
          <p className="text-3xl font-bold text-gray-800">
            {stats.ideasShared}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.approvedIdeas} approved
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Account Status</p>
          <p className="text-xl font-semibold text-green-600">Active</p>
          <p className="text-xs text-gray-400 mt-1">
            Last login: Today
          </p>
        </div>
      </div>

      {/* Recent activity (hardcoded) */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h2>

        <ul className="space-y-3 text-sm text-gray-700">
          <li>🛒 Placed an order for Coconut Oil</li>
          <li>💰 Invested in Coconut Land #12</li>
          <li>💡 Submitted an idea on Coconut Waste Recycling</li>
          <li>📦 Order #1024 marked as Delivered</li>
        </ul>
      </div>
    </div>
  );
}
