import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../lib/firebase";
// import { signInWithPopup } from "firebase/auth";
import { signInWithRedirect } from "firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const Auth = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to submission page if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/submission");
    }
    else{
      setIsSigningIn(false)
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;

    try {
      setIsSigningIn(true);
      await signInWithRedirect(auth, provider);
      // Backend authentication is handled by AuthContext
      // Navigation happens automatically when isAuthenticated becomes true
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error(error.message || "Failed to sign in. Please try again.");
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
      {/* Animated Background Gradient - Fixed */}
      <div className="fixed inset-0 bg-linear-to-br from-grey-800 via-grey-900 to-black animate-gradient" />

      {/* Background Image with Ken Burns effect - Fixed */}
      <motion.img
        src="./Auth_back.png"
        alt="background"
        className="fixed inset-0 w-full h-full object-cover opacity-50"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Gradient Overlay - Fixed */}
      <div className="fixed inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />

      {/* Floating Particles Effect - Fixed */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_50%)] animate-pulse" />

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10"
      >
        <Card className="w-[full] backdrop-blur-md bg-white/50 border border-white/10 shadow-2xl">
          <CardHeader className="space-y-6 text-center pt-8 pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
            >
              <div className="w-80 h-32 p-10 mx-auto rounded-xl flex items-center justify-center">
                <img
                  src="./main_logo1.png"
                  className="w-80 h-auto"
                />
              </div>
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-linear-to-r from-black to-black/80 bg-clip-text text-transparent mb-0 pb-2">
              SatHack Submission Portal
            </CardTitle>
            <h6 className=" text-grey-900">Only team leaders can login</h6>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="w-full h-14 bg-white hover:bg-white/80 text-black hover:backdrop-blur-sm text-lg font-medium flex items-center justify-center gap-3 transition-all duration-300 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn || isLoading}
              >
                <FcGoogle className="w-7 h-7" />
                <span className="ml-2">
                  {isSigningIn ? "Signing in..." : "Continue with Google"}
                </span>
              </Button>
            </motion.div>
            <p className="text-white/60 text-center text-sm px-6">
              By continuing, you agree to our{" "}
              <a
                href="#"
                className="text-white/80 hover:text-white underline decoration-dotted"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-white/80 hover:text-white underline decoration-dotted"
              >
                Privacy Policy
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
