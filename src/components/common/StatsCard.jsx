/**
 * Stats Card Component
 * Beautiful, modern stats display with animations
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color = 'primary',
  trend,
  trendValue,
  gradient,
}) => {
  const theme = useTheme();

  const gradients = {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  };

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: gradient || gradients[color] || gradients.primary,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600, mb: 1 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: gradient || gradients[color] || gradients.primary,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    color: trend === 'up' ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {trend === 'up' ? '↑' : '↓'} {trendValue}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last month
                </Typography>
              </Box>
            )}
          </Box>
          {Icon && (
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: gradient || gradients[color] || gradients.primary,
                boxShadow: `0px 8px 16px ${
                  theme.palette[color]?.main || theme.palette.primary.main
                }40`,
              }}
            >
              <Icon sx={{ fontSize: 28 }} />
            </Avatar>
          )}
        </Box>
      </CardContent>
    </MotionCard>
  );
};

export default StatsCard;
