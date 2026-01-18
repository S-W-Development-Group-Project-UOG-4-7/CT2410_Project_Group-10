import StatCard from "../components/StatCard";

export default function Dashboard() {
  return (
    <div className="space-y-10">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Users" value="1,240" />
        <StatCard title="Online Users" value="86" />
        <StatCard title="Total Revenue" value="Rs. 235,680" />
        <StatCard title="Commission" value="8%" />
      </div>

      <div className="bg-white border-2 border-[#ece7e1] rounded-2xl p-8 shadow-md">
        <h3 className="text-xl font-bold text-[#6b3f23] mb-4">
          Admin Overview
        </h3>
        <p className="text-gray-600">
          Monitor users, control content, manage revenue and platform settings
          from here.
        </p>
      </div>
    </div>
  );
}
