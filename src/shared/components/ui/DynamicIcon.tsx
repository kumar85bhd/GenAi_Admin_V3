import React from 'react';
import * as LucideIcons from 'lucide-react';

interface DynamicIconProps extends Omit<React.ComponentProps<'svg'>, 'ref'> {
  name: string;
  size?: number | string;
  color?: string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, size = 24, color = 'currentColor', className, ...props }) => {
  // Convert string like "file-text" or "FileText" to PascalCase "FileText"
  const formattedName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  const IconComponent = (LucideIcons as any)[formattedName];

  if (!IconComponent) {
    // Fallback icon if the requested one is not found
    const FallbackIcon = LucideIcons.Box;
    return <FallbackIcon size={size} color={color} className={className} {...props} />;
  }

  return <IconComponent size={size} color={color} className={className} {...props} />;
};
