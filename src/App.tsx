import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Storefront } from './components/Storefront';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/:restaurantId" element={<Storefront />} />
          <Route path="/:restaurantId/admin" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
