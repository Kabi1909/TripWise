import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const destinations = [ 
    { title: "Colombo", desc: "Explore historic temples and serene shrines.", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0v_h6DlUdg8cqgGuMhqWmJUr2HkdFbbwGk2zaIA1m8LB2tnTwvpnkT-A&s=10" },
    { title: "Mirissa & Galle Coast, Sri Lanka", desc: "Whale watching and serene colonial fortifications.", img: "https://sahashrithtravel.files.wordpress.com/2021/12/coco.jpg?w=1024", tag: "Popular" },
    { title: "Sigiriya Ancient Rock, Sri Lanka", desc: "Immerse in royal gardens and UNESCO heritage.", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7BWZRlXtSmaMC3ts8SEDvf9d7cUs4QrWULPkjpIX7OR4yh834ubvSKk7E&s=10" },
    { title: "Ella Green Highlands, Sri Lanka", desc: "Scenic Nine Arches Bridge and tea estate walks.", img: "https://www.erikastravels.com/wp-content/uploads/2017/10/9-Arch-Bridge-Train.jpg" }
  ];

  return (
    <div className="bg-[#f9f9fe] min-h-screen flex flex-col font-['Inter']">
      <header className="bg-white px-6 h-16 border-b border-[#e2e2e7] flex items-center justify-between sticky top-0 z-50">
        <span className="text-[22px] font-bold text-[#0058bc]">WiseTravel</span>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/login')} 
            className="text-[13px] font-medium text-[#0058bc] px-4 py-2 hover:bg-[#f3f3f8] rounded-full transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/register')} 
            className="text-[13px] font-medium bg-[#0058bc] text-white px-4 py-2 rounded-full hover:bg-[#004493] shadow-sm transition-colors"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[560px] w-full flex items-center justify-center">
        <img 
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80" 
          alt="Tropical Beach" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 w-full max-w-4xl px-4 text-center">
          <h1 className="text-[36px] md:text-[48px] font-extrabold text-white mb-6 drop-shadow-md">
            Discover your next wise adventure
          </h1>

          <div className="bg-white/80 backdrop-blur-md rounded-xl p-3 flex flex-col md:flex-row gap-3 items-center shadow-lg">
            <div className="flex-1 w-full relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717786]" size={18} />
              <input type="text" placeholder="Where to? (e.g. Colombo, Ella)" className="w-full bg-white rounded-lg py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0058bc]" />
            </div>
            <div className="flex-1 w-full relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717786]" size={18} />
              <input type="text" placeholder="Dates" className="w-full bg-white rounded-lg py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0058bc]" />
            </div>
            <div className="flex-1 w-full relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717786]" size={18} />
              <input type="text" placeholder="Travelers" className="w-full bg-white rounded-lg py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0058bc]" />
            </div>
            <button onClick={() => navigate('/register')} className="w-full md:w-auto bg-[#0058bc] hover:bg-[#004493] text-white font-bold px-8 py-3 rounded-lg text-sm transition-all whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="max-w-7xl mx-auto px-6 py-12 flex-1">
        <h2 className="text-[28px] font-bold text-[#1a1c1f] mb-6">Trending Sri Lanka & Global Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((d, i) => (
            <div 
              key={i} 
              onClick={() => navigate('/colombo')}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#e2e2e7] hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="relative h-48 w-full">
                <img src={d.img} alt={d.title} className="w-full h-full object-cover" />
                {d.tag && <span className="absolute top-3 right-3 bg-[#fe9400] text-white text-[11px] font-bold px-2 py-1 rounded-full">{d.tag}</span>}
              </div>
              <div className="p-4">
                <h3 className="text-[17px] font-semibold text-[#1a1c1f] mb-1">{d.title}</h3>
                <p className="text-[13px] text-[#414755]">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-white border-t border-[#e2e2e7] py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[13px] text-[#414755]">
          <span className="font-bold text-[#1a1c1f]">WiseTravel</span>
          <div className="flex gap-4 my-2 md:my-0">
            <Link to="/" className="hover:text-[#0058bc]">Help Center</Link>
            <Link to="/" className="hover:text-[#0058bc]">Terms of Service</Link>
            <Link to="/" className="hover:text-[#0058bc]">Privacy Policy</Link>
          </div>
          <span>© 2026 WiseTravel AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
} 
