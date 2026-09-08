import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, X } from 'lucide-react';

const destinations = [
  {
    id: 'colombo',
    districts: ['Colombo'],
    title: 'Colombo',
    desc: 'Explore historic temples and serene shrines.',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0v_h6DlUdg8cqgGuMhqWmJUr2HkdFbbwGk2zaIA1m8LB2tnTwvpnkT-A&s=10',
    about:
      'Discover Sri Lanka’s coastal capital through its temples, lively markets, historic streets, and oceanfront promenades.',
    highlights: [
      'Gangaramaya Temple',
      'Galle Face Green',
      'Colombo Fort',
      'Pettah Market',
    ],
    packages: [
      {
        name: 'Colombo City Explorer',
        duration: '1 day',
        description:
          'A suggested city itinerary combining temples, markets, and an evening by the ocean.',
        includes: [
          'Gangaramaya Temple visit',
          'Fort and Pettah walking tour',
          'Sunset at Galle Face Green',
        ],
      },
      {
        name: 'Colombo Culture & Leisure',
        duration: '2 days / 1 night',
        description:
          'A relaxed introduction to Colombo’s cultural landmarks and city life.',
        includes: [
          'City sightseeing',
          'Museum and temple visits',
          'Free time for shopping and local food',
        ],
      },
    ],
  },
  {
    id: 'mirissa-galle',
    districts: ['Matara', 'Galle'],
    title: 'Mirissa & Galle Coast, Sri Lanka',
    desc: 'Whale watching and serene colonial fortifications.',
    img: 'https://sahashrithtravel.files.wordpress.com/2021/12/coco.jpg?w=1024',
    tag: 'Popular',
    about:
      'Explore the southern coast with beach time in Mirissa and walks through the historic streets and seaside ramparts of Galle Fort.',
    highlights: [
      'Mirissa Beach',
      'Coconut Tree Hill',
      'Galle Fort',
      'Galle Lighthouse',
    ],
    packages: [
      {
        name: 'Southern Coast Escape',
        duration: '2 days / 1 night',
        description:
          'A suggested short getaway combining coastal scenery and historic Galle.',
        includes: [
          'Galle Fort walking tour',
          'Mirissa Beach visit',
          'Coconut Tree Hill stop',
        ],
      },
      {
        name: 'Mirissa & Galle Discovery',
        duration: '3 days / 2 nights',
        description:
          'Enjoy a slower coastal itinerary with time for the beach and optional ocean activities.',
        includes: [
          'Galle sightseeing',
          'Beach leisure time',
          'Optional whale-watching excursion, subject to conditions',
        ],
      },
    ],
  },
  {
    id: 'sigiriya',
    districts: ['Matale'],
    title: 'Sigiriya Ancient Rock, Sri Lanka',
    desc: 'Immerse in royal gardens and UNESCO heritage.',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7BWZRlXtSmaMC3ts8SEDvf9d7cUs4QrWULPkjpIX7OR4yh834ubvSKk7E&s=10',
    about:
      'Explore Sigiriya’s ancient rock fortress, landscaped gardens, and surrounding countryside on a cultural getaway.',
    highlights: [
      'Sigiriya Rock Fortress',
      'Royal Water Gardens',
      'Pidurangala Rock',
      'Dambulla Cave Temple',
    ],
    packages: [
      {
        name: 'Sigiriya Heritage Day',
        duration: '1 day',
        description:
          'A suggested day focused on the rock fortress and its historic surroundings.',
        includes: [
          'Sigiriya Rock Fortress visit',
          'Royal gardens exploration',
          'Time to explore the surrounding area',
        ],
      },
      {
        name: 'Cultural Triangle Getaway',
        duration: '3 days / 2 nights',
        description:
          'Combine Sigiriya with nearby cultural landmarks and countryside experiences.',
        includes: [
          'Sigiriya sightseeing',
          'Dambulla Cave Temple visit',
          'Optional Pidurangala hike',
        ],
      },
    ],
  },
  {
    id: 'ella',
    districts: ['Badulla'],
    title: 'Ella Green Highlands, Sri Lanka',
    desc: 'Scenic Nine Arches Bridge and tea estate walks.',
    img: 'https://www.erikastravels.com/wp-content/uploads/2017/10/9-Arch-Bridge-Train.jpg',
    about:
      'Discover Ella’s green hills, tea country, scenic walking routes, and railway views on a highland escape.',
    highlights: [
      'Nine Arches Bridge',
      'Little Adam’s Peak',
      'Ravana Falls',
      'Tea estate walks',
    ],
    packages: [
      {
        name: 'Ella Highlights',
        duration: '2 days / 1 night',
        description:
          'A suggested short stay covering Ella’s signature views and landmarks.',
        includes: [
          'Nine Arches Bridge visit',
          'Little Adam’s Peak walk',
          'Ravana Falls stop',
        ],
      },
      {
        name: 'Highlands & Tea Trails',
        duration: '3 days / 2 nights',
        description:
          'Spend more time exploring the hills and learning about tea country.',
        includes: [
          'Ella sightseeing',
          'Tea estate experience',
          'Free time for scenic walks',
        ],
      },
    ],
  },
];

