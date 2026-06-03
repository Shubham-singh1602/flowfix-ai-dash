import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-rose-500 animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black font-mono tracking-tight text-slate-100">404</h1>
          <h2 className="text-lg font-bold text-slate-200">Route Telemetry Offline</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The target address <code className="px-1.5 py-0.5 bg-slate-950 rounded text-sky-400 font-mono text-[10px]">{location.pathname}</code> does not map to any active traffic nodes in our system.
          </p>
        </div>

        <Button asChild className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold">
          <a href="/">
            Return to Command Center
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;