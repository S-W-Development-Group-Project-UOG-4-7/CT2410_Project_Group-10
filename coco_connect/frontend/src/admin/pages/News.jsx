import { useState } from "react";

export default function AdminNews() {
  const [newsList, setNewsList] = useState([
    {
      id: 1,
      title: "Coconut Industry Boosts Local Economy",
      date: "2025-12-20",
      status: "Published",
    },
    {
      id: 2,
      title: "Smart Farming Technology for Coconut Trees",
      date: "2025-12-18",
      status: "Draft",
    },
    {
      id: 3,
      title: "Eco-Friendly Coconut Products Gain Popularity",
      date: "2025-12-15",
      status: "Published",
    },
  ]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this news?")) {
      setNewsList(newsList.filter((news) => news.id !== id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">News Management</h1>
        <button className="px-4 py-2 bg-[#4caf50] text-white rounded-lg hover:bg-[#66bb6a]">
          + Add News
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-[#ece7e1] rounded-xl shadow-sm">
          <thead>
            <tr className="bg-[#f2f7f2] text-left">
              <th className="py-3 px-4 border-b">ID</th>
              <th className="py-3 px-4 border-b">Title</th>
              <th className="py-3 px-4 border-b">Date</th>
              <th className="py-3 px-4 border-b">Status</th>
              <th className="py-3 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {newsList.map((news) => (
              <tr key={news.id} className="hover:bg-[#f9faf7]">
                <td className="py-3 px-4 border-b">{news.id}</td>
                <td className="py-3 px-4 border-b">{news.title}</td>
                <td className="py-3 px-4 border-b">
                  {new Date(news.date).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 border-b">{news.status}</td>
                <td className="py-3 px-4 border-b flex gap-2">
                  <button className="px-3 py-1 bg-[#4caf50] text-white rounded-lg hover:bg-[#66bb6a]">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(news.id)}
                    className="px-3 py-1 bg-[#f44336] text-white rounded-lg hover:bg-[#e57373]"
                  >
                    Delete
                  </button>
                  <button className="px-3 py-1 bg-[#2196f3] text-white rounded-lg hover:bg-[#64b5f6]">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
