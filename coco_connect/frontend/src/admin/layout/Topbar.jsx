export default function Topbar() {
  return (
    <header className="bg-white border-b-2 border-[#ece7e1] px-8 py-5 flex justify-between items-center">
      <h2 className="text-2xl font-bold text-[#6b3f23]">Admin Dashboard</h2>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#4caf50] text-white flex items-center justify-center font-bold">
          A
        </div>
        <span className="font-semibold">Admin</span>
      </div>
    </header>
  );
}
