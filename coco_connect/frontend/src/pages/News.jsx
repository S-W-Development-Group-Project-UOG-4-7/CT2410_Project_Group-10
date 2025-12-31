import { useState } from "react";

export default function NewsCorner() {
  const [selectedNews, setSelectedNews] = useState(null);

  const newsList = [
    {
      id: 1,
      title: "Coconut Industry Boosts Local Economy",
      shortDescription:
        "Sri Lanka’s coconut exports show strong growth this quarter.",
      fullDescription:
        "Sri Lanka’s coconut industry has shown remarkable growth this year, contributing significantly to rural employment and foreign exchange earnings.\n\nExperts say sustainable farming and global demand are the key drivers behind this success.",
      date: "2025-12-20",
      image:
        "https://images.unsplash.com/photo-1502741126161-f7a638e2f2bd",
    },
    {
      id: 2,
      title: "Smart Farming Technology for Coconut Trees",
      shortDescription:
        "IoT and AI technologies are transforming coconut plantations.",
      fullDescription:
        "Modern coconut plantations are now adopting IoT sensors and AI tools to monitor soil moisture, weather conditions, and tree health.\n\nThis reduces water waste and increases harvest quality.",
      date: "2025-12-18",
      image:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
    },
    {
      id: 3,
      title: "Eco-Friendly Coconut Products Gain Popularity",
      shortDescription:
        "Consumers shift towards biodegradable coconut-based products.",
      fullDescription:
        "From coconut shell utensils to eco-friendly packaging, coconut-based products are gaining massive attention worldwide.\n\nEnvironmental experts encourage this trend as a step towards sustainability.",
      date: "2025-12-15",
      image:
        "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38",
    },
  ];

  return (
    <div className="bg-[#f9faf7] min-h-screen">
      {/* HERO SECTION */}
      <section className="bg-[#4caf50] px-8 py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <h1 className="text-[90px] font-extrabold text-white leading-none">
            News Corner
          </h1>

          <p className="text-sm text-white max-w-sm">
            Latest updates <br />
            Coconut industry, technology, and sustainability.
          </p>
        </div>
      </section>

      {/* NEWS LIST */}
      {!selectedNews && (
        <section className="-mt-20 px-8 pb-20">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {newsList.map((news) => (
              <div
                key={news.id}
                className="rounded-xl overflow-hidden shadow-lg bg-white border border-[#5d4037] transition hover:-translate-y-1"
              >
                <img
                  src={news.image}
                  alt={news.title}
                  className="h-56 w-full object-cover"
                />

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-[#6b3f23]">
                    {news.title}
                  </h3>

                  <p className="text-sm text-[#5d4037]">
                    {news.shortDescription}
                  </p>

                  <p className="text-xs mt-4 text-[#5d4037]">
                    {new Date(news.date).toDateString()}
                  </p>

                  <button
                    onClick={() => setSelectedNews(news)}
                    className="mt-5 w-full py-2 bg-[#4caf50] text-white font-semibold rounded-lg hover:bg-[#66bb6a]"
                  >
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FULL NEWS VIEW */}
      {selectedNews && (
        <section className="px-8 py-20">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden border border-[#5d4037]">
            <img
              src={selectedNews.image}
              alt={selectedNews.title}
              className="h-80 w-full object-cover"
            />

            <div className="p-8">
              <h2 className="text-3xl font-bold mb-4 text-[#6b3f23]">
                {selectedNews.title}
              </h2>

              <p className="text-gray-500 text-sm mb-6">
                {new Date(selectedNews.date).toDateString()}
              </p>

              <p className="text-[#5d4037] whitespace-pre-line leading-relaxed">
                {selectedNews.fullDescription}
              </p>

              <button
                onClick={() => setSelectedNews(null)}
                className="mt-8 px-6 py-3 bg-[#4caf50] text-white font-bold rounded-xl hover:bg-[#66bb6a]"
              >
                ← Back to News
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}  