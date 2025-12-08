import React from 'react';

// Icon components for better maintainability and performance
const Icon = {
  Lightning: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
};

// Data constants for better maintainability
const MISSION_ITEMS = [
  {
    icon: <Icon.Lightning />,
    bgColor: "bg-secondary",
    title: "Digital Transformation",
    description: "To revolutionize Sri Lanka's coconut industry by creating a comprehensive digital platform that connects every stakeholder in the value chain."
  },
  {
    icon: <Icon.Refresh />,
    bgColor: "bg-accent1",
    title: "Empowerment & Sustainability",
    description: "Empower local farmers through technology, promote sustainable practices, and maximize the value of every part of the coconut tree."
  },
  {
    icon: <Icon.Shield />,
    bgColor: "bg-primary",
    title: "Global Marketplace",
    description: "To establish Sri Lanka as the world's premier coconut products hub by connecting local producers directly with international markets."
  },
  {
    icon: <Icon.Users />,
    bgColor: "bg-accent2",
    title: "Innovation & Growth",
    description: "Foster innovation in coconut product development while creating new economic opportunities and ensuring fair compensation across the supply chain."
  }
];

const TRADITIONAL_VS_NEW = [
  "Fragmented markets → Unified global platform",
  "Manual processes → Digital ecosystem",
  "Limited transparency → Blockchain verification",
  "Local-only reach → International marketplace",
  "Separate stakeholders → Connected community"
];

