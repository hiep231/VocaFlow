import { Button } from "@/components/ui/button";

interface LandingNavbarProps {
  onLoginClick: () => void;
  onGetStartedClick: () => void;
}

export function LandingNavbar({
  onLoginClick,
  onGetStartedClick,
}: LandingNavbarProps) {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
      <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
          V
        </div>
        VocaFlow
      </div>
      <div className="flex gap-4">
        <Button variant="ghost" onClick={onLoginClick}>
          Login
        </Button>
        <Button onClick={onGetStartedClick}>Get Started</Button>
      </div>
    </nav>
  );
}
