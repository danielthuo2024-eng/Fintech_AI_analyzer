import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/upload', label: 'Analyze' },
    { path: '/history', label: 'History' },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo to-teal rounded-lg"></div>
            <span className="text-xl font-bold text-indigo">M-Pesa AI Analyzer</span>
          </Link>
          
          <nav>
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`font-medium transition-colors duration-200 ${
                      location.pathname === item.path
                        ? 'text-indigo border-b-2 border-indigo'
                        : 'text-gray-600 hover:text-indigo'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;