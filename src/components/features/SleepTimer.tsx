import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Moon, X } from "lucide-react";
import { toast } from "sonner";
import PremiumFeatureGate from "@/components/subscription/PremiumFeatureGate";

const timerOptions = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
];

const SleepTimer = () => {
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            toast.info("Sleep timer ended. Music will stop now.");
            setActiveTimer(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [remainingTime]);

  const startTimer = (minutes: number) => {
    setActiveTimer(minutes);
    setRemainingTime(minutes * 60);
    toast.success(`Sleep timer set for ${minutes} minutes`);
  };

  const cancelTimer = () => {
    setActiveTimer(null);
    setRemainingTime(0);
    toast.info("Sleep timer cancelled");
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <PremiumFeatureGate featureName="Sleep Timer">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            Sleep Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTimer ? (
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-primary">{formatTime(remainingTime)}</div>
              <p className="text-sm text-muted-foreground">Music will stop after the timer ends</p>
              <Button variant="destructive" onClick={cancelTimer} className="gap-2">
                <X className="w-4 h-4" />
                Cancel Timer
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {timerOptions.map((option) => (
                <Button
                  key={option.minutes}
                  variant="outline"
                  onClick={() => startTimer(option.minutes)}
                  className="gap-2"
                >
                  <Timer className="w-4 h-4" />
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PremiumFeatureGate>
  );
};

export default SleepTimer;
