// 1. IMPORTS
import { useState, useEffect } from "react";
import aboutVideo from "../assets/about-video.mp4";
import directImg from "../assets/feature_1.png";
import investImg from "../assets/feature_2.png";
import blockchainImg from "../assets/feature_3.png";
import aiImg from "../assets/feature_4.png";
import byproductImg from "../assets/feature_5.png";

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
  // HERO CAROUSEL STATE
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrent((prev) => (prev + 1) % slides.length),
      6000
    );
    return () => clearInterval(interval);
  }, []);

  const goToNext = () => setCurrent((prev) => (prev + 1) % slides.length);
  const goToPrev = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  // FAQ DATA + STATE
  const faqs = [
    {
      question: "What is CocoConnect?",
      answer: "CocoConnect is a smart digital ecosystem that connects coconut farmers, landowners, investors, distributors and buyers on one platform to trade, invest and collaborate transparently.",
    },
    {
      question: "Who can use the platform?",
      answer: "Coconut farmers, landowners, processors, distributors, exporters, investors and customers who want verified coconut products from Sri Lanka can all join and use CocoConnect.",
    },
    {
      question: "How do investments work on CocoConnect?",
      answer: "Project owners can list coconut-related projects with funding needs and expected returns. Investors can fund these projects and track performance and revenue sharing through smart contracts.",
    },
    {
      question: "Why does CocoConnect use blockchain?",
      answer: "Blockchain records key transactions and agreements in a tamper-proof way. It builds trust, ensures transparent profit sharing and gives traceability across the coconut supply chain.",
    },
    {
      question: "How does AI help me?",
      answer: "AI modules provide price predictions, demand trends and recommendations so you can make data-driven decisions on trading, investing and production planning.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);
  const toggleFAQ = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

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
        <section className="w-full bg-[#f7f9f4] py-16 px-6 md:px-12 lg:px-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
            
            {/* LEFT TEXT */}
            <div className="md:pr-6">
              <h2 className="font-mont font-bold text-3xl md:text-4xl text-gray-900 mb-4">
                Explore Sri Lanka's Coconut Industry
              </h2>

              <p className="font-mont text-gray-700 text-base md:text-lg leading-relaxed mb-6 text-justify">
                CocoConnect is a smart digital ecosystem built to modernize Sri Lanka’s coconut sector. 
                We bring together farmers, investors, distributors, and customers on a transparent platform 
                powered by blockchain and AI.
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

              <button className="mt-8 px-7 py-3 rounded-full bg-[#66bb6a] text-white font-mont font-medium hover:bg-[#559e5a] transition shadow">
                Learn More
              </button>
            </div>

            {/* RIGHT VIDEO */}
            <div className="w-full md:pl-4">
              <video
                src={aboutVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-xl shadow-md object-cover h-[280px] sm:h-[340px] md:h-[400px]"
              />
            </div>

          </div>
        </section>

        {/* FEATURES */}
        <section className="w-full bg-[#faf8f5] py-16 px-6 md:px-12 lg:px-24">
          <div className="max-w-6xl mx-auto">
            {/* Heading */}
            <div className="text-center mb-10">
              <h2 className="font-mont font-bold text-3xl md:text-4xl text-gray-900">
                Features
              </h2>
              <p className="font-mont text-gray-600 text-base md:text-lg mt-3">
                Core capabilities that power the CocoConnect ecosystem.
              </p>
            </div>

            {/* Grid – same structure, taller rows so images are visible */}
            <div className="grid gap-4 md:grid-cols-3 auto-rows-[minmax(200px,1fr)]">
              {/* Top-left small card */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm group cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl">
                {/* Image */}
                <img
                  src={directImg}
                  alt="Direct Marketplace"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/55 transition-colors duration-300" />
                {/* Text / hover text */}
                <div className="relative z-10 flex h-full items-center justify-center p-4 text-center text-white">
                  <p className="font-mont font-semibold text-sm md:text-base group-hover:opacity-0 transition-opacity duration-300">
                    Direct Marketplace
                  </p>
                  <p className="font-mont text-xs md:text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0 flex items-center justify-center px-4">
                    Connect directly with verified partners. No intermediaries, better prices,
                    faster deals.
                  </p>
                </div>
              </div>

              {/* Top-middle small card */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm group cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl">
                <img
                  src={investImg}
                  alt="Investment Opportunities"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/55 transition-colors duration-300" />
                <div className="relative z-10 flex h-full items-center justify-center p-4 text-center text-white">
                  <p className="font-mont font-semibold text-sm md:text-base group-hover:opacity-0 transition-opacity duration-300">
                    Investment Opportunities
                  </p>
                  <p className="font-mont text-xs md:text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0 flex items-center justify-center px-4">
                    Fund sustainable projects. Track ROI transparently with smart contract
                    automation.
                  </p>
                </div>
              </div>

              {/* Right tall card – spans two rows */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm group cursor-pointer md:row-span-2 transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl">
                <img
                  src={blockchainImg}
                  alt="Blockchain Transparency"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/55 transition-colors duration-300" />
                <div className="relative z-10 flex h-full items-center justify-center p-6 text-center text-white">
                  <p className="font-mont font-semibold text-base md:text-lg leading-relaxed group-hover:opacity-0 transition-opacity duration-300">
                    Blockchain
                    <br />
                    Transparency
                  </p>
                  <p className="font-mont text-xs md:text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0 flex items-center justify-center px-5">
                    Immutable verification for every transaction. Trace products from farm
                    to consumer with complete supply chain visibility.
                  </p>
                </div>
              </div>

              {/* Bottom-left small card */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm group cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl">
                <img
                  src={aiImg}
                  alt="AI Analytics"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/55 transition-colors duration-300" />
                <div className="relative z-10 flex h-full items-center justify-center p-4 text-center text-white">
                  <p className="font-mont font-semibold text-sm md:text-base group-hover:opacity-0 transition-opacity duration-300">
                    AI Analytics
                  </p>
                  <p className="font-mont text-xs md:text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0 flex items-center justify-center px-4">
                    Predictive insights, market trends, and data-driven recommendations for
                    smarter decisions.
                  </p>
                </div>
              </div>

              {/* Bottom-middle small card */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm group cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl">
                <img
                  src={byproductImg}
                  alt="By-product Monetization"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/55 transition-colors duration-300" />
                <div className="relative z-10 flex h-full items-center justify-center p-4 text-center text-white">
                  <p className="font-mont font-semibold text-sm md:text-base group-hover:opacity-0 transition-opacity duration-300">
                    By-product
                    <br />
                    Monetization
                  </p>
                  <p className="font-mont text-xs md:text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0 flex items-center justify-center px-4">
                    Turn waste into revenue streams. Access markets for husks, shells, and
                    other by-products.
                  </p>
                </div>
              </div>
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
<section className="w-full bg-[#f9faf7] py-16 px-6 md:px-12 lg:px-20">
  <div className="max-w-6xl mx-auto">

    {/* Heading Row */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
      <div>
        {/* small label */}
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#ece7e1] text-[11px] font-mont tracking-wide uppercase text-[#6b3f23]">
          News & Insights
        </span>

        <h2 className="font-mont font-bold text-3xl md:text-4xl text-[#2f3e46] mt-3">
          Latest Updates & News
        </h2>
        <p className="font-mont text-[#5d4037] text-base md:text-lg mt-2">
          Stay informed about coconut industry trends, platform updates, and community milestones.
        </p>
      </div>

      {/* View All Button */}
      <button className="font-mont text-sm px-6 py-2.5 rounded-full border border-[#d8cfc8] bg-[#ece7e1] text-[#2f3e46] hover:bg-[#e0d9d2] transition shadow-sm flex items-center gap-2 self-start md:self-auto">
        View All News
        <span className="text-lg leading-none">↗</span>
      </button>
    </div>

    {/* News Cards */}
    <div className="grid md:grid-cols-3 gap-6">

      {/* Card 1 */}
      <article className="border border-[#e0d9d2] rounded-2xl p-5 md:p-6 bg-white hover:bg-[#ece7e1] hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        <div>
          <p className="font-mont text-[11px] uppercase tracking-[0.12em] text-[#6b3f23] mb-2">
            Nov 2025 · Platform Update
          </p>
          <h3 className="font-mont font-semibold text-lg md:text-xl text-[#2f3e46] mb-2">
            CocoConnect beta marketplace goes live for early users
          </h3>
          <p className="font-mont text-[#5d4037] text-sm leading-relaxed">
            Early access users can now list coconut products, explore suppliers, and try investment simulations inside the platform.
          </p>
        </div>
        <button className="mt-4 font-mont text-xs md:text-sm text-[#4caf50] hover:text-[#66bb6a] inline-flex items-center gap-1">
          Read more <span className="text-base leading-none">→</span>
        </button>
      </article>

      {/* Card 2 */}
      <article className="border border-[#e0d9d2] rounded-2xl p-5 md:p-6 bg-white hover:bg-[#ece7e1] hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        <div>
          <p className="font-mont text-[11px] uppercase tracking-[0.12em] text-[#6b3f23] mb-2">
            Oct 2025 · Industry Insight
          </p>
          <h3 className="font-mont font-semibold text-lg md:text-xl text-[#2f3e46] mb-2">
            Growing demand for value-added coconut by-products
          </h3>
          <p className="font-mont text-[#5d4037] text-sm leading-relaxed">
            A rising global market for eco-friendly coir, fiber, and shell-based products is creating new export pathways.
          </p>
        </div>
        <button className="mt-4 font-mont text-xs md:text-sm text-[#4caf50] hover:text-[#66bb6a] inline-flex items-center gap-1">
          Read more <span className="text-base leading-none">→</span>
        </button>
      </article>

      {/* Card 3 */}
      <article className="border border-[#e0d9d2] rounded-2xl p-5 md:p-6 bg-white hover:bg-[#ece7e1] hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        <div>
          <p className="font-mont text-[11px] uppercase tracking-[0.12em] text-[#6b3f23] mb-2">
            Sep 2025 · Community
          </p>
          <h3 className="font-mont font-semibold text-lg md:text-xl text-[#2f3e46] mb-2">
            Farmer–investor collaboration pilots launched
          </h3>
          <p className="font-mont text-[#5d4037] text-sm leading-relaxed">
            Selected farmers and investors are testing blockchain-based agreements to support sustainable coconut farming.
          </p>
        </div>
        <button className="mt-4 font-mont text-xs md:text-sm text-[#4caf50] hover:text-[#66bb6a] inline-flex items-center gap-1">
          Read more <span className="text-base leading-none">→</span>
        </button>
      </article>

    </div>
  </div>
</section>



        {/* FAQ SECTION */}
        <section className="w-full bg-[#f5f7fa] py-16 px-6 md:px-12 lg:px-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-mont font-bold text-3xl md:text-4xl text-gray-900">
                Frequently Asked Questions
              </h2>
              <p className="font-mont text-gray-600 text-base md:text-lg mt-3">
                Find quick answers about how CocoConnect works.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                  <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between px-6 py-5"
                    >
                      <span className="font-mont font-semibold text-gray-900 text-base">
                        {item.question}
                      </span>

                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <div
                      className={`px-6 pb-5 text-gray-700 text-sm md:text-base font-mont transition-all duration-200 overflow-hidden ${
                        isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="pt-1 leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

    </div>
  );
}
