import React, {useState} from 'react';
import {Link, useNavigate} from '@tanstack/react-router';

const HeaderSection: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleDemoClick = () => {
    const section = document.getElementById('book-demo');
    if (section) {
      section.scrollIntoView({behavior: 'smooth', block: 'center'});
      setIsMobileMenuOpen(false);
    }
  };

  const handleLoginClick = () => {
    navigate({to: '/signin'});
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-gray-200/50 sticky top-0 z-50 border-b shadow-md backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img
            src="/src/assets/images/logo/Menubook.png"
            alt="Logo"
            className="hidden h-8 w-auto md:block"
          />
          <img
            src="/src/assets/images/logo/Menubook.png"
            alt="Logo"
            className="h-8 w-auto md:hidden"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-6 md:flex">
          <button
            onClick={handleDemoClick}
            className="rounded-lg bg-blue-800 px-5 py-2 text-sm font-medium text-white shadow-md transition-colors duration-200 hover:bg-blue-900"
          >
            Get Started
          </button>
          <button
            onClick={handleLoginClick}
            className="rounded-lg bg-blue-800 px-5 py-2 text-sm font-medium text-white shadow-md transition-colors duration-200 hover:bg-blue-900"
          >
            Login
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="rounded-lg p-2 transition-colors duration-200 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <div className="flex h-6 w-6 flex-col justify-center space-y-1">
            <span
              className={`block h-0.5 w-6 bg-graydark transition-all duration-300 ${
                isMobileMenuOpen ? 'translate-y-2 rotate-45' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-graydark transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-graydark transition-all duration-300 ${
                isMobileMenuOpen ? '-translate-y-2 -rotate-45' : ''
              }`}
            />
          </div>
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Menu */}
        <div
          className={`fixed right-0 top-0 z-50 h-screen w-64 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="flex h-full flex-col px-6 pt-20">
            {/* Close Button */}
            <button
              onClick={closeMobileMenu}
              className="hover:bg-gray-100 absolute right-4 top-4 rounded-lg p-2 transition-colors duration-200"
              aria-label="Close menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-6">
              <button
                onClick={handleDemoClick}
                className="w-full rounded-lg px-5 py-3 text-base font-medium text-primary shadow-md transition-colors duration-200"
              >
                Get Started
              </button>
              <button
                onClick={handleLoginClick}
                className="w-full rounded-lg px-5 py-3 text-base font-medium text-primary shadow-md transition-colors duration-200"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default HeaderSection;
