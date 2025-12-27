import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smile, Frown, Zap, Coffee, Heart, Moon, Sun, Cloud } from "lucide-react";

const moods = [
  { name: "Happy", icon: Smile, color: "bg-yellow-500" },
  { name: "Sad", icon: Frown, color: "bg-blue-500" },
  { name: "Energetic", icon: Zap, color: "bg-orange-500" },
  { name: "Chill", icon: Coffee, color: "bg-green-500" },
  { name: "Romantic", icon: Heart, color: "bg-pink-500" },
  { name: "Sleepy", icon: Moon, color: "bg-purple-500" },
  { name: "Motivated", icon: Sun, color: "bg-amber-500" },
  { name: "Melancholic", icon: Cloud, color: "bg-slate-500" },
];

interface MoodPlayerProps {
  onMoodSelect?: (mood: string) => void;
}

const MoodPlayer = ({ onMoodSelect }: MoodPlayerProps) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    onMoodSelect?.(mood);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smile className="w-5 h-5 text-primary" />
          How are you feeling?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {moods.map((mood) => (
            <Button
              key={mood.name}
              variant={selectedMood === mood.name ? "default" : "outline"}
              className="flex flex-col items-center gap-1 h-auto py-3"
              onClick={() => handleMoodSelect(mood.name)}
            >
              <div className={`w-8 h-8 rounded-full ${mood.color} flex items-center justify-center`}>
                <mood.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs">{mood.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodPlayer;
