const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand + Short Tagline */}
        <div className="text-center md:text-left select-none">
          <h4 className="text-white font-semibold text-lg mb-1">Sunadh Technologies</h4>
          <p className="text-sm">
            Empowering learners through industry-ready online training.
          </p>
        </div>

        {/* Quick Links */}
        <ul className="flex gap-6 text-sm">
          <a href="/courses" className="hover:text-white transition-colors cursor-pointer select-none">Courses</a>
          <a href="/careers" className="hover:text-white transition-colors cursor-pointer select-none">Careers</a>
          {/* <a href="/" className="hover:text-white transition-colors cursor-pointer select-none">Blog</a> */}
          <a href="tel:9014199096" className="hover:text-white transition-colors cursor-pointer select-none">Contact</a>
        </ul>

        {/* Contact */}
        <div className="text-sm text-center md:text-right">
          <p>📞 +91-9014199096</p>
          <p>✉️ info@sunadhtechnologies.in</p>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-gray-500 select-none">
        © {new Date().getFullYear()} Sunadh Technologies. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
