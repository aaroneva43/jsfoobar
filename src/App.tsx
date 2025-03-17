import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { atom, useAtom } from "jotai";


const counter = atom(0);

import React, { useState } from "react";
import "./App.css";
const Home = () => <h2 className="text-3xl font-bold">Welcome to My App</h2>;
const About = () => <h2 className="text-3xl font-bold">About Us</h2>;
const Services = () => <h2 className="text-3xl font-bold">Our Services</h2>;
const Contact = () => <h2 className="text-3xl font-bold">Contact Us</h2>;

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <Router>
      <div className="relative">
        <button
          className="fixed top-4 right-4 p-2 bg-gray-800 text-white rounded"
          onClick={toggleMenu}
        >
          Menu
        </button>
        {isMenuOpen && (
          <nav className="fixed top-0 right-0 w-64 h-screen bg-gray-800 text-white">
            <div className="p-4">
              <h1 className="text-2xl font-bold">My App</h1>
            </div>
            <ul className="mt-4">
              <li className="p-4 hover:bg-gray-700">
                <Link to="/" onClick={toggleMenu} className="text-white">
                  Home
                </Link>
              </li>
              <li className="p-4 hover:bg-gray-700">
                <Link to="/about" onClick={toggleMenu} className="text-white">
                  About
                </Link>
              </li>
              <li className="p-4 hover:bg-gray-700">
                <Link
                  to="/services"
                  onClick={toggleMenu}
                  className="text-white"
                >
                  Services
                </Link>
              </li>
              <li className="p-4 hover:bg-gray-700">
                <Link to="/contact" onClick={toggleMenu} className="text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        )}
        <main className="p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
