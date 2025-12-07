import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const TEAM = [
  { name: "Vorandi Sakithma", role: "Team Leader", initials: "VS" },
  { name: "Niven Asmitha", role: "UI/UX & Frontend", initials: "NA" },
  { name: "Kithmini Wickramarathne", role: "Backend & Blockchain", initials: "KW" },
  { name: "Shamika Hasaranga", role: "Database & Security", initials: "SH" },
  { name: "Sithumi Nimnadi", role: "Frontend & About Page", initials: "SN" },
];

export default function AboutUs() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Beautiful coconut-themed images that work properly
  const images = {
    // Hero images
    heroBanner: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1600&h=900&fit=crop&crop=center", // Farmer with coconuts
    coconutPlantation: "https://images.unsplash.com/photo-1578589335612-5a7642f4d8c7?w=1600&h=900&fit=crop&crop=center",
    
    // Process images
    farming: "https://images.unsplash.com/photo-1568678580791-7f926c91e4e5?w=800&h=600&fit=crop", // Farmer working
    processing: "https://images.unsplash.com/photo-1585007600263-71228e40c8d1?w=800&h=600&fit=crop", // Factory processing
    technology: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop", // Tech concept
    export: "https://images.unsplash.com/photo-1551836026-d5c2a37edcf5?w=800&h=600&fit=crop", // Shipping containers
    
    // Team/About images
    teamCollaboration: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop", // Team meeting
    sriLanka: "https://images.unsplash.com/photo-1593693396805-8c5c71228c8d?w=800&h=600&fit=crop", // Sri Lankan landscape
  };

  // Mission points
  const missionPoints = [
    "Empower coconut farmers with fair pricing",
    "Digitize the coconut value chain with blockchain",
    "Connect Sri Lankan products to global markets",
    "Ensure transparency in every transaction",
    "Promote sustainable farming practices",
  ];

  // Value chain stages
  const valueChainStages = [
    { 
      stage: "Cultivation",
      image: images.farming,
      description: "Sustainable farming with modern techniques",
      icon: "🌱"
    },
    { 
      stage: "Processing",
      image: images.processing,
      description: "Modern facilities meeting international standards",
      icon: "🏭"
    },
    { 
      stage: "Trading",
      image: images.technology,
      description: "Blockchain-enabled transparent transactions",
      icon: "🔗"
    },
    { 
      stage: "Export",
      image: images.export,
      description: "Global distribution network",
      icon: "🌍"
    },
  ];

  return (
    <div className="min-h-screen font-nunito bg-gradient-to-b from-accent5 via-accent4 to-white dark:from-[#0b0b0b] dark:via-[#071014] dark:to-[#0a0a0a] text-[#13221b] dark:text-accent4 scroll-smooth overflow-x-hidden">

      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed top-8 right-8 z-50 p-3 rounded-full bg-white/90 dark:bg-[#0f1720]/90 backdrop-blur-sm border shadow-lg hover:scale-110 transition-transform group"
      >
        <span className="flex items-center gap-2">
          {isDark ? (
            <>
              <span className="text-amber-300">☀️</span>
              <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Light</span>
            </>
          ) : (
            <>
              <span className="text-indigo-400">🌙</span>
              <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Dark</span>
            </>
          )}
        </span>
      </button>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.img 
            src={images.heroBanner}
            alt="Coconut farmer in Sri Lanka"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
          
          {/* Floating Coconut Icons */}
          <div className="absolute top-10 left-10 animate-bounce">🥥</div>
          <div className="absolute top-1/4 right-20 animate-bounce delay-300">🥥</div>
          <div className="absolute bottom-20 left-1/4 animate-bounce delay-700">🥥</div>
          <div className="absolute bottom-40 right-32 animate-bounce delay-1000">🥥</div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="max-w-3xl"
          >
            {/* Logo Badge */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.5 }}
              className="inline-flex items-center gap-3 mb-10 px-6 py-3 rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-md border border-white/30"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-connect to-primary flex items-center justify-center">
                <span className="text-2xl">🥥</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">CocoConnect</h1>
                <p className="text-sm text-white/80">Smart Coconut Ecosystem</p>
              </div>
            </motion.div>
            
            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight text-white mb-8"
            >
              About
              <span className="block text-connect">CocoConnect</span>
            </motion.h1>
            
            {/* Tagline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-xl text-white/90 mb-10 max-w-2xl leading-relaxed"
            >
              We're revolutionizing Sri Lanka's coconut industry by bridging traditional 
              farming with cutting-edge technology, creating transparent value chains, 
              and empowering local communities.
            </motion.p>
            
            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap gap-6 mb-12"
            >
              {[
                { value: "500+", label: "Farmers Empowered" },
                { value: "50+", label: "Export Countries" },
                { value: "$5M+", label: "Trade Value" },
                { value: "99%", label: "Satisfaction" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-connect">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </motion.div>
            
            {/* Scroll Indicator */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex flex-col items-center text-white/60 mt-16"
            >
              <span className="text-sm mb-2">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* OUR STORY SECTION */}
      <section className="py-24 bg-gradient-to-b from-white to-accent5 dark:from-[#0a0a0a] dark:to-[#071014]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Story Image */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={images.sriLanka}
                  alt="Sri Lankan coconut plantation"
                  className="w-full h-[500px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-primary to-connect text-accent4 p-6 rounded-2xl shadow-xl">
                <div className="text-3xl">🏆</div>
                <div className="text-sm font-bold mt-2">Best Innovation<br/>2024</div>
              </div>
            </motion.div>
            
            {/* Story Content */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-connect/20">
                <span className="text-connect">📖</span>
                <span className="text-sm font-semibold text-primary dark:text-accent4">Our Story</span>
              </div>
              
              <h2 className="text-5xl font-bold text-primary dark:text-accent4 mb-6">
                Born from a Vision to Transform
              </h2>
              
              <p className="text-lg text-accent6 dark:text-accent3 mb-8 leading-relaxed">
                Founded in 2024, CocoConnect emerged from a simple observation: 
                Sri Lanka's coconut farmers deserved better. Despite producing some 
                of the world's finest coconut products, many farmers struggled with 
                middlemen, opaque pricing, and limited market access.
              </p>
              
              <p className="text-lg text-accent6 dark:text-accent3 mb-10 leading-relaxed">
                We envisioned a platform where technology empowers tradition—where 
                blockchain ensures transparency, where farmers connect directly with 
                global buyers, and where every coconut finds its true value.
              </p>
              
              {/* Mission Points */}
              <div className="space-y-4">
                {missionPoints.map((point, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-connect flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent4 text-sm">✓</span>
                    </div>
                    <span className="text-accent6 dark:text-accent3">{point}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VALUE CHAIN SECTION */}
      <section className="py-24 bg-gradient-to-b from-accent5 to-white dark:from-[#071014] dark:to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl font-bold text-primary dark:text-accent4 mb-6"
            >
              Our Integrated Value Chain
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-accent6 dark:text-accent3 max-w-3xl mx-auto"
            >
              From farm to global market - Powered by blockchain transparency
            </motion.p>
          </div>

          {/* Value Chain Stages */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueChainStages.map((stage, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="bg-white dark:bg-[#081018] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                  {/* Stage Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={stage.image}
                      alt={stage.stage}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    <div className="absolute top-4 right-4 text-3xl">
                      {stage.icon}
                    </div>
                  </div>
                  
                  {/* Stage Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary dark:text-accent4 mb-2">
                      {stage.stage}
                    </h3>
                    <p className="text-accent6 dark:text-accent3 mb-4">
                      {stage.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-connect font-semibold">
                      <span>Step {i + 1}</span>
                      <span className="ml-auto">→</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Coconut Plantation Showcase */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={images.coconutPlantation}
                alt="Beautiful coconut plantation in Sri Lanka"
                className="w-full h-[500px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="text-3xl font-bold mb-3">Sustainable Coconut Cultivation</h3>
                <p className="text-lg text-white/90">
                  Preserving traditional farming methods while integrating modern technology 
                  for sustainable growth and maximum yield.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="py-24 bg-gradient-to-b from-white to-accent5 dark:from-[#0a0a0a] dark:to-[#071014]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl font-bold text-primary dark:text-accent4 mb-6"
            >
              Meet Our Team
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-accent6 dark:text-accent3 max-w-2xl mx-auto"
            >
              Passionate individuals dedicated to transforming Sri Lanka's coconut industry
            </motion.p>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {TEAM.map((member, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <div className="relative bg-white dark:bg-[#081018] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center text-center">
                  
                  {/* Team Member Avatar */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-connect flex items-center justify-center">
                      <span className="text-2xl font-bold text-accent4">
                        {member.initials}
                      </span>
                    </div>
                    
                    {/* Hover Effect Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-connect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Member Info */}
                  <h3 className="font-bold text-lg text-primary dark:text-accent4 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-connect font-semibold text-sm mb-4">
                    {member.role}
                  </p>
                  
                  {/* Specialization */}
                  <div className="mt-auto pt-4 border-t border-accent5/30 w-full">
                    <div className="text-xs text-accent6 dark:text-accent3">
                      Specializes in {member.role.split("&")[0].trim().toLowerCase()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Team Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: "5", label: "Team Members" },
              { value: "3+", label: "Years Experience" },
              { value: "50+", label: "Projects" },
              { value: "100%", label: "Dedication" },
            ].map((stat, i) => (
              <div key={i} className="bg-gradient-to-br from-primary/5 to-connect/5 dark:from-[#081018] dark:to-[#0c131a] rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-connect mb-2">{stat.value}</div>
                <div className="text-sm text-accent6 dark:text-accent3">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Team Collaboration Image */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 relative rounded-3xl overflow-hidden shadow-2xl"
          >
            <img 
              src={images.teamCollaboration}
              alt="Our team collaborating on projects"
              className="w-full h-[400px] object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-connect/60"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <h3 className="text-3xl font-bold mb-4">Collaboration & Innovation</h3>
                <p className="text-xl">
                  Working together to build a better future for Sri Lanka's coconut industry
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-b from-accent5 to-white dark:from-[#071014] dark:to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-connect/10 to-primary/10 rounded-3xl -rotate-3"></div>
            
            {/* Content */}
            <div className="relative bg-white dark:bg-[#081018] rounded-3xl p-12 shadow-2xl">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary to-connect mb-8">
                <span className="text-3xl">🥥</span>
              </div>
              
              <h2 className="text-4xl font-bold text-primary dark:text-accent4 mb-6">
                Join the Coconut Revolution
              </h2>
              
              <p className="text-xl text-accent6 dark:text-accent3 mb-10 max-w-2xl mx-auto">
                Be part of Sri Lanka's journey to become the world's leading 
                transparent coconut marketplace
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-10 py-4 rounded-full bg-gradient-to-r from-primary to-connect text-accent4 font-bold hover:scale-105 transition-transform shadow-lg">
                  Get Started
                </button>
                <button className="px-10 py-4 rounded-full border-2 border-primary dark:border-connect text-primary dark:text-connect font-bold hover:bg-primary/10 transition-colors">
                  Learn More
                </button>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 text-4xl opacity-20">🥥</div>
              <div className="absolute -bottom-4 -right-4 text-4xl opacity-20">🥥</div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}