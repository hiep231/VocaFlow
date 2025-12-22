export function LandingFooter() {
  return (
    <footer className="w-full py-8 border-t border-slate-200 dark:border-slate-800 mt-auto bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} VocaFlow. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-indigo-600 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-indigo-600 transition-colors">
            Terms
          </a>
          <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800">
            <span>Built with ❤️ by</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Hiep DT
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
