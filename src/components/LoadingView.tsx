import { useState, useEffect } from "react";

const steps = [
  "Identifying card",
  "Examining centering",
  "Examining corners",
  "Examining edges",
  "Examining surface",
];

export default function LoadingView() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSlowMessage(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
      <p className="text-foreground font-medium text-lg mb-8">Analyzing your card...</p>
      <div className="space-y-3 w-full max-w-xs">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-3 text-sm">
            {i < currentStep ? (
              <span className="score-green text-sm">✓</span>
            ) : i === currentStep ? (
              <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
            ) : (
              <span className="w-2 h-2" />
            )}
            <span className={i <= currentStep ? "text-foreground" : "text-muted-foreground"}>
              {step}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-8 w-full max-w-xs">
        <div className="progress-track">
          <div
            className="progress-fill bg-foreground"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              transition: "width 1.5s ease-out",
            }}
          />
        </div>
      </div>
      {showSlowMessage && (
        <p className="mt-6 text-sm text-muted-foreground animate-fade-in">
          Still analyzing — this can take up to 30 seconds
        </p>
      )}
    </div>
  );
}
