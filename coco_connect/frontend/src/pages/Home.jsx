import { useState, useEffect } from "react";

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
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const goToNext = () => setCurrent((prev) => (prev + 1) % slides.length);
  const goToPrev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="home-page">

      {/* Hero-Section CAROUSEL */}
      <section className="relative w-full h-[380px] sm:h-[450px] md:h-[520px] lg:h-[600px] overflow-hidden">

        {slides.map((slide, index) => (
          <div  key={slide.id}  className={`absolute inset-0 transition-opacity duration-700 ease-out ${    index === current ? "opacity-100 z-20" : "opacity-0 z-10"  }`}>
            {/* Full-width background image */}
            <img  src={slide.image}   alt="hero"   className="w-full h-full object-cover"  />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Overlay text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4 max-w-3xl">
                <h1 className="font-mont font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[2.7rem]  text-white leading-snug mb-3">
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
        <button  onClick={goToPrev}  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-900 w-10 h-10 rounded-full shadow z-30 flex items-center justify-center text-xl"  >  ‹  </button>
        <button   onClick={goToNext}  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-900 w-10 h-10 rounded-full shadow z-30 flex items-center justify-center text-xl"  >  › </button>

        {/* Dots */}
        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 z-30">
          {slides.map((_, index) => (
            <button  key={index}  onClick={() => setCurrent(index)}  className={`w-3 h-3 rounded-full transition border border-white ${  index === current ? "bg-white" : "bg-white/30"  }`}  />
          ))}
        </div>
      </section>

      {/* ABOUT */}
      
      {/* FEATURES */}
      {/* MARKETPLACE */}
      {/* COMMUNITY */}
      {/* NEWS */}

    </div>
  );
}
