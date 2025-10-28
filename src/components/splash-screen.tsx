import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-sky-400 to-blue-500 flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl tracking-wider">
            BE ORiGiNAL
          </h1>
          <h1 className="text-4xl tracking-wider">
            BUY ORiGiNAL
          </h1>
        </div>

        <div className="text-xl tracking-wide">
          Verify By
        </div>

        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <Shield className="w-24 h-24 stroke-[1.5]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-t-2 border-r-2 border-black transform rotate-45"></div>
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-5xl tracking-[0.3em]">
              S<span className="inline-block w-3"></span>E<span className="inline-block w-3"></span>N<span className="inline-block w-3"></span>S<span className="inline-block w-3"></span>E
            </h2>
            <h2 className="text-4xl tracking-wider">
              ORiGiNAL
            </h2>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