const normalizeSearch = (value) =>
  value.toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ').trim();

export default function LandingPage() {
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const resultsRef = useRef(null);
  const searchTerm = normalizeSearch(submittedSearch);
  const getSearchNames = (destination) => [
    destination.title,
    ...destination.id.split('-'),
    ...destination.districts.flatMap((district) => [district, `${district} district`]),
    ...destination.highlights,
  ].map(normalizeSearch);
  const exactMatches = destinations.filter((destination) =>
    getSearchNames(destination).includes(searchTerm)
  );
  const filteredDestinations = !searchTerm
    ? destinations
    : exactMatches.length > 0
      ? exactMatches
      : destinations.filter((destination) =>
          getSearchNames(destination).some((name) => name.includes(searchTerm))
        );

  const handleSearch = (event) => {
    event.preventDefault();
    setSubmittedSearch(searchInput.trim());
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openDestination = (destination) => {
    setSelectedDestination(destination);
    dialogRef.current?.showModal();
  };

  const closeDestination = () => {
    dialogRef.current?.close();
  };

  return (
    <div className="bg-[#f9f9fe] min-h-screen flex flex-col font-['Inter']">
      <header className="bg-white px-6 h-16 border-b border-[#e2e2e7] flex items-center justify-between sticky top-0 z-50">
        <span className="text-[22px] font-bold text-[#0058bc]">
          WiseTravel
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-[13px] font-medium text-[#0058bc] px-4 py-2 hover:bg-[#f3f3f8] rounded-full transition-colors"
          >
            Log In
          </button>

          <button
            type="button"
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

          <form onSubmit={handleSearch} role="search" aria-label="Search districts and places" className="bg-white/80 backdrop-blur-md rounded-xl p-3 flex flex-col md:flex-row gap-3 items-center shadow-lg">
            <div className="flex-1 w-full relative">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717786]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search districts or places (e.g. Badulla, Ella)"
                aria-label="District or place"
                aria-controls="destination-results"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  if (!event.target.value.trim()) setSubmittedSearch('');
                }}
                className="w-full bg-white rounded-lg py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0058bc]"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto bg-[#0058bc] hover:bg-[#004493] text-white font-bold px-8 py-3 rounded-lg text-sm transition-all whitespace-nowrap"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Trending Destinations */}
      <section ref={resultsRef} id="destination-results" className="max-w-7xl mx-auto px-6 py-12 flex-1 scroll-mt-20">
        <h2 className="text-[28px] font-bold text-[#1a1c1f] mb-6">
          Trending Sri Lanka &amp; Global Destinations
        </h2>

        <p role="status" className="sr-only">
          {searchTerm
            ? `${filteredDestinations.length} destinations found for ${submittedSearch}.`
            : 'Showing all destinations.'}
        </p>

        {filteredDestinations.length === 0 && (
          <div className="bg-white rounded-xl border border-[#e2e2e7] p-6 shadow-sm">
            <h3 className="text-[17px] font-semibold text-[#1a1c1f] mb-1">
              No places found for “{submittedSearch}”
            </h3>
            <p className="text-[13px] text-[#414755]">
              Try another district or place, or clear the search to see all destinations.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDestinations.map((destination) => (
            <button
              key={destination.id}
              type="button"
              onClick={() => openDestination(destination)}
              aria-label={`View ${destination.title} details and packages`}
              aria-haspopup="dialog"
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#e2e2e7] hover:-translate-y-1 transition-all cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058bc] focus-visible:ring-offset-2"
            >
              <div className="relative h-48 w-full">
                <img
                  src={destination.img}
                  alt={destination.title}
                  className="w-full h-full object-cover"
                />

                {destination.tag && (
                  <span className="absolute top-3 right-3 bg-[#fe9400] text-white text-[11px] font-bold px-2 py-1 rounded-full">
                    {destination.tag}
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-[17px] font-semibold text-[#1a1c1f] mb-1">
                  {destination.title}
                </h3>
                <p className="text-[13px] text-[#414755]">
                  {destination.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <footer className="bg-white border-t border-[#e2e2e7] py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[13px] text-[#414755]">
          <span className="font-bold text-[#1a1c1f]">WiseTravel</span>

          <div className="flex gap-4 my-2 md:my-0">
            <a href="#" className="hover:text-[#0058bc]">
              Help Center
            </a>
            <a href="#" className="hover:text-[#0058bc]">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[#0058bc]">
              Privacy Policy
            </a>
          </div>

          <span>© 2026 WiseTravel AI. All rights reserved.</span>
        </div>
      </footer>

      {/* Native dialog supports Escape and keeps keyboard focus inside. */}
      <dialog
        ref={dialogRef}
        aria-labelledby="destination-dialog-title"
        className="m-auto w-[calc(100%-2rem)] max-w-3xl max-h-[90dvh] overflow-y-auto rounded-xl border border-[#e2e2e7] bg-[#f9f9fe] p-0 text-[#1a1c1f] shadow-2xl backdrop:bg-black/50"
      >
        {selectedDestination && (
          <>
            <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#e2e2e7] bg-white px-6 py-4">
              <h2
                id="destination-dialog-title"
                className="text-[22px] font-bold text-[#1a1c1f]"
              >
                {selectedDestination.title}
              </h2>

              <button
                type="button"
                onClick={closeDestination}
                aria-label="Close destination details"
                className="shrink-0 rounded-full p-2 text-[#414755] hover:bg-[#f3f3f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058bc]"
              >
                <X size={22} />
              </button>
            </header>

            <img
              src={selectedDestination.img}
              alt={selectedDestination.title}
              className="h-56 w-full object-cover md:h-72"
            />

            <div className="space-y-6 p-6">
              <section>
                <h3 className="mb-2 text-[22px] font-bold">
                  About this place
                </h3>
                <p className="text-[15px] leading-relaxed text-[#414755]">
                  {selectedDestination.about}
                </p>
              </section>

              <section>
                <h3 className="mb-3 text-[17px] font-semibold">
                  Places to explore
                </h3>

                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selectedDestination.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-center gap-2 rounded-lg border border-[#e2e2e7] bg-white p-3 text-[13px] text-[#414755]"
                    >
                      <MapPin
                        size={16}
                        aria-hidden="true"
                        className="shrink-0 text-[#0058bc]"
                      />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="mb-2 text-[22px] font-bold">
                  Suggested packages
                </h3>

                <p className="mb-4 text-[13px] text-[#414755]">
                  Sample itineraries. Prices, availability, and inclusions
                  have not been confirmed.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {selectedDestination.packages.map((travelPackage) => (
                    <article
                      key={travelPackage.name}
                      className="rounded-xl border border-[#e2e2e7] bg-white p-5 shadow-sm"
                    >
                      <h4 className="mb-2 text-[17px] font-semibold">
                        {travelPackage.name}
                      </h4>

                      <p className="mb-3 flex items-center gap-2 text-[13px] font-medium text-[#0058bc]">
                        <Calendar size={16} aria-hidden="true" />
                        {travelPackage.duration}
                      </p>

                      <p className="mb-4 text-[13px] leading-relaxed text-[#414755]">
                        {travelPackage.description}
                      </p>

                      <ul className="list-disc space-y-2 pl-5 text-[13px] text-[#414755]">
                        {travelPackage.includes.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeDestination}
                  className="rounded-full bg-[#0058bc] px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#004493]"
                >
                  Back to destinations
                </button>
              </div>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
} 
