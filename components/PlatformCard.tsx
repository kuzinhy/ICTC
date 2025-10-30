import React from 'react';
import type { Platform } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface PlatformCardProps {
  platform: Platform;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({ platform }) => {
  const { name, description, logo: Logo, mainLink, accentColor, accentBorderColor, subLinks } = platform;

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${accentBorderColor}`}>
      <div className="p-6 sm:p-8">
        <div className="flex items-center mb-5">
          <Logo className="h-10 w-10 mr-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">{name}</h2>
        </div>
        <p className="text-gray-400 mb-6 min-h-[6rem] leading-relaxed">{description}</p>
        
        <a
          href={mainLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${accentColor} transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white`}
        >
          Visit {name}
          <ExternalLinkIcon className="w-5 h-5 ml-2" />
        </a>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Related Services</h3>
          <ul className="space-y-3">
            {subLinks.map((link) => (
              <li key={link.title}>
                <a 
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-white group transition-colors duration-200 rounded-md p-2 -m-2 hover:bg-white/10"
                >
                  <ExternalLinkIcon className="w-4 h-4 mr-3 text-gray-500 group-hover:text-cyan-400 transition-colors duration-200" />
                  <span>{link.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
