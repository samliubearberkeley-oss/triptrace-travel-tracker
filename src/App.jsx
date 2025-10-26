import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import UploadForm from './components/UploadForm';
import TravelGallery from './components/TravelGallery';
import TravelHistory from './components/TravelHistory';
import { insforge, getCurrentUser, getSession } from './lib/insforge';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('gallery'); // 'gallery', 'upload', 'history'
  const [refreshGallery, setRefreshGallery] = useState(0);

  useEffect(() => {
    // Handle OAuth callback
    const handleOAuthCallback = async () => {
      // Check for OAuth callback in URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken) {
        console.log('OAuth callback detected, establishing session...');
        
        // Give the SDK time to process and store the OAuth tokens
        // The SDK automatically handles token storage
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Clear the hash from URL for security and cleanliness
        window.history.replaceState(null, '', window.location.pathname);
      }
      
      // Check user authentication status
      await checkUser();
    };

    handleOAuthCallback();
  }, []);

  const checkUser = async () => {
    const session = getSession();
    if (session) {
      const { data } = await getCurrentUser();
      if (data?.user) {
        setUser(data.user);
      }
    }
    setLoading(false);
  };

  const handleAuthSuccess = async () => {
    await checkUser();
  };

  const handleSignOut = async () => {
    await insforge.auth.signOut();
    setUser(null);
    setCurrentView('gallery');
  };

  const handleUploadSuccess = () => {
    setCurrentView('gallery');
    setRefreshGallery(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app">
      <header className="app-header triptrace-header">
        <div className="header-content">
          <h1 className="triptrace-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="logo-icon">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
              <path d="M12 2v8" strokeWidth="1" opacity="0.5"/>
            </svg>
            <span className="logo-text">TripTrace</span>
            <span className="logo-subtitle"> </span>
          </h1>
          <div className="header-actions">
            <button 
              className="btn btn-primary btn-glow"
              onClick={() => setCurrentView('upload')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Journey
            </button>
            <button 
              className="btn btn-secondary btn-glass"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${currentView === 'gallery' ? 'active' : ''}`}
          onClick={() => setCurrentView('gallery')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          Gallery
        </button>
        <button
          className={`nav-btn ${currentView === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentView('history')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          History
        </button>
      </nav>

      <main className="app-main">
        {currentView === 'upload' && <UploadForm onUploadSuccess={handleUploadSuccess} />}
        {currentView === 'gallery' && <TravelGallery refresh={refreshGallery} />}
        {currentView === 'history' && <TravelHistory />}
      </main>

      <footer className="app-footer">
        <p>Built with InsForge • Capture your adventures</p>
      </footer>
    </div>
  );
}

export default App;
