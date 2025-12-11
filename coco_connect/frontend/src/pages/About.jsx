import React, { useState, useMemo, lazy, Suspense } from 'react';

// Lazy load images for better performance
const imageImports = {
  coconutWater: () => import("../assets/coconutWater.jpg"),
  coconutOil: () => import("../assets/coconutOil.jpg"),
  coirFiber: () => import("../assets/coirFiber.jpg"),
  coconutShell: () => import("../assets/coconutShell.jpg"),
  coconutHusk: () => import("../assets/coconutHusk.jpg"),
  coconutTimber: () => import("../assets/coconutTimber.jpg"),
  coconutLeaves: () => import("../assets/coconutLeaves.jpg"),
  coconutRoots: () => import("../assets/coconutRoots.jpg"),
  missionImage: () => import("../assets/missionImage.jpg"),
  heroImage: () => import("../assets/heroImage.jpg"),
  connectImage: () => import("../assets/connectImage.jpg"),
  tradeImage: () => import("../assets/tradeImage.jpg"),
  growImage: () => import("../assets/growImage.jpg"),
};

// Image fallback URLs
const IMAGE_FALLBACKS = {
  coconutTree: "https://images.unsplash.com/photo-1622191214292-50b22b7c8da5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  coconutHarvest: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
};

// Team member fallback images using DiceBear API for consistent avatars
const TEAM_AVATARS = {
  teamMember1: `https://api.dicebear.com/7.x/avataaars/svg?seed=Vorandi&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9`,
  teamMember2: `https://api.dicebear.com/7.x/avataaars/svg?seed=Niven&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9`,
  teamMember3: `https://api.dicebear.com/7.x/avataaars/svg?seed=Wickramarathne&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9`,
  teamMember4: `https://api.dicebear.com/7.x/avataaars/svg?seed=Hasaranga&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9`,
  teamMember5: `https://api.dicebear.com/7.x/avataaars/svg?seed=Sithumi&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9`,
};

