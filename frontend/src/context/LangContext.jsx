import { createContext, useCallback, useContext, useState } from 'react';

const dict = {
  en: {
    home: 'Home', properties: 'Properties', blog: 'Blog', contact: 'Contact', login: 'Log in', register: 'Sign up', logout: 'Log out',
    postProperty: 'Post a property', wishlist: 'Wishlist', myProperties: 'My properties', myOrders: 'My payments', profile: 'Profile',
    heroKicker: 'Bangladesh\'s smart home-finding platform', heroTitle: 'Find your dream home', heroTitle2: 'easily', heroSub: 'Flat, family home, sublet or bachelor seat. Search by what you need and find the right place.', heroCardTitle: 'Find your home', heroCardSub: 'Search by your preferences.', cityLabel: 'District', areaLabel: 'Area', typeLabel: 'Type', allAreas: 'All areas', allTypes: 'All types', maxRent: 'Max rent (৳)',
    searchPlaceholder: 'Search by area, road or keyword', allCities: 'All cities', search: 'Search',
    hotNew: 'Hot & new', trending: 'Trending now', bestRated: 'Best rated', latest: 'Latest listings', viewAll: 'View all',
    browseByCity: 'Browse by city', reviews: 'What people say', subscribe: 'Subscribe', subscribeTitle: 'Get new listings in your inbox',
    emailAddress: 'Email address', bed: 'Beds', bath: 'Baths', sqft: 'Area', perMonth: '/ month',
    noResults: 'No properties found', noResultsHint: 'Try changing or clearing some filters.', filters: 'Filters', clear: 'Clear',
    sort: 'Sort by', newest: 'Newest', priceLow: 'Price: low to high', priceHigh: 'Price: high to low',
    interested: "I'm interested", send: 'Send request', nearby: 'Nearby properties', details: 'Details', location: 'Location',
    readMore: 'Read more', footerAbout: 'Smart Tolet helps you find, list and rent homes with confidence.', quickLinks: 'Quick links',
  },
  bn: {
    home: 'হোম', properties: 'প্রপার্টি', blog: 'ব্লগ', contact: 'যোগাযোগ', login: 'লগইন', register: 'সাইন আপ', logout: 'লগআউট',
    postProperty: 'প্রপার্টি দিন', wishlist: 'পছন্দের তালিকা', myProperties: 'আমার প্রপার্টি', myOrders: 'আমার পেমেন্ট', profile: 'প্রোফাইল',
    heroKicker: 'বাংলাদেশের স্মার্ট বাসা খোঁজার প্ল্যাটফর্ম', heroTitle: 'আপনার স্বপ্নের বাসা', heroTitle2: 'খুঁজে নিন সহজেই', heroSub: 'বাসা, ফ্ল্যাট, সাবলেট কিংবা ব্যাচেলর সিট— আপনার প্রয়োজন অনুযায়ী খুঁজে নিন পছন্দের ঠিকানা।', heroCardTitle: 'আপনার বাসা খুঁজুন', heroCardSub: 'আপনার পছন্দ অনুযায়ী সার্চ করুন।', cityLabel: 'জেলা', areaLabel: 'এলাকা', typeLabel: 'বাসার ধরন', allAreas: 'সব এলাকা', allTypes: 'সব ধরনের', maxRent: 'সর্বোচ্চ ভাড়া (৳)',
    searchPlaceholder: 'এলাকা, রোড বা কীওয়ার্ড লিখুন', allCities: 'সব শহর', search: 'খুঁজুন',
    hotNew: 'হট ও নতুন', trending: 'ট্রেন্ডিং', bestRated: 'সেরা রেটিং', latest: 'সর্বশেষ লিস্টিং', viewAll: 'সব দেখুন',
    browseByCity: 'শহর অনুযায়ী দেখুন', reviews: 'মানুষ কী বলছে', subscribe: 'সাবস্ক্রাইব', subscribeTitle: 'নতুন লিস্টিং ইমেইলে পান',
    emailAddress: 'ইমেইল ঠিকানা', bed: 'বেড', bath: 'বাথ', sqft: 'এলাকা', perMonth: '/ মাস',
    noResults: 'কোনো প্রপার্টি পাওয়া যায়নি', noResultsHint: 'ফিল্টার পরিবর্তন বা মুছে চেষ্টা করুন।', filters: 'ফিল্টার', clear: 'মুছুন',
    sort: 'সাজান', newest: 'নতুন আগে', priceLow: 'দাম: কম থেকে বেশি', priceHigh: 'দাম: বেশি থেকে কম',
    interested: 'আমি আগ্রহী', send: 'অনুরোধ পাঠান', nearby: 'কাছাকাছি প্রপার্টি', details: 'বিস্তারিত', location: 'অবস্থান',
    readMore: 'আরও পড়ুন', footerAbout: 'বাড়িওয়ালা আপনাকে নিশ্চিন্তে বাসা খুঁজতে, দিতে ও ভাড়া নিতে সাহায্য করে।', quickLinks: 'দ্রুত লিংক',
  },
};

const LangContext = createContext(null);
export const useLang = () => useContext(LangContext);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('hr_lang') || 'en');

  const setLang = (l) => {
    localStorage.setItem('hr_lang', l);
    setLangState(l);
  };
  const t = useCallback((key) => dict[lang][key] ?? dict.en[key] ?? key, [lang]);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}
