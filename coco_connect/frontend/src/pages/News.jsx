import { useState } from "react";

export default function NewsCorner() {
  const [selectedNews, setSelectedNews] = useState(null);

  const newsList = [
    {
      id: 1,
      title: "Sri Lanka Coconut Industry Boosts Local Economy",
      shortDescription:
        "Sri Lanka’s coconut exports show steady growth this quarter.",
      location: "Abudabi",
      fullDescription:
        "Sri Lanka’s coconut exports have shown strong and consistent growth during this quarter, driven by increased global demand for coconut-based products such as coconut oil, desiccated coconut, and value-added food items.\n\nIndustry experts state that improved farming practices, better export facilities, and rising international interest in natural and sustainable products have remarkably contributed to this positive trend.",
      date: "2025-12-20",
      image:
        "https://images.unsplash.com/photo-1502741126161-f7a638e2f2bd",
    },
    {
      id: 2,
      title: "Advanced and Smart Farming Technology for Coconut Trees",
      tags: ["IoT","BoI","SLS"],
      shortDescription:
        "IoT and AI technologies are transforming coconut plantations.",
      fullDescription:
        "IoT and AI technologies are improving coconut plantations by enabling farmers to monitor soil moisture, weather conditions, and tree health in real time.\n\nThese technologies help optimize irrigation, detect diseases early, and improve overall crop productivity while reducing resource wastage.IoT and AI technologies are improving coconut plantations through the use of smart sensors and data analytics.\n\nSensors collect real-time data on soil moisture, temperature, and humidity, while AI systems analyze this data to support better decision-making, resulting in healthier trees and increased yields.",
      date: "2025-12-18",
      image:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
    },
    {
      id: 3,
      title: "Eco-Friendly Coconut Products Gain Popularity",
      shortDescription:
        "Consumers shift towards biodegradable coconut-based products.",
      location: "Thooththukudiya International Coconut Providers Pvt(Ltd)",
      tags: ["exports","economy"],
      fullDescription:
        "From coconut shell utensils to eco-friendly packaging, coconut-based products are gaining massive attention worldwide.\n\nEnvironmental experts encourage this trend as a step towards sustainability.",
      date: "2025-12-15",
      image:
        "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38",
    },
    {
      id: 4,
      title: "Export Demand for Coconut Products Increases",
      source: "International Coco Demand",
      tags: ["iot","ai","smart farming Technology"],
      shortDescription:
        "Global demand for Sri Lankan coconut-based products continues to rise.",
      fullDescription:
        "Exporters report increased orders for coconut oil, desiccated coconut, and value-added products.\n\nIndustry analysts believe this trend will strengthen Sri Lanka’s agricultural export sector.",
      date: "2025-12-10",
      image:
        "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2",
    },
    
    {
      id: 5,
      title: "How Coconut Ice Cream Is Made Using Natural Ingredients",
      source: "Coconut Food Lab",
      tags: ["eco","biodegradable","recipe","dessert"],
      shortDescription:
        "A step-by-step look at producing creamy coconut ice cream without artificial additives.",
      fullDescription:
        "Coconut ice cream is made using fresh coconut milk extracted from mature coconuts, combined with natural sweeteners and stabilizers.\n\nThe mixture is slowly churned at low temperatures to achieve a smooth and creamy texture. This dairy-free dessert has gained popularity due to its rich taste and health benefits.",
      date: "2025-12-05",
      image:
        "https://images.unsplash.com/photo-1599785209798-7b0b2e5b4c2b",
    },
    {id: 6,
    title: "Coconut Water Gains Popularity as a Natural Health Drink",
    source: "Health & Nutrition Weekly",
    category: "Health",
    location: "Global",
    readTime: "3 min",
    shortDescription:
      "Coconut water is becoming a popular natural beverage due to its hydration and health benefits.",
    fullDescription:
      "Coconut water has gained global popularity as a natural and refreshing health drink rich in electrolytes.\n\nHealth experts highlight its ability to improve hydration, support digestion, and provide essential minerals without artificial additives. As consumers shift toward natural beverages, coconut water continues to grow in demand worldwide.",
    date: "2025-12-03",
    },
  ];

  return (
    <div className="bg-[#f9faf7] min-h-screen">
      {/* HERO SECTION */}
      <section className="bg-[#4caf50] px-8 py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <h1 className="text-[88px] font-extrabold text-white leading-none">
            Cococonnect News Corner
          </h1>

          <p className="text-sm text-white max-w-sm leading-relaxed">
            Latest updates <br />
            Coconut industry, technology, and sustainability.
          </p>
        </div>
      </section>

{/* NEWS LIST */}
{!selectedNews && (
  <section className="-mt-20 px-8 pb-20">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-extrabold text-[#6b3f23] mb-8">
        Latest Coconut News
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
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

              <p className="text-sm text-[#5d4037]">{news.shortDescription}</p>

              <p className="text-xs mt-4 text-[#5d4037]">
                {new Date(news.date).toDateString()}
              </p>

              <button
                onClick={() => setSelectedNews(news)}
                className="mt-5 w-full py-2 bg-[#4caf50] text-white font-semibold rounded-lg hover:bg-[#66bb6a]"
              >
                Read Full Article
              </button>
            </div>
          </div>
        ))}
      </div>
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