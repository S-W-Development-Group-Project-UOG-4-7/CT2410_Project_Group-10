function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 py-6">
      <div className="max-w-[1600px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Coco Connect. All rights reserved.
        </p>

        <div className="flex gap-6 text-sm">
          <a href="#" className="hover:text-indigo-300">
            Privacy
          </a>
          <a href="#" className="hover:text-indigo-300">
            Terms
          </a>
          <a href="#" className="hover:text-indigo-300">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