// Optimized Icon components with proper ARIA labels
const Icon = {
  Lightning: ({ ariaLabel = "Digital Transformation Icon" }) => (
    <svg 
      className="w-6 h-6" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      role="img"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Refresh: ({ ariaLabel = "Sustainability Icon" }) => (
    <svg 
      className="w-6 h-6" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      role="img"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3" />
    </svg>
  ),
  Shield: ({ ariaLabel = "Security Icon" }) => (
    <svg 
      className="w-6 h-6" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      role="img"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Users: ({ ariaLabel = "Community Icon" }) => (
    <svg 
      className="w-6 h-6" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      role="img"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Check: ({ ariaLabel = "Check Icon", className = "w-5 h-5" }) => (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      role="img"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Team: ({ ariaLabel = "Team Icon" }) => (
    <svg 
      className="w-6 h-6" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label={ariaLabel}
      role="img"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

// Custom hooks for better state management
const useImageLoader = (src, fallback) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        if (typeof src === 'function') {
          const module = await src();
          setImageSrc(module.default);
        } else {
          setImageSrc(src);
        }
        setError(false);
      } catch (err) {
        console.error('Failed to load image:', err);
        setError(true);
        setImageSrc(fallback);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [src, fallback]);

  return { imageSrc, loading, error };
};

// Optimized Image component
const OptimizedImage = ({ 
  src, 
  alt, 
  fallback = IMAGE_FALLBACKS.coconutTree, 
  className = "", 
  ...props 
}) => {
  const { imageSrc, loading, error } = useImageLoader(src, fallback);

  return (
    <img
      src={imageSrc || fallback}
      alt={alt}
      className={`${className} ${loading ? 'animate-pulse bg-gray-200' : ''}`}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        if (!error) {
          e.target.src = fallback;
        }
      }}
      {...props}
    />
  );
};

// Component for mission items
const MissionItem = ({ icon, bgColor, title, description, index }) => (
  <div
    className="flex items-start group cursor-pointer transition-all duration-300 hover:-translate-y-1"
    role="article"
    aria-label={`Mission ${index + 1}: ${title}`}
  >
    <div
      className={`flex-shrink-0 ${bgColor} text-white rounded-2xl p-3 mr-4 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
      aria-hidden="true"
    >
      {icon}
    </div>
    <div>
      <h4 className="text-xl md:text-2xl font-bold mb-1 font-mont">
        {title}
      </h4>
      <p className="text-white/85 font-nunito leading-relaxed text-base">
        {description}
      </p>
    </div>
  </div>
);

// Component for team member cards
const TeamMemberCard = ({ 
  member, 
  index, 
  isHovered, 
  onMouseEnter, 
  onMouseLeave 
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => onMouseEnter(index)}
      onMouseLeave={onMouseLeave}
      onFocus={() => onMouseEnter(index)}
      onBlur={onMouseLeave}
      tabIndex={0}
      role="article"
      aria-label={`Team member: ${member.name}, ${member.role}`}
    >
      <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer text-center group h-full flex flex-col focus:outline-none focus:ring-2 focus:ring-secondary">
        <div className="mb-4 flex-shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-4 border-secondary/20 shadow-md group-hover:border-secondary/40 transition-colors duration-300">
            <img
              src={imgError ? TEAM_AVATARS[`teamMember${index + 1}`] : member.image}
              alt={`${member.name}, ${member.role}`}
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          </div>
        </div>
        
        <div className="flex-grow">
          <h3 className="font-bold text-lg text-accent6 font-mont mb-1">
            {member.name}
          </h3>
          <p className="text-sm text-secondary font-semibold font-nunito mb-3">
            {member.role}
          </p>
          <div className="text-xs text-gray-500 font-nunito italic mt-auto">
            Hover or focus for details
          </div>
        </div>
      </div>
      
      {isHovered && (
        <div 
          className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-80 bg-white rounded-xl shadow-2xl p-5 border border-gray-200 animate-scale-in"
          role="tooltip"
          aria-live="polite"
        >
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 rotate-45 w-6 h-6 bg-white border-r border-b border-gray-200"></div>
          
          <div className="flex items-start mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
              <img
                src={imgError ? TEAM_AVATARS[`teamMember${index + 1}`] : member.image}
                alt={member.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <h4 className="font-bold text-lg text-primary mb-0.5 font-mont">
                {member.name}
              </h4>
              <p className="text-sm font-bold text-secondary font-nunito">
                {member.position}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 font-nunito leading-relaxed">
            {member.details}
          </p>
        </div>
      )}
    </div>
  );
};

// Data constants
const MISSION_ITEMS = [
  {
    icon: <Icon.Lightning ariaLabel="Digital Transformation" />,
    bgColor: "bg-secondary",
    title: "Digital Transformation",
    description: "To revolutionize Sri Lanka's coconut industry by creating a comprehensive digital platform that connects every stakeholder in the value chain."
  },
  {
    icon: <Icon.Refresh ariaLabel="Sustainability" />,
    bgColor: "bg-accent1",
    title: "Empowerment & Sustainability",
    description: "Empower local farmers through technology, promote sustainable practices, and maximize the value of every part of the coconut tree."
  },
  {
    icon: <Icon.Shield ariaLabel="Global Marketplace" />,
    bgColor: "bg-primary",
    title: "Global Marketplace",
    description: "To establish Sri Lanka as the world's premier coconut products hub by connecting local producers directly with international markets."
  },
  {
    icon: <Icon.Users ariaLabel="Innovation" />,
    bgColor: "bg-accent2",
    title: "Innovation & Growth",
    description: "Foster innovation in coconut product development while creating new economic opportunities and ensuring fair compensation across the supply chain."
  }
];

const COCONUT_PRODUCTS = [
  { 
    name: "Coconut Water", 
    color: "bg-blue-50", 
    text: "text-blue-700", 
    border: "border-blue-200", 
    description: "Nature's sports drink", 
    image: imageImports.coconutWater 
  },
  { 
    name: "Coconut Oil", 
    color: "bg-yellow-50", 
    text: "text-yellow-700", 
    border: "border-yellow-200", 
    description: "Health & beauty essential", 
    image: imageImports.coconutOil 
  },
  { 
    name: "Coir Fiber", 
    color: "bg-amber-50", 
    text: "text-amber-700", 
    border: "border-amber-200", 
    description: "Sustainable textiles", 
    image: imageImports.coirFiber 
  },
  { 
    name: "Coconut Shell", 
    color: "bg-pink-50", 
    text: "text-pink-700", 
    border: "border-pink-200", 
    description: "Eco-friendly crafts", 
    image: imageImports.coconutShell 
  },
  { 
    name: "Coconut Husk", 
    color: "bg-orange-50", 
    text: "text-orange-700", 
    border: "border-orange-200", 
    description: "Organic fertilizer", 
    image: imageImports.coconutHusk 
  },
  { 
    name: "Coconut Timber", 
    color: "bg-green-50", 
    text: "text-green-700", 
    border: "border-green-200", 
    description: "Durable construction", 
    image: imageImports.coconutTimber 
  },
  { 
    name: "Coconut Leaves", 
    color: "bg-lime-50", 
    text: "text-lime-700", 
    border: "border-lime-200", 
    description: "Traditional roofing", 
    image: imageImports.coconutLeaves 
  },
  { 
    name: "Coconut Roots", 
    color: "bg-amber-50", 
    text: "text-amber-700", 
    border: "border-amber-200", 
    description: "Medicinal properties", 
    image: imageImports.coconutRoots 
  }
];

const HOW_IT_WORKS = [
  { 
    number: "01", 
    title: "Connect", 
    description: "Farmers list their products, investors find projects, and buyers discover quality coconut products - all in one place.",
    image: imageImports.connectImage 
  },
  { 
    number: "02", 
    title: "Trade", 
    description: "Secure transactions through blockchain smart contracts ensure fairness and transparency for every trade.",
    image: imageImports.tradeImage 
  },
  { 
    number: "03", 
    title: "Grow", 
    description: "Track investments, monitor production, and expand businesses with data-driven insights and global market access.",
    image: imageImports.growImage 
  }
];

const TEAM_MEMBERS = [
  { 
    name: "Vorandi Sakithma", 
    role: "Team Leader", 
    position: "Full-Stack Developer & Project Manager",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    details: "Leads project coordination, oversees technical implementation with expertise in blockchain integration and system architecture. Manages team workflow and client communications."
  },
  { 
    name: "Niven Asmitha", 
    role: "Team Member", 
    position: "Backend Developer & Database Architect",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    details: "Specializes in PostgreSQL database design, API development, and ensuring system scalability and data integrity. Implements secure backend services."
  },
  { 
    name: "K.Wickramarathne", 
    role: "Team Member", 
    position: "Frontend Developer & UI/UX Designer",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    details: "Creates intuitive user interfaces with React.js and Tailwind CSS, focusing on multi-language support and responsive design. Ensures optimal user experience."
  },
  { 
    name: "S.Hasaranga", 
    role: "Team Member", 
    position: "Business Analyst & Testing Specialist",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    details: "Analyzes user requirements, conducts comprehensive testing, and ensures the platform meets industry stakeholder needs. Performs quality assurance."
  },
  { 
    name: "Sithumi Nimnadi", 
    role: "Team Member", 
    position: "Documentation & Security Specialist",
    image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    details: "Manages project documentation, user manuals, and implements security protocols including authentication and data protection systems."
  }
];

const About = () => {
  const [hoveredMember, setHoveredMember] = useState(null);

  // Memoize expensive calculations
  const processedTeamMembers = useMemo(() => 
    TEAM_MEMBERS.map((member, index) => ({
      ...member,
      id: `member-${index}`,
      avatar: TEAM_AVATARS[`teamMember${index + 1}`]
    }))
  , []);

  const handleExploreMarketplace = () => {
    // In a real app, this would navigate to marketplace
    console.log("Navigate to marketplace");
    // Example: navigate('/marketplace');
  };

  const handleLearnHowToJoin = () => {
    // In a real app, this would navigate to join page
    console.log("Navigate to join page");
    // Example: navigate('/join');
  };

  // Keyboard navigation for team members
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setHoveredMember(hoveredMember === index ? null : index);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-accent5 to-white py-12 px-4 sm:px-6 lg:px-8"
      role="main"
      aria-label="About CocoConnect"
    >
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section 
          className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[80vh] overflow-hidden mb-16"
          role="banner"
          aria-label="CocoConnect Hero Section"
        >
          <OptimizedImage 
            src={imageImports.heroImage}
            fallback={IMAGE_FALLBACKS.coconutTree}
            className="absolute w-full h-full inset-0 object-cover brightness-75"
            alt="Coconut plantation background"
          />
          
          <div className="absolute inset-0 bg-black/40" aria-hidden="true"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white font-logo">
              ABOUT <span className="text-connect">COCOCONNECT</span>
            </h1>
            
            <p className="mt-10 max-w-3xl text-lg md:text-2xl italic text-white/90 leading-relaxed">
              The coconut tree is not just a plant – it's life, livelihood, and legacy.
              We're here to honor its complete value and connect it with the world it deserves.
            </p>
            
            <p className="text-lg md:text-xl text-connect font-bold mt-4">
              – The CocoConnect Team
            </p>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section 
          className="mb-20 relative rounded-3xl shadow-2xl overflow-hidden"
          role="region"
          aria-label="Mission and Vision"
        >
          <div className="absolute inset-0 z-0">
            <OptimizedImage
              src={imageImports.missionImage}
              fallback={IMAGE_FALLBACKS.coconutTree}
              alt="Coconut farming background"
              className="w-full h-full object-cover scale-105 transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
          </div>
          
          <div className="relative z-10 p-6 md:p-10 lg:p-14 text-white">
            <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
              {/* Mission */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 font-mont tracking-wide drop-shadow-2xl">
                  Our Mission
                </h2>
                
                <div className="grid gap-7" role="list" aria-label="Mission items">
                  {MISSION_ITEMS.map((item, index) => (
                    <MissionItem key={index} {...item} index={index} />
                  ))}
                </div>
              </div>
              
              {/* Vision */}
              <div 
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:bg-white/20 transition duration-300"
                role="complementary"
                aria-label="Our Vision"
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-6 font-mont flex items-center gap-3 tracking-wide drop-shadow-xl">
                  Our Vision
                </h3>
                
                <p className="text-white/90 font-nunito leading-relaxed text-lg mb-6">
                  To be the world's leading digital ecosystem for coconut products,
                  bridging the gap between traditional agriculture and modern commerce.
                </p>
                
                <ul className="space-y-5" role="list" aria-label="Vision points">
                  {[
                    "Creating sustainable livelihoods for farmers",
                    "Delivering premium quality products to global consumers",
                    "Fostering innovation in coconut product development",
                    "Ensuring fair compensation across the supply chain",
                  ].map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-400 mr-3 mt-1 transition-transform duration-300 hover:scale-125">
                        <Icon.Check ariaLabel="Vision point" className="w-6 h-6" />
                      </span>
                      <span className="text-white/90 font-nunito text-lg leading-snug">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section 
          className="mb-16"
          role="region"
          aria-label="Why CocoConnect Matters"
        >
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
                  Today, coconut products are scattered across different markets without unified representation. 
                  Despite the incredible value of every part of the coconut tree - from its nutritious water to versatile fibers - 
                  there's no centralized platform showcasing this potential to the world.
                </p>
                <p className="text-gray-700 font-nunito leading-relaxed">
                  Farmers struggle to find fair markets, investors miss sustainable opportunities, 
                  and the world remains unaware of the complete value chain that coconut offers.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h4 className="text-lg md:text-xl font-bold text-primary mb-4 font-mont">
                  Traditional vs CocoConnect
                </h4>
                <ul className="space-y-3" role="list" aria-label="Comparison points">
                  {[
                    "Fragmented markets → Unified global platform",
                    "Manual processes → Digital ecosystem",
                    "Limited transparency → Blockchain verification",
                    "Local-only reach → International marketplace",
                    "Separate stakeholders → Connected community"
                  ].map((item, index) => (
                    <li 
                      key={index} 
                      className="flex items-center font-nunito transform transition-transform hover:translate-x-2"
                    >
                      <span className="text-secondary mr-3">
                        <Icon.Check ariaLabel="Check" />
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
        <section 
          className="mb-16"
          role="region"
          aria-label="Coconut Tree Value"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center font-mont">
            The Complete Coconut Tree Value
          </h2>
          
          <p className="text-gray-600 mb-8 text-center text-xl font-nunito italic">
            Every part of the coconut tree has value - from the refreshing water to the sturdy timber and medicinal roots.
          </p>
          
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            role="list"
            aria-label="Coconut products"
          >
            {COCONUT_PRODUCTS.map((product, index) => (
              <div 
                key={index} 
                className={`${product.color} ${product.text} border ${product.border} rounded-xl p-4 md:p-5 transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-secondary`}
                role="listitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Handle product click
                    console.log(`Selected ${product.name}`);
                  }
                }}
              >
                <div className="mb-3 overflow-hidden rounded-lg h-32">
                  <OptimizedImage
                    src={product.image}
                    alt={product.name}
                    fallback={IMAGE_FALLBACKS.coconutTree}
                    className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
                  />
                </div>
                
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

        {/* Team Members Section */}
        <section 
          className="mb-16 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 md:p-8"
          role="region"
          aria-label="Our Team"
        >
          <div className="flex items-center justify-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-primary font-mont">
              Team behind CocoConnect
            </h2>
          </div>
          
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
            role="list"
            aria-label="Team members"
          >
            {processedTeamMembers.map((member, index) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                index={index}
                isHovered={hoveredMember === index}
                onMouseEnter={setHoveredMember}
                onMouseLeave={() => setHoveredMember(null)}
              />
            ))}
          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-300 text-center">
            <p className="text-gray-700 max-w-3xl mx-auto font-nunito leading-relaxed">
              Our diverse team combines expertise in technology, agriculture, business analysis, and user experience 
              to create a comprehensive platform that serves all stakeholders in the coconut industry.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section 
          className="mb-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 md:p-8 lg:p-12"
          role="region"
          aria-label="How CocoConnect Works"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 text-center font-mont">
            How CocoConnect Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {HOW_IT_WORKS.map((step, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-lg text-center transform transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-secondary"
                role="article"
                tabIndex={0}
                aria-label={`Step ${step.number}: ${step.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Handle step click
                    console.log(`Selected ${step.title}`);
                  }
                }}
              >
                <div className="mb-4 overflow-hidden rounded-lg h-48 relative">
                  <OptimizedImage
                    src={step.image}
                    alt={step.title}
                    fallback={IMAGE_FALLBACKS.coconutHarvest}
                    className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-0 left-0 bg-secondary text-white text-lg font-bold px-4 py-1 rounded-br-lg">
                    {step.number}
                  </div>
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
        <section 
          className="text-center bg-coco text-white rounded-2xl p-8 md:p-10 shadow-2xl"
          role="region"
          aria-label="Call to Action"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 font-mont">
            Join the Coconut Revolution
          </h2>
          <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto font-nunito leading-relaxed">
            Whether you're a farmer with a harvest, an investor seeking sustainable opportunities, 
            or a buyer looking for authentic coconut products - CocoConnect is your gateway to a smarter, fairer coconut ecosystem.
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
      </div>

      {/* Inline styles for animations */}
      <style jsx>{`
        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Improve focus styles for accessibility */
        *:focus {
          outline: 2px solid #4CAF50;
          outline-offset: 2px;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default About;