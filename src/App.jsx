import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import CharacterListPage from './pages/CharacterListPage';
import QuickRollPage from './pages/QuickRollPage';
import CreateCharacterPage from './pages/CreateCharacterPage';
import CharacterDetailPage from './pages/CharacterDetailPage';
import SpellLibraryPage from './pages/SpellLibraryPage';
import WeaponLibraryPage from './pages/WeaponLibraryPage';
import NewWeaponPage from './pages/NewWeaponPage';
import EditWeaponPage from './pages/EditWeaponPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
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
    <AuthProvider>
      <BrowserRouter>
        <div className='app min-h-screen'>
          <Navbar />
          <main className='container mx-auto px-4 py-8'>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/characters" element={
                <ProtectedRoute>
                  <CharacterListPage />
                </ProtectedRoute>
              } />
              <Route path="/characters/:id" element={
                <ProtectedRoute>
                  <CharacterDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/roll" element={<QuickRollPage />} />
              <Route path="/characters/new" element={
                <ProtectedRoute>
                  <CreateCharacterPage />
                </ProtectedRoute>
              } />
              <Route path="/weapons/library" element={<WeaponLibraryPage />} />
              <Route path="/weapons/new" element={<NewWeaponPage />} />
              <Route path="/weapons/edit/:id" element={<EditWeaponPage />} />
              <Route path="/spells/library" element={<SpellLibraryPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App