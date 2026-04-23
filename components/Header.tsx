'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, Menu } from 'lucide-react';
import { Input } from './ui/input';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-2 sm:px-3 md:px-4 py-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 shrink-0 min-w-0">
            <Link
              href="/"
              className="flex items-center min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm"
            >
              <Image
                src="/logo.png"
                alt="PickleSpot"
                width={500}
                height={200}
                className="h-8 sm:h-10 w-auto max-w-[140px] sm:max-w-[180px]"
                priority
              />
            </Link>
            <p className="hidden md:block text-xs text-gray-500 leading-snug max-w-[9rem] border-l border-gray-200 pl-3">
              Find courts near you
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex-1 min-w-0 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by location, court name, or zip code..."
              className="pl-10 pr-4 py-6 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Location & Menu */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Use my location</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}