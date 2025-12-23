import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      <LandingNavbar
        onLoginClick={() => navigate("/login")}
        onGetStartedClick={() => navigate("/login")}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center max-w-5xl mx-auto w-full">
        <HeroSection
          onStartClick={() => navigate("/login")}
          onDemoClick={() => navigate("/demo")}
        />

        <FeaturesSection />
      </main>

      <LandingFooter />
    </div>
  );
}
