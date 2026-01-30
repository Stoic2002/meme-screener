import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header, Tabs } from './components/layout';
import { ToastContainer } from './components/common';
import { WalletContextProvider } from './contexts/WalletContextProvider';
import { PumpDetector, CoinDetail, Watchlist, Trending } from './pages';

function App() {
  return (
    <WalletContextProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
          <Header />
          <Tabs />
          <Routes>
            <Route path="/" element={<PumpDetector />} />
            <Route path="/coin/:address" element={<CoinDetail />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/trending" element={<Trending />} />
          </Routes>
          <ToastContainer />
        </div>
      </BrowserRouter>
    </WalletContextProvider>
  );
}

export default App;
