import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Investment", href: "/investment" },
    { name: "About Us", href: "/about" },
  ];

  const resources = [
    { name: "Help Center", href: "/help" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "FAQ", href: "/faq" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: "fab fa-facebook-f",
      href: "https://facebook.com",
    },
    {
      name: "Instagram",
      icon: "fab fa-instagram",
      href: "https://instagram.com",
    },
    {
      name: "LinkedIn",
      icon: "fab fa-linkedin-in",
      href: "https://linkedin.com",
    },
    { name: "Twitter", icon: "fab fa-twitter", href: "https://twitter.com" },
  ];

  return (
    <footer className="footer-bg mt-12">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <div className="footer-glass rounded-2xl shadow-xl border border-white/5 px-6 sm:px-8 lg:px-16 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo + About Section */}
            <div>
              <div className="flex items-center mb-3">
                <img
                  src="/tree.png"
                  alt="CocoConnect Logo"
                  className="w-10 h-10 object-contain mr-2.5"
                />
                <div className="logo-text">
                  <span className="coco-text">COCO</span>
                  <span className="connect-text">CONNECT</span>
                </div>
              </div>
              <p className="text-xs text-#ece7e1 leading-relaxed">
                Empowering the coconut industry through smart collaboration and
                connectivity.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-#f9faf7 font-semibold text-sm mb-3">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-#f9faf7 hover:text-connect transition-colors duration-200 text-xs inline-block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-#f9faf7 font-semibold text-sm mb-3">
                Resources
              </h3>
              <ul className="space-y-2">
                {resources.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-#f9faf7 hover:text-connect transition-colors duration-200 text-xs inline-block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-#f9faf7 font-semibold text-sm mb-3">
                Contact
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="mailto:support@cococonnect.com"
                    className="text-#f9faf7 hover:text-connect transition-colors duration-200"
                  >
                    support@cococonnect.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+94712345678"
                    className="text-#f9faf7 hover:text-connect transition-colors duration-200"
                  >
                    +94 71 234 5678
                  </a>
                </li>
                <li className="text-#f9faf7">Colombo, Sri Lanka</li>
              </ul>

              {/* Social Links */}
              <div className="flex gap-2.5 mt-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-#f9faf7 hover:bg-white/20 hover:text-connect transition-all duration-300"
                  >
                    <i className={`${social.icon} text-sm`}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-#f9faf7/70">
            <p>© {currentYear} CocoConnect. All rights reserved.</p>
            <div className="flex gap-4">
              <a
                href="/privacy"
                className="hover:text-connect transition-colors"
              >
                Privacy
              </a>
              <a href="/terms" className="hover:text-connect transition-colors">
                Terms
              </a>
              <a
                href="/cookies"
                className="hover:text-connect transition-colors"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
