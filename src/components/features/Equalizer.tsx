import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import PremiumFeatureGate from "@/components/subscription/PremiumFeatureGate";

const bands = [
  { name: "60Hz", default: 50 },
  { name: "170Hz", default: 50 },
  { name: "310Hz", default: 50 },
  { name: "600Hz", default: 50 },
  { name: "1kHz", default: 50 },
  { name: "3kHz", default: 50 },
  { name: "6kHz", default: 50 },
  { name: "12kHz", default: 50 },
  { name: "14kHz", default: 50 },
  { name: "16kHz", default: 50 },
];

const presets = [
  { name: "Flat", values: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },
  { name: "Rock", values: [60, 55, 45, 40, 50, 60, 65, 60, 55, 55] },
  { name: "Pop", values: [45, 50, 60, 65, 60, 55, 50, 45, 45, 45] },
  { name: "Jazz", values: [55, 50, 45, 50, 55, 60, 55, 50, 50, 50] },
  { name: "Classical", values: [50, 50, 50, 50, 50, 50, 40, 40, 40, 35] },
  { name: "Bass Boost", values: [75, 70, 60, 50, 45, 45, 50, 50, 50, 50] },
];

const Equalizer = () => {
  const [values, setValues] = useState<number[]>(bands.map((b) => b.default));

  const handleChange = (index: number, value: number[]) => {
    const newValues = [...values];
    newValues[index] = value[0];
    setValues(newValues);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setValues(preset.values);
  };

  const reset = () => {
    setValues(bands.map((b) => b.default));
  };

  return (
    <PremiumFeatureGate featureName="Audio Equalizer">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              Equalizer
            </span>
            <Button variant="ghost" size="icon" onClick={reset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
          <div className="flex justify-between gap-1">
            {bands.map((band, index) => (
              <div key={band.name} className="flex flex-col items-center gap-2">
                <Slider
                  orientation="vertical"
                  value={[values[index]]}
                  onValueChange={(val) => handleChange(index, val)}
                  max={100}
                  step={1}
                  className="h-24"
                />
                <span className="text-[10px] text-muted-foreground">{band.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PremiumFeatureGate>
  );
};

export default Equalizer;
