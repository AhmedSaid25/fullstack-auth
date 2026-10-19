import { Box, Card, CardContent, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

// Centered card shared by the sign-in and sign-up pages
export function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }} elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
          {children}
        </CardContent>
      </Card>
    </Box>
  );
}