const COCONUT_PRODUCTS = [
  { name: "Coconut Water", color: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", description: "Nature's sports drink" },
  { name: "Coconut Oil", color: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", description: "Health & beauty essential" },
  { name: "Coir Fiber", color: "bg-pink-50", text: "text-amber-700", border: "border-amber-200", description: "Sustainable textiles" },
  { name: "Coconut Shell", color: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", description: "Eco-friendly crafts" },
  { name: "Coconut Husk", color: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", description: "Organic fertilizer" },
  { name: "Coconut Timber", color: "bg-green-50", text: "text-green-700", border: "border-green-200", description: "Durable construction" },
  { name: "Coconut Leaves", color: "bg-lime-50", text: "text-lime-700", border: "border-lime-200", description: "Traditional roofing" },
  { name: "Coconut Roots", color: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", description: "Medicinal properties" }
];

const HOW_IT_WORKS = [
  { number: "01", title: "Connect", description: "Farmers list their products, investors find projects, and buyers discover quality coconut products - all in one place." },
  { number: "02", title: "Trade", description: "Secure transactions through blockchain smart contracts ensure fairness and transparency for every trade." },
  { number: "03", title: "Grow", description: "Track investments, monitor production, and expand businesses with data-driven insights and global market access." }
];

const About = () => {
  const handleExploreMarketplace = () => {
    // Navigation logic would go here
    console.log("Navigate to marketplace");
  };

  const handleLearnHowToJoin = () => {
    // Navigation logic would go here
    console.log("Navigate to join page");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent5 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-coco mb-6 font-logo tracking-wide">
            ABOUT <span className="text-connect">CocoConnect</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto font-nunito leading-relaxed">
            Bridging Tradition with Technology for a Sustainable Coconut Ecosystem
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16 bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-12 transition-shadow hover:shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center font-mont">
            Our Mission & Vision
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {MISSION_ITEMS.map((item, index) => (
              <div 
                key={index} 
                className="flex items-start group cursor-pointer transform transition-transform hover:scale-[1.02]"
                role="article"
                aria-label={`Mission: ${item.title}`}
              >
                <div className={`flex-shrink-0 ${item.bgColor} text-white rounded-full p-3 mr-4 transition-transform group-hover:rotate-12`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-accent6 mb-2 font-mont">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 font-nunito leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Vision Statement */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl md:text-2xl font-bold text-primary mb-4 text-center font-mont">
              Our Vision
            </h3>
            <p className="text-base md:text-lg text-gray-700 text-center max-w-4xl mx-auto font-nunito leading-relaxed">
              To be the world's leading digital ecosystem for coconut products, where technology bridges the gap between traditional agriculture and modern commerce, 
              creating sustainable livelihoods for farmers and delivering premium quality products to global consumers.
            </p>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center font-mont">
            Why CocoConnect Matters
          </h2>
          
          <div className="bg-gradient-to-r from-accent5 to-white rounded-2xl p-6 md:p-8 border-2 border-secondary/20">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-accent6 mb-4 font-mont">
                  The Current Challenge
                </h3>
                <p className="text-gray-700 mb-4 font-nunito leading-relaxed">
                  Today, coconut products are scattered across different markets without unified representation. Despite the incredible value of every part of the coconut tree - from its nutritious water to versatile fibers - there's no centralized platform showcasing this potential to the world.
                </p>
                <p className="text-gray-700 font-nunito leading-relaxed">
                  Farmers struggle to find fair markets, investors miss sustainable opportunities, and the world remains unaware of the complete value chain that coconut offers.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h4 className="text-lg md:text-xl font-bold text-primary mb-4 font-mont">
                  Traditional vs CocoConnect
                </h4>
                <ul className="space-y-3">
                  {TRADITIONAL_VS_NEW.map((item, index) => (
                    <li 
                      key={index} 
                      className="flex items-center font-nunito transform transition-transform hover:translate-x-2"
                    >
                      <span className="text-secondary mr-3">
                        <Icon.Check />
                      </span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Coconut Tree Value Section */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center font-mont">
            The Complete Coconut Tree Value
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {COCONUT_PRODUCTS.map((product, index) => (
              <div 
                key={index} 
                className={`${product.color} ${product.text} border ${product.border} rounded-xl p-4 md:p-5 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer`}
                role="article"
                aria-label={`Coconut product: ${product.name}`}
              >
                <div className="font-bold text-base md:text-lg mb-2 font-mont">
                  {product.name}
                </div>
                <p className="text-sm opacity-75 font-nunito">
                  {product.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Solution Section */}
        <section className="mb-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 md:p-8 lg:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center font-mont">
            How CocoConnect Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {HOW_IT_WORKS.map((step, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-lg text-center transform transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]"
                role="article"
                aria-label={`Step ${step.number}: ${step.title}`}
              >
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-4 font-logo">
                  {step.number}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-accent6 mb-3 font-mont">
                  {step.title}
                </h3>
                <p className="text-gray-600 font-nunito leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-coco text-white rounded-2xl p-8 md:p-10 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 font-mont">
            Join the Coconut Revolution
          </h2>
          <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto font-nunito leading-relaxed">
            Whether you're a farmer with a harvest, an investor seeking sustainable opportunities, or a buyer looking for authentic coconut products - CocoConnect is your gateway to a smarter, fairer coconut ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleExploreMarketplace}
              className="bg-secondary hover:bg-green-600 text-white font-bold py-3 px-6 md:px-8 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary font-mont"
              aria-label="Explore Marketplace"
            >
              Explore Marketplace
            </button>
            <button 
              onClick={handleLearnHowToJoin}
              className="bg-transparent hover:bg-white/20 text-white border-2 border-white font-bold py-3 px-6 md:px-8 rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white font-mont"
              aria-label="Learn How to Join"
            >
              Learn How to Join
            </button>
          </div>
        </section>

        {/* Quote Section */}
        <section className="mt-16 text-center animate-fade-in">
          <div className="text-5xl md:text-6xl text-secondary mb-4" aria-hidden="true">"</div>
          <blockquote>
            <p className="text-lg md:text-2xl italic text-gray-700 max-w-3xl mx-auto mb-6 font-nunito leading-relaxed">
              The coconut tree is not just a plant - it's life, livelihood, and legacy. 
              We're here to honor its complete value and connect it with the world it deserves.
            </p>
            <footer className="text-base md:text-lg font-bold text-primary font-mont">
              - The CocoConnect Team
            </footer>
          </blockquote>
        </section>
      </div>
    </div>
  );
};


export default About;