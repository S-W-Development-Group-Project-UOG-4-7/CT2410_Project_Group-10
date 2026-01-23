export default function StatCard({ title, value }) {
  return (
    <div className="bg-white border-2 border-[#ece7e1] rounded-2xl p-6 shadow-md hover:shadow-xl transition">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-3xl font-bold text-[#6b3f23] mt-2">{value}</h3>
    </div>
  );
}
