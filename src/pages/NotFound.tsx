import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
    setTimeout(() => setVisible(true), 100);
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 3000);
    return () => clearInterval(id);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden grid-bg">
      {/* Corner decorators */}
      <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-primary/40" />
      <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-primary/40" />
      <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-primary/20" />
      <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-primary/20" />

      {/* Watermark */}
      <div
        className="absolute font-display-alt text-[14rem] md:text-[20rem] leading-none text-transparent pointer-events-none select-none"
        style={{ WebkitTextStroke: '1px hsl(180, 100%, 50%)', opacity: 0.03 }}
      >
        404
      </div>

      <div
        className={`relative z-10 text-center px-6 max-w-lg transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Status badge */}
        <div className="inline-flex items-center gap-2 border border-destructive/40 bg-destructive/5 px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 bg-destructive rounded-full animate-pulse-glow" />
          <span className="text-[10px] font-mono-space text-destructive tracking-[0.35em]">SYSTEM ERROR · ROUTE NOT FOUND</span>
        </div>

        {/* 404 number */}
        <div
          className="font-display text-[7rem] md:text-[10rem] leading-none text-primary mb-2"
          style={{
            filter: glitch
              ? 'drop-shadow(3px 0 0 hsl(0,100%,55%)) drop-shadow(-3px 0 0 hsl(180,100%,50%))'
              : 'drop-shadow(0 0 20px hsl(180, 100%, 50%))',
            transition: 'filter 0.1s',
          }}
        >
          404
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <AlertTriangle size={14} className="text-destructive" />
          <p className="font-display text-sm md:text-base tracking-wider text-foreground">
            PAGE NOT FOUND
          </p>
        </div>

        <p className="font-body text-xs text-muted-foreground mb-3 leading-relaxed">
          The route <span className="font-mono-space text-primary">{location.pathname}</span> does not exist in this system.
        </p>
        <p className="font-body text-xs text-muted-foreground mb-10 leading-relaxed">
          The page may have been moved, deleted, or you may have typed the address incorrectly.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/home')}
            className="clip-angled bg-primary text-primary-foreground px-8 py-3 font-display text-sm tracking-widest hover:glow-cyan transition-shadow cursor-pointer flex items-center justify-center gap-2"
          >
            <Home size={14} />
            RETURN HOME
          </button>
          <button
            onClick={() => navigate(-1)}
            className="clip-angled border border-primary/50 text-primary px-8 py-3 font-display text-sm tracking-widest hover:bg-primary/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            GO BACK
          </button>
        </div>

        <div className="mt-10 text-[8px] font-mono-space text-muted-foreground/40 tracking-widest">
          AVERTI SAFETY SYSTEMS · ERROR CODE 404
        </div>
      </div>
    </div>
  );
};

export default NotFound;
