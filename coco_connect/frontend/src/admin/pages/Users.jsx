export default function Users() {
  return (
    <div className="bg-white border-2 border-[#ece7e1] rounded-2xl p-8 shadow-md">
      <h2 className="text-2xl font-bold text-[#6b3f23] mb-6">
        Registered Users
      </h2>

      <table className="w-full">
        <thead>
          <tr className="border-b border-[#ece7e1] text-left">
            <th className="py-3">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[#ece7e1]">
            <td className="py-3 font-semibold">Niven Asmitha</td>
            <td>niven@mail.com</td>
            <td>Admin</td>
            <td className="text-[#4caf50] font-semibold">Online</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
