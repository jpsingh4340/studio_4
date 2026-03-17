/**
 * Gradient Button Component
 * Modern, animated button with gradient backgrounds
 */

import React from 'react';
import { Button } from '@mui/material';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const GradientButton = ({
  children,
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  variant = 'contained',
  fullWidth = false,
  onClick,
  disabled = false,
  startIcon,
  endIcon,
  size = 'medium',
  ...props
}) => {
  const sizeStyles = {
    small: {
      padding: '8px 16px',
      fontSize: '0.813rem',
    },
    medium: {
      padding: '12px 28px',
      fontSize: '0.875rem',
    },
    large: {
      padding: '14px 32px',
      fontSize: '1rem',
    },
  };

  return (
    <MotionButton
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      variant={variant}
      fullWidth={fullWidth}
      onClick={onClick}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        ...sizeStyles[size],
        background: variant === 'contained' ? gradient : 'transparent',
        border: variant === 'outlined' ? `2px solid transparent` : 'none',
        backgroundOrigin: 'border-box',
        backgroundClip: variant === 'outlined' ? 'padding-box, border-box' : 'padding-box',
        color: variant === 'contained' ? '#fff' : 'inherit',
        fontWeight: 700,
        borderRadius: 3,
        textTransform: 'none',
        boxShadow: variant === 'contained' ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          background: variant === 'contained' ? gradient : 'transparent',
          boxShadow: variant === 'contained' ? '0 8px 20px rgba(102, 126, 234, 0.5)' : 'none',
          opacity: 0.95,
        },
        '&:disabled': {
          background: '#e2e8f0',
          color: '#94a3b8',
          boxShadow: 'none',
        },
        ...(variant === 'outlined' && {
          backgroundImage: `linear-gradient(white, white), ${gradient}`,
          '&:hover': {
            backgroundImage: `linear-gradient(white, white), ${gradient}`,
          },
        }),
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </MotionButton>
  );
};

export default GradientButton;
