import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { authenticateUser, logoutUser as apiLogout } from '../services/authService';
import { toast } from 'react-toastify';
import { getRedirectResult } from 'firebase/auth';

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
  const authAttemptRef = useRef(null); // Track auth attempts to prevent loops

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

    try {
      const redirectResult = await getRedirectResult(auth);

      if (redirectResult?.user) {
        console.log("[AUTH] Redirect sign-in successful");
      }
    } catch (err) {
      console.error("Redirect auth error:", err);
    }


      if (firebaseUser) {
        // Prevent infinite loop: if we're already processing this user, skip
        const currentUid = firebaseUser.uid;
        if (authAttemptRef.current === currentUid) {
          console.log('[AUTH] Skipping duplicate auth attempt for:', currentUid);
          return;
        }

        try {
          setIsLoading(true);
          authAttemptRef.current = currentUid; // Mark this UID as being processed
          
          // Authenticate with backend
          const authResponse = await authenticateUser(
            firebaseUser.uid,
            firebaseUser.email
          );
          
          // Clear the attempt ref on success
          authAttemptRef.current = null;
          
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
          
          // Clear the attempt ref before signing out
          authAttemptRef.current = null;
          
          // Determine if this is a permanent error (403) or temporary (401/network)
          const isPermanentError = error.response?.status === 403;
          const isAuthError = error.response?.status === 401;
          
          // Only sign out from Firebase for permanent errors (403) or if explicitly needed
          // For 401 (session issues), don't sign out immediately to prevent loop
          if (isPermanentError) {
            // Permanent rejection (not a team leader, etc.) - sign out
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
          } else if (isAuthError) {
            // Session/token issue - clear state but don't sign out from Firebase
            // This prevents the loop while allowing user to retry
            setUser(null);
            setIsAuthenticated(false);
            setTeamData(null);
            
            // Only show error if it's not a silent retry
            if (!error.response?.data?.details?.includes('No session token')) {
              toast.error("Session expired. Please sign in again.");
            }
          } else {
            // Network or other errors - don't sign out, just clear state
            setUser(null);
            setIsAuthenticated(false);
            setTeamData(null);
            toast.error("Authentication failed. Please try again.");
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        // User signed out - clear everything
        authAttemptRef.current = null;
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

