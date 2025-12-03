// src/pages/Home.jsx (or similar)

// 1. IMPORTS
import { useState, useEffect } from "react";
import aboutImg from "../assets/about_coconut.jpg";

// 👆 change this path if your file is in another place
// e.g. "./assets/about_coconut.jpg" or "../../assets/about_coconut.jpg"

// 2. SLIDES DATA
const slides = [
  {
    id: 1,
    title: "Connecting Sri Lanka’s Coconut Industry Into One Smart Ecosystem.",
    subtitle:
      "Bringing farmers, investors, and innovators together on one trusted digital platform.",
    buttonLabel: "Explore Ecosystem",
    image: "/hero_1.jpg",
  },
  {
    id: 2,
    title: "Unlocking New Opportunities for Farmers, Investors, and Innovators.",
    subtitle:
      "Invest in coconut projects, discover new products, and grow with the CocoConnect community.",
    buttonLabel: "Discover Opportunities",
    image: "/hero_2.jpg",
  },
];

export default function Home() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrent((prev) => (prev + 1) % slides.length),
      6000
    );
    return () => clearInterval(interval);
  }, []);

  const goToNext = () => setCurrent((prev) => (prev + 1) % slides.length);
  const goToPrev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="home-page">
      {/* Hero-Section CAROUSEL */}
        <section className="relative w-full h-[380px] sm:h-[450px] md:h-[520px] lg:h-[600px] overflow-hidden">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  index === current ? "opacity-100 z-20" : "opacity-0 z-10"
                }`}
              >
                <img  src={slide.image}  alt="hero"   className="w-full h-full object-cover"  />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-4 max-w-3xl">
                    <h1 className="font-mont font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[2.7rem] text-white leading-snug mb-3">
                      {slide.title}
                    </h1>
                    <p className="font-mont text-white/90 text-sm sm:text-base md:text-lg mb-6">
                      {slide.subtitle}
                    </p>
                    <button className="px-7 py-3 rounded-full bg-[#ece7e1] text-gray-900 text-sm font-medium shadow hover:bg-gray-100 transition">
                      {slide.buttonLabel}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Arrows */}
            <button onClick={goToPrev}  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-900 w-10 h-10 rounded-full shadow z-30 flex items-center justify-center text-xl"  > ‹ </button>
            <button  onClick={goToNext}  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-900 w-10 h-10 rounded-full shadow z-30 flex items-center justify-center text-xl">  ›  </button>

            {/* Dots */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 z-30">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                    className={`w-3 h-3 rounded-full transition border border-white ${
                      index === current ? "bg-white" : "bg-white/30"
                    }`}
                  />
                ))}
            </div>
        </section>

      {/* ABOUT SECTION */}
      <section className="w-full bg-white py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          {/* LEFT TEXT */}
          <div>
            <h2 className="font-mont font-bold text-3xl md:text-4xl text-gray-900 mb-4">
              About CocoConnect
            </h2>

            <p className="font-mont text-gray-700 text-base md:text-lg leading-relaxed mb-6">
              CocoConnect is a smart digital ecosystem designed to modernize Sri
              Lanka’s coconut industry. We connect farmers, investors,
              distributors, and customers on one transparent platform powered by
              blockchain and AI.
            </p>

            <ul className="space-y-3 font-mont text-gray-700 text-base">
              <li className="flex items-center gap-2">
                <span className="text-green-600 text-xl">✔</span>
                Direct marketplace for coconut producers
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 text-xl">✔</span>
                Investment opportunities for coconut projects
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 text-xl">✔</span>
                Blockchain-based transparency & trusted trade
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600 text-xl">✔</span>
                AI-powered price insights and analytics
              </li>
            </ul>

            <button className="mt-8 px-7 py-3 rounded-full bg-[#ece7e1] text-gray-800 font-mont font-medium hover:bg-gray-200 transition shadow">
              Learn More
            </button>
          </div>

          {/* RIGHT IMAGE */}
          <div className="w-full">
            <img
              src={aboutImg}
              alt="About CocoConnect"
              className="w-full rounded-2xl shadow-md object-cover h-[280px] sm:h-[340px] md:h-[400px]"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="w-full bg-[#faf8f5] py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="font-mont font-bold text-3xl md:text-4xl text-gray-900">
            Key Features
          </h2>
          <p className="font-mont text-gray-600 text-base md:text-lg mt-3">
            Smart tools designed to empower every coconut industry stakeholder.
          </p>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition">
            <div className="text-green-600 text-3xl mb-3">🌴</div>
            <h3 className="font-mont font-semibold text-lg text-gray-900 mb-2">
              Smart Marketplace
            </h3>
            <p className="font-mont text-gray-600 text-sm">
              Buy and sell coconut products directly without middlemen.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition">
            <div className="text-green-600 text-3xl mb-3">💰</div>
            <h3 className="font-mont font-semibold text-lg text-gray-900 mb-2">
              Investment Module
            </h3>
            <p className="font-mont text-gray-600 text-sm">
              Investors can fund coconut projects and earn returns transparently.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition">
            <div className="text-green-600 text-3xl mb-3">🔗</div>
            <h3 className="font-mont font-semibold text-lg text-gray-900 mb-2">
              Blockchain Transparency
            </h3>
            <p className="font-mont text-gray-600 text-sm">
              Trusted verification for every transaction and product source.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition">
            <div className="text-green-600 text-3xl mb-3">🤖</div>
            <h3 className="font-mont font-semibold text-lg text-gray-900 mb-2">
              AI Insights
            </h3>
            <p className="font-mont text-gray-600 text-sm">
              Price predictions, market trends, and data-driven recommendations.
            </p>
          </div>

        </div>
      </section>

      {/* MARKETPLACE SECTION */}
      <section className="w-full bg-white py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-mont font-bold text-3xl md:text-4xl text-gray-900">
              Marketplace Overview
            </h2>
            <p className="font-mont text-gray-600 text-base md:text-lg mt-3">
              Discover coconut products, raw materials, and services in one smart marketplace.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-[#faf8f5] rounded-2xl p-6 shadow hover:shadow-md transition">
              <div className="text-3xl mb-3">🧺</div>
              <h3 className="font-mont font-semibold text-lg text-gray-900 mb-2">
                Retail & Wholesale Products
              </h3>
              <p className="font-mont text-gray-600 text-sm mb-4">
                Browse coconut oil, desiccated coconut, coir products, and more from trusted producers.
              </p>
              <button className="font-mont text-sm px-4 py-2 rounded-full bg-[#ece7e1] text-gray-800 hover:bg-gray-200 transition">
                View Products
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-[#faf8f5] rounded-2xl p-6 shadow hover:shadow-md transition">
              <div className="text-3xl mb-3">📦</div>
              <h3 className="font-mont font-semibold text-lg text-gray-900 mb-2">
                Raw Materials & By-Products
              </h3>
              <p className="font-mont text-gray-600 text-sm mb-4">
                Connect with suppliers of husks, shells, fiber, and other value-added coconut by-products.
              </p>
              <button className="font-mont text-sm px-4 py-2 rounded-full bg-[#ece7e1] text-gray-800 hover:bg-gray-200 transition">
                Explore Materials
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-[#faf8f5] rounded-2xl p-6 shadow hover:shadow-md transition">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-mont font-semibold text-lg text-gray-900 mb-2">
                Industrial & Service Support
              </h3>
              <p className="font-mont text-gray-600 text-sm mb-4">
                Find machinery providers, logistics partners, and industrial service providers.
              </p>
              <button className="font-mont text-sm px-4 py-2 rounded-full bg-[#ece7e1] text-gray-800 hover:bg-gray-200 transition">
                Find Partners
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY SECTION */}
      <section className="w-full bg-[#faf8f5] py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-mont font-bold text-3xl md:text-4xl text-gray-900">
              Community & Collaboration
            </h2>
            <p className="font-mont text-gray-600 text-base md:text-lg mt-3">
              A space for farmers, investors, experts, and innovators to connect and share ideas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="font-mont font-semibold text-lg text-gray-900 mb-2">
                Idea Sharing Hub
              </h3>
              <p className="font-mont text-gray-600 text-sm mb-4">
                Share and discover new coconut-based product ideas and innovation concepts.
              </p>
              <button className="font-mont text-sm px-4 py-2 rounded-full bg-[#ece7e1] text-gray-800 hover:bg-gray-200 transition">
                Share an Idea
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition">
              <div className="text-3xl mb-3">📣</div>
              <h3 className="font-mont font-semibold text-lg text-gray-900 mb-2">
                Discussion & Support
              </h3>
              <p className="font-mont text-gray-600 text-sm mb-4">
                Ask questions, get advice, and support other members of the coconut community.
              </p>
              <button className="font-mont text-sm px-4 py-2 rounded-full bg-[#ece7e1] text-gray-800 hover:bg-gray-200 transition">
                Join Community
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-mont font-semibold text-lg text-gray-900 mb-2">
                Success Stories
              </h3>
              <p className="font-mont text-gray-600 text-sm mb-4">
                Learn from real projects, farmer journeys, and investor success stories.
              </p>
              <button className="font-mont text-sm px-4 py-2 rounded-full bg-[#ece7e1] text-gray-800 hover:bg-gray-200 transition">
                View Stories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* NEWS SECTION */}
      <section className="w-full bg-white py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="font-mont font-bold text-3xl md:text-4xl text-gray-900">
                Latest Updates & News
              </h2>
              <p className="font-mont text-gray-600 text-base md:text-lg mt-3">
                Stay informed about coconut industry trends, platform updates, and events.
              </p>
            </div>
            <button className="font-mont text-sm px-6 py-2.5 rounded-full bg-[#ece7e1] text-gray-800 hover:bg-gray-200 transition shadow">
              View All News
            </button>
          </div>

          <div className="space-y-4">
            {/* News item 1 */}
            <article className="border border-gray-100 rounded-2xl p-4 md:p-5 hover:shadow-sm transition">
              <p className="font-mont text-xs uppercase tracking-wide text-gray-500 mb-1">
                Nov 2025 · Platform Update
              </p>
              <h3 className="font-mont font-semibold text-lg text-gray-900 mb-1">
                CocoConnect beta marketplace goes live for early users
              </h3>
              <p className="font-mont text-gray-600 text-sm">
                Early access users can now list coconut products, explore suppliers, and simulate
                investment opportunities inside the platform.
              </p>
            </article>

            {/* News item 2 */}
            <article className="border border-gray-100 rounded-2xl p-4 md:p-5 hover:shadow-sm transition">
              <p className="font-mont text-xs uppercase tracking-wide text-gray-500 mb-1">
                Oct 2025 · Industry Insight
              </p>
              <h3 className="font-mont font-semibold text-lg text-gray-900 mb-1">
                Growing demand for value-added coconut by-products
              </h3>
              <p className="font-mont text-gray-600 text-sm">
                Global buyers are increasingly looking for eco-friendly coir, fiber, and shell-based
                products, creating new opportunities for Sri Lankan producers.
              </p>
            </article>

            {/* News item 3 */}
            <article className="border border-gray-100 rounded-2xl p-4 md:p-5 hover:shadow-sm transition">
              <p className="font-mont text-xs uppercase tracking-wide text-gray-500 mb-1">
                Sep 2025 · Community
              </p>
              <h3 className="font-mont font-semibold text-lg text-gray-900 mb-1">
                Farmer–investor collaboration pilots launched
              </h3>
              <p className="font-mont text-gray-600 text-sm">
                Selected farmers and investors are testing transparent, blockchain-based agreements
                to support sustainable coconut projects.
              </p>
            </article>
          </div>
        </div>
      </section>

    </div>
  );
}
