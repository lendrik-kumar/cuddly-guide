// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { authenticateUserWithToken, logoutUser as apiLogout, getAbout } from '../services/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teamData, setTeamData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // firebaseUser is null when signed out
      if (!firebaseUser) {
        setUser(null);
        setIsAuthenticated(false);
        setTeamData(null);
        setIsLoading(false);
        return;
      }

      // firebaseUser exists
      setIsLoading(true);
      try {
        // 1) Check backend session first (maybe cookie already exists)
        const about = await getAbout().catch(() => null);
        if (about && about.data && about.data.data) {
          // backend session exists
          setUser(about.data.data);
          setIsAuthenticated(true);
          setTeamData(about.data.data || null);
          setIsLoading(false);
          return;
        }

        // 2) No backend session: get ID token and authenticate backend
        const idToken = await firebaseUser.getIdToken(/* forceRefresh */ false);

        const authResponse = await authenticateUserWithToken(idToken);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          teamId: authResponse.teamId,
          ...authResponse,
        });
        setTeamData(authResponse || null);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Backend authentication failed:', error);

        // Decide to sign out only for clear unauthorized cases
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          // definite authorization failure — sign out
          try {
            await auth.signOut();
          } catch (e) {
            console.error('Error signing out after backend rejection:', e);
          }
          setUser(null);
          setIsAuthenticated(false);
          setTeamData(null);
          toast.error(
            error.response?.data?.error ||
              'Unauthorized — only team leaders may access the portal.'
          );
        } else {
          // transient or unknown error — don't immediately sign out to avoid loop
          toast.error(
            error.response?.data?.error ||
              'Could not validate session with backend. Please try again.'
          );
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout API error:', err);
    }
    try {
      await auth.signOut();
    } catch (err) {
      console.error('Firebase signOut error:', err);
    }
    setUser(null);
    setIsAuthenticated(false);
    setTeamData(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    teamData,
    setTeamData,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};