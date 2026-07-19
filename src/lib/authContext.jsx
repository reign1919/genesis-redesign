import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [school, setSchool] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('genesis-school-session');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSchool(parsed);
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.error('Failed to parse school session from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = (schoolData) => {
    const dataToStore = {
      schoolCode: schoolData.schoolCode || schoolData.school_code,
      schoolName: schoolData.schoolName || schoolData.school_name,
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem('genesis-school-session', JSON.stringify(dataToStore));
    setSchool(dataToStore);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('genesis-school-session');
    setSchool(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ school, isLoggedIn, isLoaded, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
