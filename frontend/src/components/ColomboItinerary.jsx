import React, { useEffect, useState } from 'react';
import { SunMedium, ArrowRight, Utensils, Compass } from 'lucide-react';

export default function ColomboItinerary() {
  const [data, setData] = useState({
    title: "Colombo Masterclass",
    client: "Neha",
    clientType: "VIP Client",
    activeDayText: "Day 3 of 7",
    highlightTitle: "Exploring the Fort District",
    highlightDescription: "Guided tour through colonial architecture, followed by a culinary masterclass at the Ministry of Crab.",
    weather: {
      temp: "31°C",
      city: "Colombo",
      tip: "Monsoon season approaching. Advise client to carry an umbrella."
    },
    exchangeRate: {
      base: "1 USD",
      rate: "315 LKR"
    },
    schedule: [
      { time: "09:00 AM", title: "Breakfast at Galle Face Hotel", description: "Colonial ocean-view dining veranda", status: "past" },
      { time: "11:30 AM (Now)", title: "Fort District Guided Walk", description: "Meeting guide at the Dutch Hospital Precinct.", status: "active" },
      { time: "14:00 PM", title: "Ministry of Crab Masterclass", description: "Exclusive culinary session with Chef Dharshan", status: "upcoming" }
    ]
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/itinerary/colombo')
      .then(res => res.json())
      .then(d => { if (d && d.title) setData(d); })
      .catch(() => {});
  }, []);

  return (
    <main className="flex-1 md:ml-64 p-6 md:p-8 bg-[#f9f9fe] min-h-screen font-['Inter']">
      <header className="flex justify-between items-end mb-8">
        <div>
          <p className="text-[13px] font-semibold text-[#414755] uppercase tracking-wider mb-1">Current Itinerary</p>
          <h2 className="text-[34px] font-bold text-[#1a1c1f]">{data.title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" 
            alt="Neha" 
            className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" 
          />
          <div>
            <p className="text-[17px] font-semibold text-[#1a1c1f]">{data.client}</p>
            <p className="text-[11px] text-[#414755]">{data.clientType}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Destination Banner */}
        <div className="lg:col-span-8 rounded-xl overflow-hidden relative shadow-md h-[400px]">
          <img 
            src="https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=1000&auto=format&fit=crop&q=80" 
            alt="Colombo Lotus Tower and Skyline" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#008733] animate-ping"></span>
            <span className="text-[11px] font-bold text-[#1a1c1f] uppercase tracking-wide">LIVE</span>
          </div>
          <div className="absolute bottom-0 left-0 p-6 w-full text-white flex justify-between items-end">
            <div>
              <span className="inline-block bg-[#fe9400] text-[#633700] text-[11px] font-bold px-2.5 py-1 rounded-full mb-2">
                {data.activeDayText}
              </span>
              <h3 className="text-[28px] font-bold mb-1">{data.highlightTitle}</h3>
              <p className="text-[15px] text-white/90 max-w-lg">{data.highlightDescription}</p>
            </div>
            <button className="bg-[#0058bc] hover:bg-[#004493] text-white px-4 py-2.5 rounded-lg text-[15px] font-semibold flex items-center gap-2 shadow-lg transition-colors">
              View Details <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Local Intel Widgets */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-5 shadow-sm border border-[#e2e2e7] flex flex-col justify-between flex-1">
            <div>
              <h4 className="text-[13px] font-semibold text-[#414755] uppercase tracking-wider mb-3">Local Intel</h4>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <SunMedium className="text-[#fe9400]" size={36} />
                  <div>
                    <span className="text-[28px] font-bold text-[#1a1c1f] block leading-none">{data.weather.temp}</span>
                    <span className="text-[11px] text-[#414755]">{data.weather.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[22px] font-bold text-[#1a1c1f] block">{data.exchangeRate.base}</span>
                  <span className="text-[11px] text-[#414755] font-medium">= {data.exchangeRate.rate}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#f3f3f8] rounded-lg p-3">
              <p className="text-[11px] text-[#414755]">💡 {data.weather.tip}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e2e2e7] flex flex-col justify-center flex-1">
            <h4 className="text-[13px] font-semibold text-[#414755] uppercase tracking-wider mb-3">Up Next</h4>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0070eb] text-white flex items-center justify-center shrink-0">
                <Utensils size={20} />
              </div>
              <div>
                <p className="text-[17px] font-semibold text-[#1a1c1f]">Dinner Reservation</p>
                <p className="text-[15px] text-[#414755]">Gallery Cafe, Colombo 03 (19:30)</p>
                <div className="mt-2 flex gap-3">
                  <button className="text-[#0058bc] text-[11px] font-semibold hover:underline">Message Client</button>
                  <button className="text-[#0058bc] text-[11px] font-semibold hover:underline">View Menu</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Timeline */}
        <div className="lg:col-span-8 bg-white rounded-xl p-6 shadow-sm border border-[#e2e2e7]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[22px] font-bold text-[#1a1c1f]">Today's Schedule</h4>
            <button className="text-[#0058bc] text-[13px] font-semibold">Edit</button>
          </div>
          <div className="relative pl-6 border-l-2 border-[#e8e8ed] space-y-6">
            {data.schedule.map((item, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                  item.status === 'past' ? 'bg-[#e8e8ed]' :
                  item.status === 'active' ? 'bg-[#0070eb] ring-4 ring-[#0070eb]/20' : 'bg-[#e2e2e7]'
                }`}></div>
                <p className={`text-[11px] font-semibold mb-1 ${item.status === 'active' ? 'text-[#0070eb]' : 'text-[#414755]'}`}>
                  {item.time}
                </p>
                <div className={item.status === 'active' ? 'bg-[#f3f3f8] p-3 rounded-lg border border-[#e2e2e7]' : ''}>
                  <p className={`text-[15px] font-semibold text-[#1a1c1f] ${item.status === 'past' ? 'line-through opacity-60' : ''}`}>
                    {item.title}
                  </p>
                  <p className="text-[13px] text-[#414755]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Viewed */}
        <div className="lg:col-span-4 bg-white rounded-xl p-6 shadow-sm border border-[#e2e2e7]">
          <h4 className="text-[22px] font-bold text-[#1a1c1f] mb-4">Recently Viewed</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 hover:bg-[#f3f3f8] rounded-lg cursor-pointer transition-colors">
              <img src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=100&auto=format&fit=crop&q=80" alt="Maldives" className="w-12 h-12 rounded object-cover" />
              <div>
                <p className="text-[15px] font-semibold text-[#1a1c1f]">Maldives Retreat</p>
                <p className="text-[11px] text-[#414755]">Client: The Smiths</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-[#f3f3f8] rounded-lg cursor-pointer transition-colors">
              <div className="w-12 h-12 rounded bg-[#f3f3f8] flex items-center justify-center text-[#414755]">
                <Compass size={22} />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-[#1a1c1f]">Sigiriya Heritage Tour</p>
                <p className="text-[11px] text-[#414755]">Cultural Triangle</p>
              </div>
            </div>
          </div>
          <button className="mt-4 w-full py-2 text-center text-[#0058bc] text-[13px] font-medium hover:bg-[#0058bc]/5 rounded-lg transition-colors">
            View All History
          </button>
        </div>
      </div>
    </main>
  );
} 
