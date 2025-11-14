import { motion } from "framer-motion";

interface QuadrantChartProps {
  willScore: number;
  skillScore: number;
  quadrant: string;
}

export const QuadrantChart = ({ willScore, skillScore, quadrant }: QuadrantChartProps) => {
  const getQuadrantColor = () => {
    if (quadrant.includes('STAR')) return 'bg-accent';
    if (quadrant.includes('WILLING')) return 'bg-yi-orange';
    if (quadrant.includes('RELUCTANT')) return 'bg-yi-cyan';
    return 'bg-muted-foreground';
  };

  const getQuadrantDescription = () => {
    if (quadrant.includes('STAR')) return 'High Skill + High Will';
    if (quadrant.includes('WILLING')) return 'Building Skills + High Will';
    if (quadrant.includes('RELUCTANT')) return 'High Skill + Lower Will';
    return 'Building Both';
  };

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Grid */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1">
        {/* Q1 - STAR */}
        <div className={`border-2 ${quadrant.includes('Q1') ? 'border-accent bg-accent/10' : 'border-border bg-muted/5'} rounded-tl-lg flex items-center justify-center`}>
          <div className="text-center p-2">
            <p className="text-xs font-semibold">Q1 - STAR</p>
            <p className="text-xs text-muted-foreground">High/High</p>
          </div>
        </div>

        {/* Q2 - WILLING */}
        <div className={`border-2 ${quadrant.includes('Q2') ? 'border-yi-orange bg-yi-orange/10' : 'border-border bg-muted/5'} rounded-tr-lg flex items-center justify-center`}>
          <div className="text-center p-2">
            <p className="text-xs font-semibold">Q2 - WILLING</p>
            <p className="text-xs text-muted-foreground">Low/High</p>
          </div>
        </div>

        {/* Q3 - NOT READY */}
        <div className={`border-2 ${quadrant.includes('Q3') ? 'border-muted-foreground bg-muted/20' : 'border-border bg-muted/5'} rounded-bl-lg flex items-center justify-center`}>
          <div className="text-center p-2">
            <p className="text-xs font-semibold">Q3 - NOT READY</p>
            <p className="text-xs text-muted-foreground">Low/Low</p>
          </div>
        </div>

        {/* Q4 - RELUCTANT */}
        <div className={`border-2 ${quadrant.includes('Q4') ? 'border-yi-cyan bg-yi-cyan/10' : 'border-border bg-muted/5'} rounded-br-lg flex items-center justify-center`}>
          <div className="text-center p-2">
            <p className="text-xs font-semibold">Q4 - RELUCTANT</p>
            <p className="text-xs text-muted-foreground">High/Low</p>
          </div>
        </div>
      </div>

      {/* Position indicator */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="absolute"
        style={{
          left: `${skillScore}%`,
          bottom: `${willScore}%`,
          transform: 'translate(-50%, 50%)',
        }}
      >
        <div className={`w-6 h-6 ${getQuadrantColor()} rounded-full border-4 border-background shadow-lg`} />
      </motion.div>

      {/* Axes labels */}
      <div className="absolute -bottom-8 left-0 right-0 text-center text-xs text-muted-foreground">
        SKILL Score →
      </div>
      <div className="absolute left-0 top-0 bottom-0 -left-16 flex items-center">
        <p className="text-xs text-muted-foreground transform -rotate-90 whitespace-nowrap">
          WILL Score →
        </p>
      </div>

      {/* Current position label */}
      <div className="absolute -top-12 left-0 right-0 text-center">
        <p className="text-sm font-semibold">{quadrant}</p>
        <p className="text-xs text-muted-foreground">{getQuadrantDescription()}</p>
      </div>
    </div>
  );
};