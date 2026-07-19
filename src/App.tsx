import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Storefront } from './components/Storefront';

function AppContent() {
  const { view } = useStore();

  switch (view) {
    case 'landing':
      return <LandingPage />;
    case 'builder':
      return <Dashboard />;
    case 'customer':
      return <Storefront />;
    default:
      return <LandingPage />;
  }
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
