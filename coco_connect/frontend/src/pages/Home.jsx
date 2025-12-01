function Home() {
  return (
    <main className="text-slate-50 pt-24">
      {/* HERO SECTION - FULL SCREEN WIDTH */}
      <section id="home" className="w-full bg-slate-950 py-20">
        <div className="max-w-[1600px] mx-auto px-8 flex flex-col md:flex-row items-center gap-12">
          {/* Left Side */}
          <div className="flex-1">
            <p className="uppercase text-xs tracking-widest text-indigo-300 mb-4">
              Welcome to Coco Connect
            </p>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Connect, collaborate, <br />
              and grow with your <br />
              campus community.
            </h1>

            <p className="text-slate-300 text-lg mb-8">
              Coco Connect helps students, teachers, and admins stay organized,
              share resources, and communicate easily in one simple platform.
            </p>

            <div className="flex gap-5">
              <button className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-md font-medium">
                Get Started
              </button>
              <button className="border border-slate-600 hover:border-indigo-400 px-6 py-3 rounded-md font-medium">
                Learn More
              </button>
            </div>
          </div>

          {/* Right Side Card */}
          <div className="flex-1">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-xl">
              <h2 className="text-xl font-semibold mb-4">Quick Overview</h2>

              <ul className="space-y-4 text-slate-300 text-base">
                <li>✔️ Create and join groups & clubs</li>
                <li>✔️ Share announcements and events</li>
                <li>✔️ Message classmates and lecturers</li>
                <li>✔️ Keep all your campus info in one place</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="w-full bg-slate-950 py-20">
        <div className="max-w-[1600px] mx-auto px-8">
          <h2 className="text-3xl font-semibold mb-10">Key Features</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-3">Announcements</h3>
              <p className="text-slate-300">
                Lecturers and admins can post important updates and students can
                see everything in one place.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-3">Groups & Clubs</h3>
              <p className="text-slate-300">
                Join course groups, clubs, and communities instantly.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-3">Messaging</h3>
              <p className="text-slate-300">
                Chat with classmates and teachers in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
