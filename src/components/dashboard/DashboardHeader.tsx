import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, X, Home, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface DashboardHeaderProps {
  onLogout: () => void;
}

export function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  const { currentUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-2">
            {/* Mobile Sidebar Toggle - Left Side */}
            <div className="md:hidden mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 -ml-2"
              >
                <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
              </Button>
            </div>

            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg pointer-events-none select-none">
              V
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white hidden sm:block">
              VocaFlow
            </span>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              My Decks
            </Link>
            <Link
              to="/library"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Public Library
            </Link>
          </nav>

          {/* Right: User Profile (Always Visible) */}
          <div className="flex items-center gap-3 md:gap-4">
            {currentUser && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden md:block">
                  Hello, {currentUser.displayName || "Learner"}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full cursor-pointer overflow-hidden p-0 border border-slate-200 dark:border-slate-800"
                    >
                      <Avatar className="h-full w-full">
                        <AvatarImage
                          src={currentUser.photoURL || ""}
                          alt={currentUser.displayName || "User"}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                          {(currentUser.displayName || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {currentUser.displayName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {currentUser.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onLogout}
                      className="text-red-600 dark:text-red-400 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar (Fixed Overlay) - Moved outside header to avoid stacking context issues */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-slate-950 z-[100] shadow-2xl border-r border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    V
                  </div>
                  <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                    VocaFlow
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                  className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </Button>
              </div>

              <nav className="flex-1 p-4 space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium"
                >
                  <Home className="w-5 h-5" />
                  My Decks
                </Link>
                <Link
                  to="/library"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium"
                >
                  <BookOpen className="w-5 h-5" />
                  Public Library
                </Link>
              </nav>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                {currentUser && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-2">
                      <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                        <AvatarImage
                          src={currentUser?.photoURL || ""}
                          alt={currentUser?.displayName || "User"}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                          {(currentUser?.displayName || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {currentUser?.displayName || "Learner"}
                        </span>
                        <span className="text-xs text-slate-500 truncate max-w-[140px]">
                          {currentUser?.email}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        onLogout();
                        setIsSidebarOpen(false);
                      }}
                      className="w-full justify-start gap-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 border border-transparent dark:border-red-900/30"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
