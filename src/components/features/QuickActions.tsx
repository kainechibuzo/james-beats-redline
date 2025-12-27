import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle, Radio, Sparkles, Headphones, Mic2, Disc } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { label: "Shuffle Play", icon: Shuffle, path: "/home", color: "bg-green-500" },
  { label: "DJ Mode", icon: Radio, path: "/dj", color: "bg-purple-500" },
  { label: "Discover", icon: Sparkles, path: "/search", color: "bg-blue-500" },
  { label: "Focus Mode", icon: Headphones, path: "/home", color: "bg-amber-500" },
  { label: "Karaoke", icon: Mic2, path: "/home", color: "bg-pink-500" },
  { label: "Albums", icon: Disc, path: "/library", color: "bg-cyan-500" },
];

const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {actions.map((action) => (
            <Link key={action.label} to={action.path}>
              <Button variant="outline" className="w-full flex flex-col items-center gap-2 h-auto py-4">
                <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
