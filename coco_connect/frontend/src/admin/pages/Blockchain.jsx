export default function Blockchain() {
  return (
    <div className="max-w-xl bg-white border-2 border-[#ece7e1] rounded-2xl p-8 shadow-md">
      <h2 className="text-2xl font-bold text-[#6b3f23] mb-6">
        Blockchain Commission Settings
      </h2>

      <div className="mb-6">
        <label className="block font-semibold text-[#5d4037] mb-2">
          Platform Commission (%)
        </label>

        <input
          type="number"
          defaultValue={8}
          className="w-full border border-[#ece7e1] rounded-lg p-3 focus:outline-none focus:border-[#4caf50]"
        />
      </div>

      <div className="mb-6">
        <label className="block font-semibold text-[#5d4037] mb-2">
          Blockchain Status
        </label>

        <select className="w-full border border-[#ece7e1] rounded-lg p-3 focus:outline-none focus:border-[#4caf50]">
          <option>Enabled</option>
          <option>Disabled</option>
        </select>
      </div>

      <button className="w-full bg-[#4caf50] hover:bg-[#66bb6a] text-white py-3 rounded-xl font-bold transition">
        Save Changes
      </button>
    </div>
  );
}
