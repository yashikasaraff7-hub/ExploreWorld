import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  ChevronRight, 
  ArrowLeft, 
  Sun,
  Moon,
  Calendar,
  AlertTriangle,
  Utensils,
  Train,
  Shield,
  Info,
  Camera,
  Map as MapIcon,
  ThermometerSun,
  Wallet,
  Plane,
  Building,
  ChevronDown,
  Ticket
} from 'lucide-react';

import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import { getCitySuggestions, getTravelGuide } from './services/geminiService';
import { AppState, CitySuggestion, GuideResponse, BudgetLevel } from './types';
import { countries } from './data/countries';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [appState, setAppState] = useState<AppState>(AppState.SELECT_COUNTRY);
  const [country, setCountry] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<BudgetLevel>('Moderate');
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [guideData, setGuideData] = useState<GuideResponse | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const suggestionRef = useRef<HTMLDivElement>(null);
  const dayDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target as Node)) {
        setShowDayDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCountry(val);
    if (val.length > 0) {
      const filtered = countries.filter(c => c.toLowerCase().includes(val.toLowerCase())).slice(0, 6);
      setFilteredCountries(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCountrySuggestion = (name: string) => {
    setCountry(name);
    setShowSuggestions(false);
  };

  const handleCountrySubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country.trim()) return;

    setIsLoading(true);
    setLoadingMessage(`Finding top destinations in ${country}...`);
    
    const suggestions = await getCitySuggestions(country);
    
    setCitySuggestions(suggestions);
    setAppState(AppState.SELECT_CITY);
    setIsLoading(false);
  }, [country]);

  const handleCitySelect = useCallback(async (cityName: string) => {
    setSelectedCity(cityName);
    setIsLoading(true);
    setLoadingMessage(`Planning your ${days}-day ${budget.toLowerCase()} trip to ${cityName}...`);
    
    const guide = await getTravelGuide(cityName, country, days, budget);
    
    setGuideData(guide);
    setAppState(AppState.VIEW_GUIDE);
    setIsLoading(false);
  }, [country, days, budget]);

  const handleReset = useCallback(() => {
    setAppState(AppState.SELECT_COUNTRY);
    setCountry('');
    setCitySuggestions([]);
    setGuideData(null);
  }, []);

  const handleBackToCities = useCallback(() => {
    setAppState(AppState.SELECT_CITY);
    setGuideData(null);
  }, []);

  // Optimized Image URL generator
  const getImageUrl = (prompt: string, width = 800, height = 600) => {
    // Keep prompts extremely simple for better hit rate
    const cleanPrompt = prompt.replace(/[^\w\s]/gi, '').split(' ').slice(0, 4).join(' ');
    // Add a seed to prevent caching the same image for different items
    const seed = Math.floor(Math.random() * 1000);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=flux`;
  };

  const openBookingLink = (type: 'flights' | 'hotels' | 'trains') => {
    if (!guideData?.data?.city) return;
    const city = guideData.data.city;
    const countryName = guideData.data.country;
    let url = '';
    switch(type) {
      case 'flights':
        url = `https://www.google.com/travel/flights?q=flights+to+${city}+${countryName}`;
        break;
      case 'hotels':
        url = `https://www.google.com/travel/hotels?q=hotels+in+${city}+${countryName}`;
        break;
      case 'trains':
        url = `https://www.google.com/search?q=train+bus+tickets+to+${city}+${countryName}`;
        break;
    }
    window.open(url, '_blank');
  };

  // --- Renders ---

  const renderCountrySelection = () => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 animate-fade-in relative z-10">
      <div className="max-w-xl w-full text-center space-y-8 bg-white/40 dark:bg-black/50 backdrop-blur-xl p-8 sm:p-12 rounded-[2rem] shadow-2xl border border-white/30 dark:border-slate-700/30">
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm">
            WanderLust AI
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
            Discover the world with your personal AI guide.
          </p>
        </div>

        <form onSubmit={handleCountrySubmit} className="space-y-6">
          {/* Country Input */}
          <div className="relative text-left" ref={suggestionRef}>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider ml-1">
              Destination
            </label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 z-10 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={country}
                onChange={handleCountryChange}
                placeholder="e.g., Japan, Italy, Brazil..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white shadow-inner backdrop-blur-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-lg transition-all placeholder:text-slate-400"
                autoFocus
              />
            </div>
            {showSuggestions && filteredCountries.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-20 backdrop-blur-md max-h-60 overflow-y-auto">
                {filteredCountries.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectCountrySuggestion(c)}
                    className="w-full text-left px-5 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors border-b last:border-0 border-slate-100 dark:border-slate-700/50 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Days Dropdown */}
            <div className="relative text-left" ref={dayDropdownRef}>
               <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider ml-1">
                Duration
              </label>
              <button
                type="button"
                onClick={() => setShowDayDropdown(!showDayDropdown)}
                className="w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white shadow-sm backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all border-2 border-transparent focus:border-blue-500/50"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  {days} Days
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showDayDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showDayDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-800/95 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-20 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 10, 14, 21].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { setDays(d); setShowDayDropdown(false); }}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors ${days === d ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Budget Selector */}
            <div className="text-left">
               <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider ml-1">
                Budget Style
              </label>
              <div className="flex bg-white/70 dark:bg-slate-800/70 rounded-2xl p-1 shadow-sm backdrop-blur-sm h-[58px] items-center">
                {(['Budget', 'Moderate', 'Luxury'] as BudgetLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setBudget(level)}
                    className={`flex-1 h-full rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                      budget === level 
                      ? 'bg-blue-600 text-white shadow-md transform scale-100' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!country.trim() || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Create My Guide
          </button>
        </form>
      </div>
    </div>
  );

  const renderCitySelection = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up relative z-10">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/20 dark:border-slate-800">
        <div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">{country}</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">Select a destination to generate your guide.</p>
        </div>
        
        <button 
          onClick={handleReset}
          className="mt-4 sm:mt-0 flex items-center text-sm font-bold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-white transition-colors bg-white/50 dark:bg-slate-800 px-5 py-3 rounded-xl hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Start Over
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {citySuggestions.map((city, idx) => (
          <button
            key={idx}
            onClick={() => handleCitySelect(city.name)}
            className="group relative flex flex-col h-full bg-white dark:bg-slate-800 rounded-[2rem] border border-white/20 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 overflow-hidden text-left"
          >
            <div className="h-56 overflow-hidden relative">
               <img 
                src={getImageUrl(`${city.name} city`, 600, 400)}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity"></div>
               <div className="absolute bottom-5 left-6 right-6">
                  <h3 className="text-2xl font-bold text-white mb-1 shadow-black drop-shadow-lg leading-tight">
                    {city.name}
                  </h3>
               </div>
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between bg-white dark:bg-slate-800 relative z-10">
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                {city.description}
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm mt-auto group-hover:translate-x-2 transition-transform">
                Generate Guide <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderGuide = () => {
    if (!guideData || !guideData.data) return (
        <div className="flex flex-col items-center justify-center h-96 text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 rounded-[2rem] backdrop-blur-md m-4 animate-fade-in">
            <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-xl font-bold mb-2">Guide generation interrupted.</p>
            <button onClick={handleBackToCities} className="text-blue-500 hover:underline font-bold mt-2">Try another city</button>
        </div>
    );

    const { data } = guideData;

    return (
      <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in-up pb-24 space-y-8 relative z-10">
         {/* Navigation & Actions */}
         <div className="sticky top-[80px] z-30 flex flex-wrap gap-4 justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/20 dark:border-slate-800 transition-all">
             <button 
              onClick={handleBackToCities}
              className="flex items-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors font-bold text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <div className="flex gap-2">
                 <button 
                    onClick={() => openBookingLink('flights')}
                    className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md hover:shadow-lg active:scale-95"
                 >
                    <Plane className="w-4 h-4 mr-2" /> Flights
                 </button>
                  <button 
                    onClick={() => openBookingLink('hotels')}
                    className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md hover:shadow-lg active:scale-95"
                 >
                    <Building className="w-4 h-4 mr-2" /> Hotels
                 </button>
            </div>
         </div>

        {/* Hero Section */}
        <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl min-h-[550px] group border-4 border-white dark:border-slate-800 mx-1">
          <img 
            src={getImageUrl(`${data.city} iconic view`)}
            alt={data.city} 
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-[1.5s] absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 md:p-16 text-white max-w-4xl">
            <div className="flex flex-wrap gap-3 mb-6 animate-fade-in-up">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-sm font-bold border border-white/20 shadow-lg">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  {data.country}
                </div>
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/80 backdrop-blur-md text-sm font-bold border border-white/20 shadow-lg">
                  <Wallet className="w-4 h-4" />
                  {budget} Budget
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/80 backdrop-blur-md text-sm font-bold border border-white/20 shadow-lg">
                  <Calendar className="w-4 h-4" />
                  {days} Days
                </div>
            </div>
           
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter drop-shadow-2xl leading-[0.9] animate-fade-in-up" style={{animationDelay: '0.1s'}}>{data.city}</h1>
            <p className="text-lg md:text-xl text-slate-100 leading-relaxed font-light drop-shadow-lg max-w-2xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              {data.introduction}
            </p>
          </div>
        </div>

        {/* Weather & Map Context Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Weather Card */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-[2rem] p-8 border border-white/20 dark:border-slate-700 shadow-xl flex flex-col justify-between hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
                <div>
                    <div className="flex items-center gap-3 mb-6 text-blue-600 dark:text-blue-400">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                          <ThermometerSun className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Current Vibe</h3>
                    </div>
                    <div className="mb-6">
                        <div className="text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{data.weather.temperature}</div>
                        <div className="text-lg text-slate-600 dark:text-slate-300 font-medium capitalize">{data.weather.summary}</div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 p-5 rounded-2xl border border-blue-100 dark:border-slate-700">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="font-bold block mb-2 text-blue-700 dark:text-blue-300 text-xs uppercase tracking-wider">Pack Smart</span> 
                        {data.weather.packing_suggestions}
                    </p>
                </div>
            </div>

            {/* Map Context Card */}
            <div className="md:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-[2rem] p-8 border border-white/20 dark:border-slate-700 shadow-xl flex flex-col hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
                <div className="flex items-center gap-3 mb-6 text-emerald-600 dark:text-emerald-400">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
                      <MapIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Geography & Layout</h3>
                </div>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed flex-grow font-light">
                    {data.map_context}
                </p>
            </div>
        </div>

        {/* Attractions Grid */}
        <div className="py-4">
            <div className="flex items-center gap-3 mb-8 px-2">
                 <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                   <Camera className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                 </div>
                 <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Must-Visit Spots</h3>
            </div>
           
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.attractions.map((attraction, idx) => (
                    <div key={idx} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                        <div className="h-64 overflow-hidden bg-slate-200 dark:bg-slate-800 relative">
                            <img 
                                src={getImageUrl(`${attraction.name} ${data.city}`, 600, 600)} 
                                alt={attraction.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                             <div className="absolute bottom-5 left-6 right-4">
                                <h4 className="font-bold text-2xl text-white mb-1 shadow-black drop-shadow-lg leading-tight">{attraction.name}</h4>
                            </div>
                        </div>
                        <div className="p-8 flex-grow">
                            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed font-medium">{attraction.benefit}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Itinerary */}
        <div className="py-4">
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                   <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Your {days}-Day Itinerary</h3>
            </div>
            
            <div className="space-y-6">
                {data.itinerary.map((day) => (
                    <div key={day.day} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/20 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all relative overflow-hidden">
                         {/* Decorative day number bg */}
                        <div className="absolute -right-6 -top-6 text-9xl font-black text-slate-100 dark:text-slate-800 select-none pointer-events-none opacity-50">
                          {day.day}
                        </div>

                        <div className="flex items-center mb-8 relative z-10">
                            <span className="bg-orange-500 text-white font-extrabold px-6 py-2 rounded-full text-lg shadow-md shadow-orange-500/20">
                                Day {day.day}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                            {/* Connector Line for Desktop */}
                            <div className="hidden lg:block absolute top-4 bottom-4 left-1/3 w-px bg-slate-200 dark:bg-slate-700/50 -ml-4"></div>
                            <div className="hidden lg:block absolute top-4 bottom-4 left-2/3 w-px bg-slate-200 dark:bg-slate-700/50 -ml-4"></div>

                            <div className="relative group p-4 rounded-2xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                       <Sun className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Morning</div>
                                </div>
                                <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed">{day.morning}</p>
                            </div>
                            <div className="relative group p-4 rounded-2xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                       <Sun className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Afternoon</div>
                                </div>
                                <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed">{day.afternoon}</p>
                            </div>
                            <div className="relative group p-4 rounded-2xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                        <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Evening</div>
                                </div>
                                <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed">{day.evening}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Tips & Safety Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Local Tips */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2.5rem] p-8 sm:p-10 border border-white/20 dark:border-slate-700 shadow-xl h-full">
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    Local Essentials
                </h3>
                <div className="space-y-8">
                    <div className="flex gap-5 group">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl h-fit shadow-sm group-hover:scale-110 transition-transform">
                            <Train className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">Getting Around</h4>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{data.local_tips.transport}</p>
                        </div>
                    </div>
                    <div className="flex gap-5 group">
                         <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl h-fit shadow-sm group-hover:scale-110 transition-transform">
                            <Utensils className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">Food Scene</h4>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{data.local_tips.food}</p>
                        </div>
                    </div>
                     <div className="flex gap-5 group">
                         <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl h-fit shadow-sm group-hover:scale-110 transition-transform">
                            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">Culture & Etiquette</h4>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{data.local_tips.culture}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zones */}
            <div className="bg-red-50/90 dark:bg-red-950/20 backdrop-blur-md rounded-[2.5rem] p-8 sm:p-10 border border-red-100 dark:border-red-900/30 shadow-xl h-full">
                <h3 className="text-2xl font-bold text-red-900 dark:text-red-400 mb-8 flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    Safety First
                </h3>
                 <div className="space-y-6">
                     <div className="bg-white/80 dark:bg-black/30 p-6 rounded-2xl border border-red-50 dark:border-red-900/20">
                         <h4 className="font-bold text-slate-800 dark:text-red-200 text-lg mb-2">General Advisory</h4>
                         <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{data.local_tips.safety}</p>
                     </div>
                     
                     {data.danger_zones.length > 0 && (
                         <div>
                            <h4 className="font-bold text-red-900 dark:text-red-300 text-lg mb-4 px-2 tracking-wide uppercase text-xs">Cautionary Areas</h4>
                            <div className="space-y-4">
                                {data.danger_zones.map((zone, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm flex items-start gap-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                        <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-xl mt-1 min-w-[36px] min-h-[36px] flex items-center justify-center">
                                          <span className="text-red-600 dark:text-red-300 font-bold text-sm">{i+1}</span>
                                        </div>
                                        <div>
                                          <div className="font-bold text-slate-900 dark:text-red-100 text-lg">{zone.area}</div>
                                          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{zone.reason}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>
                     )}
                 </div>
            </div>
        </div>
        
        {/* Booking CTA Section - Floating Style Bottom */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
               <Plane className="w-64 h-64" />
            </div>
            
            <div className="space-y-4 max-w-2xl relative z-10">
                <h3 className="text-3xl md:text-4xl font-black tracking-tight">Ready for {data.city}?</h3>
                <p className="text-blue-100 text-lg font-medium leading-relaxed">Book your flights, hotels, and experiences now to get the best {budget.toLowerCase()} deals.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
                 <button 
                    onClick={() => openBookingLink('flights')}
                    className="flex items-center justify-center px-8 py-5 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 group"
                 >
                    <Plane className="w-5 h-5 mr-3 group-hover:-rotate-12 transition-transform" /> Find Flights
                 </button>
                  <button 
                    onClick={() => openBookingLink('hotels')}
                    className="flex items-center justify-center px-8 py-5 bg-indigo-900/40 hover:bg-indigo-900/60 text-white border-2 border-indigo-400/30 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 backdrop-blur-sm"
                 >
                    <Building className="w-5 h-5 mr-3" /> Find Hotels
                 </button>
                 <button 
                    onClick={() => openBookingLink('trains')}
                    className="flex items-center justify-center px-6 py-5 bg-transparent hover:bg-white/10 text-white rounded-2xl font-bold text-lg transition-all"
                 >
                    <Ticket className="w-5 h-5" />
                 </button>
            </div>
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen relative font-sans selection:bg-blue-500 selection:text-white transition-colors duration-500">
      {/* Dynamic Background Image */}
      <div className="fixed inset-0 z-0">
         <img 
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
            alt="Background"
            className={`w-full h-full object-cover transition-opacity duration-1000 ${darkMode ? 'opacity-20' : 'opacity-100'}`}
         />
         <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-1000 ${darkMode ? 'from-slate-950/80 via-slate-950/90 to-slate-950' : 'from-blue-50/40 via-white/60 to-slate-100/90'}`}></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        {/* Dark Mode Toggle */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="fixed top-5 right-4 md:right-8 z-50 p-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-lg border border-white/20 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-110 active:scale-95"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} className="fill-current" /> : <Moon size={20} className="fill-current" />}
        </button>

        <main className="flex-grow w-full">
          {isLoading && <LoadingScreen message={loadingMessage} />}
          
          {!isLoading && (
            <>
              {appState === AppState.SELECT_COUNTRY && renderCountrySelection()}
              {appState === AppState.SELECT_CITY && renderCitySelection()}
              {appState === AppState.VIEW_GUIDE && renderGuide()}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;