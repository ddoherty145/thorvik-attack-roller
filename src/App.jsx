import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import HomePage from './pages/HomePage';
import CharacterListPage from './pages/CharacterListPage';
import QuickRollPage from './pages/QuickRollPage';
import CreateCharacterPage from './pages/CreateCharacterPage';
import CharacterDetailPage from './pages/CharacterDetailPage';
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
        <Navbar />
        <main className='container mx-auto px-4 py-8'>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/characters" element={<CharacterListPage />} />
            <Route path="/characters/:id" element={<CharacterDetailPage />} />
            <Route path="/roll" element={<QuickRollPage />} />
            <Route path="/characters/new" element={<CreateCharacterPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App