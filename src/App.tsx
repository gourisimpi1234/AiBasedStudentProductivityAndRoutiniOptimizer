import { useState, useEffect } from "react";
import { AnimatedLogoScreen } from "./components/AnimatedLogoScreen";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"logo" | "welcome" | "auth" | "dashboard">("logo");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("currentUser");
    if (user) {
      setIsAuthenticated(true);
      setCurrentScreen("dashboard");
    } else {
      // Show logo for 3 seconds, then welcome screen
      const timer = setTimeout(() => {
        setCurrentScreen("welcome");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleWelcomeContinue = () => {
    setCurrentScreen("auth");
  };

  const handleLogin = (email: string) => {
    localStorage.setItem("currentUser", email);
    setIsAuthenticated(true);
    setCurrentScreen("dashboard");
  };

  const handleLogout = () => {
    // Clear current session but keep user data for when they log back in
    localStorage.removeItem("currentUser");
    setIsAuthenticated(false);
    setCurrentScreen("auth");
    
    // Force page reload to clear all state and show fresh login
    window.location.reload();
  };

  if (currentScreen === "logo") {
    return <AnimatedLogoScreen />;
  }

  if (currentScreen === "welcome") {
    return <WelcomeScreen onContinue={handleWelcomeContinue} />;
  }

  if (currentScreen === "auth") {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}