import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { authenticateUser, logoutUser as apiLogout } from '../services/authService';
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
      if (firebaseUser) {
        try {
          setIsLoading(true);
          // Authenticate with backend
          const authResponse = await authenticateUser(
            firebaseUser.uid,
            firebaseUser.email
          );
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            teamId: authResponse.teamId,
            ...authResponse,
          });
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Backend authentication failed:', error);
          // Sign out from Firebase if backend auth fails
          await auth.signOut();
          setUser(null);
          setIsAuthenticated(false);
          setTeamData(null);
          
          // Show user-friendly error message
          let errorMessage = "Only team leaders can access this portal.";

          if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (Array.isArray(error.response?.data?.details)) {
            errorMessage = error.response.data.details.join(", ");
          } else if (typeof error.response?.data === "string") {
            errorMessage = error.response.data;
          }

          toast.error(errorMessage);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setTeamData(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await apiLogout();
      await auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setTeamData(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still sign out from Firebase even if API call fails
      await auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setTeamData(null);
    }
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

