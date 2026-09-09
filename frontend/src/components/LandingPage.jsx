import { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, X } from 'lucide-react';
import { destinations } from '../lib/destinations';
import { recordHistory } from '../lib/api';
import { AuthContext } from '../context/AuthContext';

const normalizeSearch = (value) =>
  value.toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ').trim();

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, checking, logout } = useContext(AuthContext);
  const signedIn = !checking && Boolean(user?.token);
  const [historyError, setHistoryError] = useState('');
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
    if (searchInput.trim()) recordHistory('search', searchInput.trim()).catch(() => setHistoryError('Search results are available, but this search could not be saved to history.'));
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openDestination = (destination) => {
    setSelectedDestination(destination);
    recordHistory('destination', destination.title, '', destination.id).catch(() => setHistoryError('This visit could not be saved to history.'));
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
            onClick={() => navigate(signedIn ? (user.role === 'Travel Agent' ? '/agent' : '/trips') : '/login')}
            className="text-[13px] font-medium text-[#0058bc] px-4 py-2 hover:bg-[#f3f3f8] rounded-full transition-colors"
          >
            {signedIn ? 'My Portal' : 'Login'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (signedIn) {
                logout();
                setHistoryError('');
              } else {
                navigate('/register');
              }
            }}
            className="text-[13px] font-medium bg-[#0058bc] text-white px-4 py-2 rounded-full hover:bg-[#004493] shadow-sm transition-colors"
          >
            {signedIn ? 'Logout' : 'Sign Up'}
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

      {historyError && <p role="status" className="px-6 text-[13px] text-[#414755]">{historyError}</p>}
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
              className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-[#e2e2e7] hover:-translate-y-1 transition-all cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058bc] focus-visible:ring-offset-2"
            >
              <div className="relative h-48 w-full shrink-0 overflow-hidden">
                <img
                  src={destination.img}
                  alt={destination.title}
                  className="absolute inset-0 block w-full h-full object-cover object-center"
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
                      <button type="button" className="mt-4 bg-[#0058bc] hover:bg-[#004493] text-white px-4 py-2 rounded-lg text-[13px] font-medium"
                        onClick={() => {
                          const target = '/trips/new?destination=' + selectedDestination.id + '&package=' + encodeURIComponent(travelPackage.name);
                          closeDestination();
                          if (!signedIn) {
                            navigate('/login', { state: { from: target } });
                            return;
                          }
                          recordHistory('package', travelPackage.name, selectedDestination.title, selectedDestination.id).catch(() => {});
                          navigate(target);
                        }}>
                        Customize trip
                      </button>
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
