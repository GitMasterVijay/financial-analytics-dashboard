 import { Avatar, type AvatarProps } from '@mui/material';
import { forwardRef, useEffect, useState } from 'react';
import { getAvatarFallback } from '../utils/userProfile';

export interface UserAvatarProps
  extends Omit<AvatarProps, 'src' | 'alt' | 'children'> {
  src?: string | null;
  userId?: string | null;
  size?: number;
  fontScale?: number;
}

const USER_AVATAR_COLORS: Record<string, string> = {
  user_001: '#6366f1', // Indigo
  user_002: '#10b981', // Green
  user_003: '#f59e0b', // Amber
  user_004: '#0ea5e9', // Blue
};

function resolveBgColor(userId: string | undefined | null): string {
  if (!userId) return '#475569';

  if (USER_AVATAR_COLORS[userId]) {
    return USER_AVATAR_COLORS[userId];
  }

  let hash = 0;

  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }

  const palette = [
    '#6366f1',
    '#10b981',
    '#f59e0b',
    '#0ea5e9',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#64748b',
  ];

  return palette[Math.abs(hash) % palette.length];
}

const UserAvatar = forwardRef<HTMLDivElement, UserAvatarProps>(
  function UserAvatar(
    {
      src,
      userId,
      size = 28,
      fontScale = 0.7,
      sx,
      className,
      ...rest
    },
    ref
  ) {
    const [imgFailed, setImgFailed] = useState(false);

    useEffect(() => {
      setImgFailed(false);
    }, [src]);

    const fallback = getAvatarFallback(userId);
    const bgColor = resolveBgColor(userId);

    const effectiveSrc = !imgFailed && src ? src : undefined;

    return (
      <Avatar
        ref={ref}
        src={effectiveSrc}
        alt={userId ? `${userId} profile` : 'user profile'}
        className={className}
        sx={{
          width: size,
          height: size,
          fontSize: `${Math.max(
            10,
            Math.floor(size * fontScale)
          )}px`,
          fontWeight: 500,
          bgcolor: bgColor,
          color: '#ffffff',
          flexShrink: 0,
          ...sx,
        }}
        slotProps={{
          img: {
            onError: () => {
              setImgFailed(true);
            },
          },
        }}
        {...rest}
      >
        {fallback}
      </Avatar>
    );
  }
);

export default UserAvatar;