/**
 * Skeleton Card Component
 * Loading placeholder for cards
 */

import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

const SkeletonCard = ({ variant = 'stats' }) => {
  if (variant === 'stats') {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Skeleton width="60%" height={24} sx={{ mb: 1 }} />
              <Skeleton width="40%" height={48} sx={{ mb: 1 }} />
              <Skeleton width="50%" height={20} />
            </Box>
            <Skeleton variant="circular" width={56} height={56} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'equipment') {
    return (
      <Card sx={{ height: '100%' }}>
        <Skeleton variant="rectangular" height={200} />
        <CardContent>
          <Skeleton width="80%" height={32} sx={{ mb: 1 }} />
          <Skeleton width="60%" height={24} sx={{ mb: 2 }} />
          <Box display="flex" gap={1} mb={2}>
            <Skeleton variant="rounded" width={80} height={28} />
            <Skeleton variant="rounded" width={80} height={28} />
          </Box>
          <Skeleton width="100%" height={40} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Skeleton width="100%" height={40} />
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;
