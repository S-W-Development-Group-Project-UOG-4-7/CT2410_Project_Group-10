import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api/news/";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1502741126161-f7a638e2f2bd?auto=format&fit=crop&w=1200&q=60";

function toShort(text = "", max = 110) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (!s) return "";
  return s.length > max ? s.slice(0, max).trim() + "..." : s;
}

export default function NewsCorner() {
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const fetchNews = async () => {
    setLoading(true);
    setErrMsg("");

    try {
      const res = await fetch(API_BASE, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`GET failed (${res.status}) ${text}`);
      }

      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];

      // ✅ show only Published (case-insensitive)
      const published = arr.filter(
        (n) => String(n?.status || "").toLowerCase() === "published"
      );

      // ✅ map backend shape to frontend shape
      const mapped = published.map((n) => {
        const content = n?.content || n?.full_description || n?.description || "";
        const title = n?.title || "Untitled";
        const date = n?.date || n?.created_at || new Date().toISOString().slice(0, 10);

        return {
          id: n?.id,
          title,
          shortDescription: n?.short_description || toShort(content, 110),
          fullDescription: content,
          date,
          image: n?.image || DEFAULT_IMAGE,
        };
      });

      setNewsList(mapped);
    } catch (e) {
      setErrMsg(e?.message || "Failed to load news");
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const sortedNews = useMemo(() => {
    return [...newsList].sort((a, b) => {
      const da = a?.date ? new Date(a.date).getTime() : 0;
      const db = b?.date ? new Date(b.date).getTime() : 0;
      if (db !== da) return db - da;
      return (b?.id ?? 0) - (a?.id ?? 0);
    });
  }, [newsList]);

  return (
    <div className="bg-[#f9faf7] min-h-screen">
      {/* HERO SECTION */}
      <section className="bg-[#4caf50] px-8 py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <h1 className="text-[90px] font-extrabold text-white leading-none">
            News Corner
          </h1>

          <div className="text-sm text-white max-w-sm">
            Latest updates <br />
            Coconut industry, technology, and sustainability.
            <div className="mt-4">
              <button
                onClick={fetchNews}
                className="px-4 py-2 bg-white/15 text-white rounded-lg hover:bg-white/25 border border-white/30"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {errMsg ? (
        <div className="px-8 -mt-10 pb-2">
          <div className="max-w-7xl mx-auto p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {errMsg}
          </div>
        </div>
      ) : null}

      {/* NEWS LIST */}
      {!selectedNews && (
        <section className="-mt-20 px-8 pb-20">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="bg-white border border-[#ece7e1] rounded-xl p-6 shadow-sm">
                Loading news...
              </div>
            ) : sortedNews.length === 0 ? (
              <div className="bg-white border border-[#ece7e1] rounded-xl p-6 shadow-sm">
                No published news found.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {sortedNews.map((news) => (
                  <div
                    key={news.id}
                    className="rounded-xl overflow-hidden shadow-lg bg-white border border-[#5d4037] transition hover:-translate-y-1"
                  >
                    <img
                      src={news.image}
                      alt={news.title}
                      className="h-56 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_IMAGE;
                      }}
                    />

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-[#6b3f23]">
                        {news.title}
                      </h3>

                      <p className="text-sm text-[#5d4037]">
                        {news.shortDescription}
                      </p>

                      <p className="text-xs mt-4 text-[#5d4037]">
                        {news.date ? new Date(news.date).toDateString() : "-"}
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
            )}
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
              onError={(e) => {
                e.currentTarget.src = DEFAULT_IMAGE;
              }}
            />

            <div className="p-8">
              <h2 className="text-3xl font-bold mb-4 text-[#6b3f23]">
                {selectedNews.title}
              </h2>

              <p className="text-gray-500 text-sm mb-6">
                {selectedNews.date
                  ? new Date(selectedNews.date).toDateString()
                  : "-"}
              </p>

              <p className="text-[#5d4037] whitespace-pre-line leading-relaxed">
                {selectedNews.fullDescription || "-"}
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
