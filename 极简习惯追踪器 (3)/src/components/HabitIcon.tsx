/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as Icons from 'lucide-react';

interface HabitIconProps {
  name: string;
  className?: string;
}

export const HabitIcon: React.FC<HabitIconProps> = ({ name, className }) => {
  // Safe dynamic lookup for lucide icons
  const IconComponent = (Icons as Record<string, any>)[name];
  
  if (IconComponent) {
    return <IconComponent className={className} id={`icon-${name}`} />;
  }

  // If it's an emoji or custom text character, render it directly
  return (
    <span
      className={`inline-flex items-center justify-center font-sans select-none select-none ${className || ''}`}
      style={{ 
        fontSize: '1.4rem', 
        lineHeight: 1,
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif'
      }}
      id={`emoji-${name}`}
    >
      {name}
    </span>
  );
};
