
import React from 'react';

export interface SubLink {
  title: string;
  url: string;
}

export interface Platform {
  name: string;
  description: string;
  logo: React.FC<{ className?: string }>;
  mainLink: string;
  accentColor: string;
  accentBorderColor: string;
  subLinks: SubLink[];
}
