import { User } from 'lucide-react'
import type { AvatarProps } from '@/types/components'

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
}

export function Avatar({ url, alt, size = 'md', className = '' }: AvatarProps): JSX.Element {
  const classes = `relative flex items-center justify-center overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 ${sizeClasses[size]} ${className}`

  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        className={`${classes} object-cover`}
        loading="lazy"
      />
    )
  }

  return (
    <div className={classes} aria-label={alt}>
      <User className="h-1/2 w-1/2 text-cinza" />
    </div>
  )
}
