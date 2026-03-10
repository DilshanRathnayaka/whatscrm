import React from 'react';
interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'away' | 'offline';
  className?: string;
}
const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg'
};
const statusDotSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5'
};
const statusColors = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-400'
};
function getInitials(name: string): string {
  return name.
  split(' ').
  map((n) => n[0]).
  slice(0, 2).
  join('').
  toUpperCase();
}
function getAvatarColor(name: string): string {
  const colors = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-rose-500'];

  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}
export function Avatar({
  src,
  name,
  size = 'md',
  status,
  className = ''
}: AvatarProps) {
  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src ?
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`} /> :


      <div
        className={`${sizeClasses[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center text-white font-semibold`}>

          {getInitials(name)}
        </div>
      }
      {status &&
      <span
        className={`absolute bottom-0 right-0 ${statusDotSizes[size]} ${statusColors[status]} rounded-full border-2 border-[var(--card-bg)]`} />

      }
    </div>);

}