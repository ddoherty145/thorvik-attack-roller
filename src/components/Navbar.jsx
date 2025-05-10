import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-leather text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo and site name */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-medieval font-bold">Torvik's Attack Roller</span>
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
            <div className="flex items-center space-x-4 ml-6">
              {isLoggedIn ? (
                <button 
                  onClick={handleLogout}
                  className="font-medieval px-4 py-2 rounded border border-white hover:bg-white hover:text-leather transition-colors"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="font-medieval px-4 py-2 rounded border border-white hover:bg-white hover:text-leather transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="font-medieval px-4 py-2 rounded bg-white text-leather hover:bg-primary-300 hover:text-white transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
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
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-700">
                {isLoggedIn ? (
                  <button 
                    onClick={handleLogout}
                    className="font-medieval px-4 py-2 rounded border border-white hover:bg-white hover:text-leather transition-colors text-center"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="font-medieval px-4 py-2 rounded border border-white hover:bg-white hover:text-leather transition-colors text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="font-medieval px-4 py-2 rounded bg-white text-leather hover:bg-primary-300 hover:text-white transition-colors text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}