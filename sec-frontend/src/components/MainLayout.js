import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <Box component="main" sx={{ mt: 8, minHeight: '80vh' }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
      <Footer />
    </>
  );
}
