import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-leather text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo and site name */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-medieval font-bold">D&D Attack Roller</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="font-medieval hover:text-primary-300 transition-colors">
              Home
            </Link>
            <Link to="/characters" className="font-medieval hover:text-primary-300 transition-colors">
              Characters
            </Link>
            <Link to="/roll" className="font-medieval hover:text-primary-300 transition-colors">
              Quick Roll
            </Link>
            <Link to="/weapons/library" className="font-medieval hover:text-primary-300 transition-colors">
              Weapons
            </Link>
            <Link to="/spells/library" className="font-medieval hover:text-primary-300 transition-colors">
              Spells
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 pb-6">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="font-medieval hover:text-primary-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/characters" 
                className="font-medieval hover:text-primary-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Characters
              </Link>
              <Link 
                to="/roll" 
                className="font-medieval hover:text-primary-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Quick Roll
              </Link>
              <Link 
                to="/weapons/library" 
                className="font-medieval hover:text-primary-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Weapons
              </Link>
              <Link 
                to="/spells/library" 
                className="font-medieval hover:text-primary-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Spells
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}