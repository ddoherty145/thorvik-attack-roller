import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import db from './services/db'

function App() {
  // Initialize Database
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await db.open();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error)
      }
    };

    initializeDatabase();

    return () => {
      db.close();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className='app min-h-screen'>
        {/* Navbar goes here */}
        <main className='container mx-auto px-4 py-8'>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App