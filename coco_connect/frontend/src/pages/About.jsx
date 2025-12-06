import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "lucide-react";

const TEAM = [
  { name: "Vorandi Sakithma", role: "Team Leader" },
  { name: "Niven Asmitha", role: "UI/UX & Frontend" },
  { name: "Kithmini Wickramarathne", role: "Backend & Blockchain" },
  { name: "Shamika Hasaranga", role: "Database & Security" },
  { name: "Sithumi Nimnadi", role: "Frontend & About Page" },
];

export default function AboutUs() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="min-h-screen font-nunito bg-gradient-to-b from-accent5 to-accent4 dark:from-[#0b0b0b] dark:to-[#071014] text-[#13221b] dark:text-accent4 scroll-smooth select-none">

      {/* HEADER */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-coco flex items-center justify-center text-accent4 font-logo text-xl">C</div>
          <div>
            <h1 className="text-xl font-bold text-primary dark:text-accent4">CocoConnect</h1>
            <p className="text-sm text-accent3">Smart Coconut Industry Ecosystem</p>
          </div>
        </div>

        <nav className="hidden md:flex gap-6 text-sm">
          <a href="#about" className="hover:text-connect">About</a>
          <a href="#mission" className="hover:text-connect">Mission</a>
          <a href="#team" className="hover:text-connect">Team</a>
          <a href="#contact" className="hover:text-connect">Contact</a>
        </nav>

        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg bg-accent5 dark:bg-[#0f1720] border hover:scale-105 transition">
          {isDark ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
        </button>
      </header>


      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
        
        {/* TEXT */}
        <motion.div initial={{opacity:0,x:-40}} animate={{opacity:1,x:0}} transition={{duration:.7}}>
          <h2 className="text-4xl font-mont font-bold leading-tight text-coco dark:text-accent4">
            Empowering Sri Lanka’s Coconut Industry
            <span className="text-connect"> — From Field to Global Market</span>
          </h2>

          <p className="mt-4 text-accent6 dark:text-accent3 max-w-xl">
            CocoConnect is a unified digital ecosystem where farmers, buyers, investors,
            exporters and suppliers collaborate transparently through blockchain support.
          </p>

          <div className="mt-6 flex gap-4">
            <a href="#join" className="px-6 py-3 rounded-lg bg-primary text-accent4 hover:scale-105 transition">Join Community</a>
            <a href="#market" className="px-6 py-3 rounded-lg border">Explore Market</a>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["🌿 Sustainability","🔗 Transparency","🚜 Farmer Growth","🌍 Global Access"].map((v)=>
              <div key={v} className="p-3 rounded-lg bg-accent4/80 dark:bg-[#081018] text-sm font-semibold">{v}</div>
            )}
          </div>
        </motion.div>

        {/* IMAGE */}
        <motion.div initial={{opacity:0,scale:.97}} animate={{opacity:1,scale:1}} transition={{duration:.7}}>
          <div 
            className="h-72 sm:h-96 rounded-xl shadow-lg bg-cover bg-center"
            style={{backgroundImage:"url('/images/hero-coconut.jpg')"}} />
        </motion.div>
      </section>



      {/* ABOUT + MISSION */}
      <main id="about" className="max-w-6xl mx-auto px-6 pt-6 space-y-16">

        <section className="grid md:grid-cols-3 gap-10">
          <motion.div className="md:col-span-2" initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
            <h3 className="text-2xl font-mont font-bold text-primary dark:text-accent4">Who We Are</h3>

            <p className="mt-3 text-accent6 dark:text-accent3 leading-relaxed">
              CocoConnect bridges real agricultural stakeholders with a fully automated 
              traceable smart marketplace. Blockchain ensures fair trade, real-time investment 
              monitoring, transparent profit sharing, and verified sourcing.
            </p>
          </motion.div>

          <motion.div id="mission" initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} className="p-6 rounded-xl bg-accent4 shadow dark:bg-[#0c131a]">
            <h4 className="font-bold text-primary dark:text-accent4">Our Mission</h4>
            <ul className="mt-3 text-sm space-y-2 text-accent6 dark:text-accent3">
              <li>✔ Digitize entire coconut value chain</li>
              <li>✔ Transparent blockchain investments</li>
              <li>✔ Global marketplace & export access</li>
            </ul>
          </motion.div>
        </section>


        {/* TIMELINE */}
        <section>
          <h3 className="text-xl font-bold text-primary dark:text-accent4 mb-5">Our Journey</h3>
          <div className="space-y-5">
            {[
              {year:"2024",text:"Concept, research & industry problem study"},
              {year:"2025",text:"Prototype + blockchain funding logic developed"},
              {year:"Future",text:"IoT monitoring + automatic export linking"},
            ].map((t,i)=>(
              <motion.div key={i} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} transition={{delay:i*.1}} 
                className="p-4 rounded-lg border bg-white/90 dark:bg-[#071017]">
                <b>{t.year}</b> — <span className="text-accent6 dark:text-accent3">{t.text}</span>
              </motion.div>
            ))}
          </div>
        </section>


        {/* TEAM GRID */}
        <section id="team">
          <h3 className="text-xl font-bold text-primary dark:text-accent4 mb-6">Meet Our Team</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {TEAM.map((m,i)=>(
              <motion.div key={i} whileHover={{scale:1.03}} initial={{opacity:0,y:15}} whileInView={{opacity:1,y:0}}>
                <div className="p-5 rounded-xl bg-accent4/80 dark:bg-[#081018] shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-accent4 flex items-center justify-center font-bold">
                      {m.name.split(" ").map(n=>n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-bold">{m.name}</p>
                      <span className="text-xs text-accent6">{m.role}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>


        {/* CTA */}
        <section id="contact" className="text-center py-10 rounded-2xl bg-gradient-to-r from-secondary/25 to-accent1/25 dark:from-[#072016] dark:to-[#081015]">
          <h3 className="text-2xl font-bold mb-2">Be Part of The Smart Coconut Revolution</h3>
          <p className="text-accent6 mb-5 dark:text-accent3">Farmers, investors, buyers — all in one network.</p>
          <button className="px-6 py-3 rounded-lg bg-primary text-accent4 hover:scale-105 transition">Join CocoConnect</button>
        </section>

        <footer className="py-8 text-center text-accent3 text-xs">© {new Date().getFullYear()} — CocoConnect</footer>

      </main>
    </div>
  );
}
