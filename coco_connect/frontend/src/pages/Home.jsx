// 1. IMPORTS 
import { useState, useEffect } from "react";
import aboutVideo from "../assets/about-video.mp4";
import directImg from "../assets/feature_1.png";
import investImg from "../assets/feature_2.png";
import blockchainImg from "../assets/feature_3.png";
import aiImg from "../assets/feature_4.png";
import byproductImg from "../assets/feature_5.png";

import prod1 from "../assets/prod_1.png"; // Coconut Oil
import prod2 from "../assets/prod_2.png"; // Coconut Milk / DC / Water
import prod3 from "../assets/prod_3.png"; // Coir / Husk / Shell products
import prod4 from "../assets/prod_4.png";
import prod5 from "../assets/prod_5.png";
import prod6 from "../assets/prod_6.png";

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
      answer:
        "CocoConnect is a smart digital ecosystem that connects coconut farmers, landowners, investors, distributors and buyers on one platform to trade, invest and collaborate transparently.",
    },
    {
      question: "Who can use the platform?",
      answer:
        "Coconut farmers, landowners, processors, distributors, exporters, investors and customers who want verified coconut products from Sri Lanka can all join and use CocoConnect.",
    },
    {
      question: "How do investments work on CocoConnect?",
      answer:
        "Project owners can list coconut-related projects with funding needs and expected returns. Investors can fund these projects and track performance and revenue sharing through smart contracts.",
    },
    {
      question: "Why does CocoConnect use blockchain?",
      answer:
        "Blockchain records key transactions and agreements in a tamper-proof way. It builds trust, ensures transparent profit sharing and gives traceability across the coconut supply chain.",
    },
    {
      question: "How does AI help me?",
      answer:
        "AI modules provide price predictions, demand trends and recommendations so you can make data-driven decisions on trading, investing and production planning.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);
  const toggleFAQ = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const bestSellingProducts = [
    {
      id: 1,
      name: "Premium Cold-Pressed Coconut Oil",
      description: "750ml • First extraction • Unrefined • Home & export grade",
      price: "Rs. 1,250.00",
      image: prod1,
    },
    {
      id: 2,
      name: "Desiccated Coconut (Fine Cut)",
      description: "500g • Food-grade • Ideal for bakeries & sweets",
      price: "Rs. 480.00",
      image: prod2,
    },
    {
      id: 3,
      name: "Coconut Milk Pack",
      description: "1L • Rich & creamy • Ready-to-use for cooking",
      price: "Rs. 560.00",
      image: prod3,
    },
    {
      id: 4,
      name: "Handwoven Coir Doormat",
      description: "60 x 90 cm • Natural fiber • Durable & eco-friendly",
      price: "Rs. 1,900.00",
      image: prod4,
    },
    {
      id: 5,
      name: "Coconut Shell Handicraft Set",
      description: "Bowls & spoons • Polished finish • Gift-ready",
      price: "Rs. 2,450.00",
      image: prod5,
    },
    {
      id: 6,
      name: "Cocopeat Grow Blocks",
      description: "5kg • For home gardening & nurseries",
      price: "Rs. 920.00",
      image: prod6,
    },
  ];

  const [productIndex, setProductIndex] = useState(0);
  const visibleCount = 3;
  const totalProducts = bestSellingProducts.length;

  // create looped list so we can wrap around
  const extendedProducts = [...bestSellingProducts, ...bestSellingProducts];
  const visibleProducts = extendedProducts.slice(
    productIndex,
    productIndex + visibleCount
  );

  const nextProducts = () => {
    setProductIndex((prev) => (prev + visibleCount) % totalProducts);
  };

  const prevProducts = () => {
    setProductIndex((prev) => (prev - visibleCount + totalProducts) % totalProducts);
  };

  const FloatingByproducts = () => {
    const items = ["🥥", "🧴", "🧺", "🪵", "🪴", "🧂"]; // coconut + byproducts

    const [shapes, setShapes] = useState(() =>
      Array.from({ length: 12 }, (_, i) => {
        const baseSpeed = 0.06 + Math.random() * 0.09; // overall movement speed
        const angle = Math.random() * Math.PI * 2;     // random direction

        return {
          id: i,
          x: Math.random() * 100,        // percentage
          y: Math.random() * 100,        // percentage
          vx: Math.cos(angle) * baseSpeed,
          vy: Math.sin(angle) * baseSpeed,
          size: 20 + Math.random() * 26, // px
          emoji: items[i % items.length],
        };
      })
    );

    useEffect(() => {
      let frameId;

      const animate = () => {
        setShapes((prev) =>
          prev.map((shape) => {
            let { x, y, vx, vy } = shape;

            // Move
            x += vx;
            y += vy;

            // Bounce horizontally
            if (x < -10 || x > 110) {
              vx = -vx;
              x = Math.max(-10, Math.min(110, x));
            }

            // Bounce vertically
            if (y < -10 || y > 110) {
              vy = -vy;
              y = Math.max(-10, Math.min(110, y));
            }

            // Slight random wobble so paths aren’t perfectly straight
            const wobble = (Math.random() - 0.5) * 0.02;
            vx += wobble;
            vy -= wobble;

            return { ...shape, x, y, vx, vy };
          })
        );

        frameId = requestAnimationFrame(animate);
      };

      frameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameId);
    }, []);

    return (
      <div className="pointer-events-none absolute inset-0 z-0">
        {shapes.map((shape) => (
          <span
            key={shape.id}
            style={{
              position: "absolute",
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              fontSize: `${shape.size}px`,
              opacity: 0.16,
              transform: "translate(-50%, -50%)",
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.18))",
            }}
          >
            {shape.emoji}
          </span>
        ))}
      </div>
    );
  };


  return (
    <div className="home-page bg-[#f9faf7]">
      {/* Hero-Section CAROUSEL */}
      <section className="relative w-full h-[380px] sm:h-[450px] md:h-[520px] lg:h-[600px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              index === current ? "opacity-100 z-20" : "opacity-0 z-10"
            }`}
          >
            <img
              src={slide.image}
              alt="hero"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4 max-w-3xl">
                <h1 className="font-mont font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[2.7rem] text-white leading-snug mb-3">
                  {slide.title}
                </h1>
                <p className="font-mont text-white/90 text-sm sm:text-base md:text-lg mb-6">
                  {slide.subtitle}
                </p>
                <button className="px-7 py-3 rounded-full bg-[#4caf50] text-white text-sm font-medium shadow hover:bg-[#66bb6a] transition">
                  {slide.buttonLabel}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#9e9e9e]/90 hover:bg-[#4caf50] text-white w-10 h-10 rounded-full shadow z-30 flex items-center justify-center text-xl"
        >
          ‹
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#9e9e9e]/90 hover:bg-[#4caf50] text-white w-10 h-10 rounded-full shadow z-30 flex items-center justify-center text-xl"
        >
          ›
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 z-30">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full transition border border-white ${
                index === current ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="w-full bg-[#ece7e1] py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          {/* LEFT TEXT */}
          <div className="md:pr-6">
            <h2 className="font-mont font-bold text-3xl md:text-4xl text-[#5d4037] mb-4">
              Explore Sri Lanka&apos;s{" "}
              <span className="text-[#66bb6a]"> Coconut Industry</span>
            </h2>

            <p className="font-mont text-[#2f3e46] text-base md:text-lg leading-relaxed mb-6 text-justify">
              CocoConnect is a simple and reliable online platform designed to support
              Sri Lanka’s coconut industry. We help farmers, producers, landowners,
              distributors, and investors connect directly, build new opportunities, and
              grow their businesses with confidence.
            </p>

            <ul className="space-y-3 font-mont text-[#2f3e46] text-base">
              <li className="flex items-center gap-2">
                <span className="text-[#8bc34a] text-xl">✔</span>
                Direct marketplace for coconut producers
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#8bc34a] text-xl">✔</span>
                Investment opportunities for coconut projects
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#8bc34a] text-xl">✔</span>
                Transparent and trustworthy trade connections
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#8bc34a] text-xl">✔</span>
                Helpful insights to understand market trends
              </li>
            </ul>

            <button className="mt-8 px-7 py-3 rounded-full bg-[#4caf50] text-white font-mont font-medium hover:bg-[#66bb6a] transition shadow">
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
      <section className="w-full bg-[#f9faf7] py-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-10">
            <h2 className="font-mont font-bold text-3xl md:text-4xl text-[#5d4037] mb-4">
              Key <span className="text-[#66bb6a]">Features</span>
            </h2>
            <p className="font-mont text-[#2f3e46] text-base md:text-lg mt-3">
              Core capabilities that power the CocoConnect ecosystem.
            </p>
          </div>

          {/* Grid */}
          <div className="grid gap-4 md:grid-cols-3 auto-rows-[minmax(200px,1fr)]">
            {/* Top-left small card */}
            <div className="relative rounded-2xl overflow-hidden border border-[#f0e9e3] shadow-sm group cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl">
              <img
                src={directImg}
                alt="Direct Marketplace"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/55 transition-colors duration-300" />
              <div className="relative z-10 flex h-full items-center justify-center p-4 text-center text-white">
                <p className="font-mont font-semibold text-sm md:text-base group-hover:opacity-0 transition-opacity duration-300">
                  Direct Marketplace
                </p>
                <p className="font-mont text-xs md:text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0 flex items-center justify-center px-4">
                  Connect directly with verified partners. No intermediaries, better
                  prices, faster deals.
                </p>
              </div>
            </div>

            {/* Top-middle small card */}
            <div className="relative rounded-2xl overflow-hidden border border-[#f0e9e3] shadow-sm group cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl">
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
                  Fund sustainable projects. Track ROI transparently with smart
                  contract automation.
                </p>
              </div>
            </div>

            {/* Right tall card */}
            <div className="relative rounded-2xl overflow-hidden border border-[#f0e9e3] shadow-sm group cursor-pointer md:row-span-2 transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl">
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
            <div className="relative rounded-2xl overflow-hidden border border-[#f0e9e3] shadow-sm group cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl">
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
            <div className="relative rounded-2xl overflow-hidden border border-[#f0e9e3] shadow-sm group cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl">
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

      {/* BEST SELLING PRODUCTS */}
      <section className="w-full bg-gradient-to-b from-white to-[#f5f3ef] py-20 px-6 md:px-12 lg:px-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header with CTA */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h2 className="font-mont font-bold text-3xl md:text-4xl text-[#5d4037] mb-4">
                Best Selling{" "}
                <span className="text-[#66bb6a]">
                  Products
                </span>
              </h2>
            </div>

            <a
              href="/shop"
              className="px-8 py-3 bg-[#4caf50] text-white font-mont font-semibold rounded-xl hover:bg-[#66bb6a] active:scale-95 transition-all duration-300 flex items-center gap-2 group shadow-md"
            >
              View All Products
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </a>
          </div>

          {/* Carousel Wrapper */}
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={prevProducts}
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#9e9e9e] text-white shadow-sm items-center justify-center hover:bg-[#4caf50] hover:shadow-md transition"
            >
              ‹
            </button>

            {/* Products Carousel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#e0d9d2] hover:-translate-y-2"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-mont font-semibold text-lg text-[#2f3e46]">
                      {product.name}
                    </h3>
                    <p className="font-mont text-[#5d4037] text-sm mt-2 mb-3 leading-relaxed">
                      {product.description}
                    </p>

                    <p className="font-mont text-[#2f3e46] text-lg font-bold mb-4">
                      {product.price}
                    </p>

                    <a
                      href="/shop"
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#4caf50] text-white font-mont text-sm font-semibold hover:bg-[#66bb6a] transition"
                    >
                      View in Shop
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextProducts}
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#9e9e9e] text-white shadow-sm items-center justify-center hover:bg-[#4caf50] hover:shadow-md transition"
            >
              ›
            </button>
          </div>

          {/* Mobile hint dots */}
          <div className="flex md:hidden justify-center gap-2 mt-6">
            <span className="w-2 h-2 rounded-full bg-[#66bb6a]" />
            <span className="w-2 h-2 rounded-full bg-[#e0d9d2]" />
            <span className="w-2 h-2 rounded-full bg-[#e0d9d2]" />
          </div>
        </div>
      </section>

      {/* INVESTMENT & INNOVATION SECTION */}
      <section className="w-full bg-gradient-to-b from-white to-[#f9faf7] py-16 px-6 md:px-12 lg:px-24 relative overflow-hidden">
        {/* coconut by-products floating in the background */}
        <FloatingByproducts />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div>
              <h2 className="font-mont font-bold text-3xl md:text-4xl text-[#5d4037] mb-4">
                Investment Highlights{" "}
                <span className="text-[#66bb6a]">&amp; Community Innovation</span>
              </h2>
              {/*<p className="font-mont text-[#5d4037] text-base md:text-lg mt-2">
                Support coconut projects, discover new opportunities, and share your own
                ideas with the CocoConnect community.
              </p>*/}
            </div>

            <a
              href="/investments"
              className="font-mont text-sm px-6 py-2.5 rounded-full bg-[#4caf50] text-white hover:bg-[#66bb6a] transition shadow-md flex items-center gap-2 self-start md:self-auto"
            >
              View All Projects
              <span className="text-lg leading-none">↗</span>
            </a>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Investment Highlights */}
            <div className="md:col-span-2 space-y-5">
              {/* Project 1 */}
              <article className="bg-white border border-[#e0d9d2] rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
                  <h3 className="font-mont font-semibold text-lg text-[#2f3e46]">
                    Organic Coconut Farm Expansion – Kurunegala
                  </h3>
                  <span className="text-xs font-mont font-semibold text-[#66bb6a] bg-[#e0f5e3] px-3 py-1 rounded-full">
                    Open for Investment
                  </span>
                </div>
                <p className="font-mont text-sm text-[#5d4037] mb-3">
                  Expanding a mid-scale organic coconut plantation with drip irrigation
                  and improved post-harvest handling.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-mont text-[#2f3e46]">
                  <span className="bg-[#f5f3ef] px-3 py-1 rounded-full">
                    Target: Rs. 2.5M
                  </span>
                  <span className="bg-[#f5f3ef] px-3 py-1 rounded-full">
                    Expected Return: 14–16% p.a.
                  </span>
                  <span className="bg-[#f5f3ef] px-3 py-1 rounded-full">
                    Duration: 3 years
                  </span>
                </div>
              </article>

              {/* Project 2 */}
              <article className="bg-white border border-[#e0d9d2] rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
                  <h3 className="font-mont font-semibold text-lg text-[#2f3e46]">
                    Value-Added Coconut Snacks – Gampaha
                  </h3>
                  <span className="text-xs font-mont font-semibold text-[#66bb6a] bg-[#e0f5e3] px-3 py-1 rounded-full">
                    Seeking Co-Investors
                  </span>
                </div>
                <p className="font-mont text-sm text-[#5d4037] mb-3">
                  Small processing unit producing baked coconut chips and coconut-based
                  snack packs for local supermarkets.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-mont text-[#2f3e46]">
                  <span className="bg-[#f5f3ef] px-3 py-1 rounded-full">
                    Target: Rs. 1.2M
                  </span>
                  <span className="bg-[#f5f3ef] px-3 py-1 rounded-full">
                    Profit Sharing: 60% (Investor) / 40% (Owner)
                  </span>
                  <span className="bg-[#f5f3ef] px-3 py-1 rounded-full">
                    Duration: 2 years
                  </span>
                </div>
              </article>
            </div>

            {/* Idea Sharing / Innovation Panel */}
            <div className="bg-white rounded-2xl border border-[#e0d9d2] shadow-md p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-mont font-bold text-xl text-[#5d4037] mb-2">
                  Share Your Idea
                </h3>
                <p className="font-mont text-sm text-[#5d4037] mb-4 leading-relaxed">
                  Have an idea to improve coconut farming, processing, marketing or
                  by-products? Share it with the CocoConnect community.
                </p>

                <ul className="font-mont text-sm text-[#2f3e46] space-y-2 mb-5">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-[#66bb6a]">•</span>
                    New product ideas (oils, handicrafts, eco-products)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-[#66bb6a]">•</span>
                    Ways to reduce waste or use by-products better
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <button className="w-full px-5 py-3 rounded-xl bg-[#4caf50] text-white font-mont font-semibold hover:bg-[#66bb6a] transition shadow-md">
                  Share Your Idea
                </button>
                <p className="font-mont text-[11px] text-[#9e9e9e] text-center">
                  Ideas can be reviewed, refined with experts, and matched with investors
                  or partners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWS SECTION */}
      <section className="w-full bg-gradient-to-b from-[#f5f3ef] to-[#ece7e1] py-16 px-6 md:px-12 lg:px-20 group relative overflow-hidden">
        {/* Soft background blobs */}
        <div className="absolute top-10 right-0 w-48 h-48 bg-[#66bb6a]/25 rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-10 left-0 w-64 h-64 bg-[#8bc34a]/25 rounded-full blur-3xl opacity-60" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Heading Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
            <div>
              <h2 className="font-mont font-bold text-3xl md:text-4xl text-[#5d4037] mb-4">
                Latest Updates <span className="text-[#66bb6a]">&amp; News</span>
              </h2>
              <p className="font-mont text-[#5d4037] text-base md:text-lg mt-2">
                Stay informed about coconut industry trends, platform updates, and
                community milestones.
              </p>
            </div>

            {/* View All Button */}
            <button className="font-mont text-sm px-6 py-2.5 rounded-full bg-[#4caf50] text-white hover:bg-[#66bb6a] transition shadow-md flex items-center gap-2 self-start md:self-auto">
              View All News
              <span className="text-lg leading-none">↗</span>
            </button>
          </div>

          {/* News Cards */}
          <div
            className="
              grid md:grid-cols-3 gap-6
              overflow-hidden
              max-h-0 opacity-0 scale-95
              transition-all duration-600 ease-out
              group-hover:max-h-[900px] group-hover:opacity-100 group-hover:scale-100 group-hover:mt-6
            "
          >
            {/* Card 1 */}
            <article className="border border-[#d9d2c8] rounded-2xl p-5 md:p-6 bg-gradient-to-br from-white to-[#f0e9e3] hover:from-[#e5f7eb] hover:to-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <p className="font-mont text-[11px] uppercase tracking-[0.12em] text-[#6b3f23] mb-2">
                  Nov 2025 · Platform Update
                </p>
                <h3 className="font-mont font-semibold text-lg md:text-xl text-[#2f3e46] mb-2">
                  CocoConnect beta marketplace goes live for early users
                </h3>
                <p className="font-mont text-[#5d4037] text-sm leading-relaxed">
                  Early access users can now list coconut products, explore suppliers, and
                  try investment simulations inside the platform.
                </p>
              </div>
              <button className="mt-4 font-mont text-xs md:text-sm text-[#4caf50] hover:text-[#66bb6a] inline-flex items-center gap-1">
                Read more <span className="text-base leading-none">→</span>
              </button>
            </article>

            {/* Card 2 */}
            <article className="border border-[#dcd3cc] rounded-2xl p-5 md:p-6 bg-gradient-to-br from-white to-[#f5ebe3] hover:from-[#e8f7e8] hover:to-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <p className="font-mont text-[11px] uppercase tracking-[0.12em] text-[#6b3f23] mb-2">
                  Oct 2025 · Industry Insight
                </p>
                <h3 className="font-mont font-semibold text-lg md:text-xl text-[#2f3e46] mb-2">
                  Growing demand for value-added coconut by-products
                </h3>
                <p className="font-mont text-[#5d4037] text-sm leading-relaxed">
                  A rising global market for eco-friendly coir, fiber, and shell-based
                  products is creating new export pathways.
                </p>
              </div>
              <button className="mt-4 font-mont text-xs md:text-sm text-[#4caf50] hover:text-[#66bb6a] inline-flex items-center gap-1">
                Read more <span className="text-base leading-none">→</span>
              </button>
            </article>

            {/* Card 3 */}
            <article className="border border-[#dcd3cc] rounded-2xl p-5 md:p-6 bg-gradient-to-br from-white to-[#f3ebe5] hover:from-[#eaf8e5] hover:to-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <p className="font-mont text-[11px] uppercase tracking-[0.12em] text-[#6b3f23] mb-2">
                  Sep 2025 · Community
                </p>
                <h3 className="font-mont font-semibold text-lg md:text-xl text-[#2f3e46] mb-2">
                  Farmer–investor collaboration pilots launched
                </h3>
                <p className="font-mont text-[#5d4037] text-sm leading-relaxed">
                  Selected farmers and investors are testing transparent agreements to
                  support sustainable coconut farming.
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
      <section className="w-full bg-[#f9faf7] py-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-mont font-bold text-3xl md:text-4xl text-[#5d4037]">
              Frequently Asked{" "}
              <span className="text-[#66bb6a]">Questions</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between px-6 py-5"
                  >
                    <span className="font-mont font-semibold text-[#2f3e46] text-base">
                      {item.question}
                    </span>

                    <svg
                      className={`w-5 h-5 text-[#9e9e9e] transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <div
                    className={`px-6 pb-5 text-[#5d4037] text-sm md:text-base font-mont transition-all duration-200 overflow-hidden ${
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
