import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Calendar, ArrowLeft, Download } from "lucide-react";

export const NextSteps = () => {
  const handleApply = () => {
    // TODO: Implement application flow
    window.open("https://forms.gle/your-application-form", "_blank");
  };

  const handleScheduleCall = () => {
    // TODO: Implement calendar scheduling
    window.open("https://calendly.com/yi-erode", "_blank");
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    window.print();
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-yi-orange/10 via-card to-accent/10 border-2 border-yi-orange/30">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Ready to Make an Impact?</h2>
        <p className="text-muted-foreground">
          Choose your next step in your Yi Erode EC 2026 journey
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button 
            size="lg" 
            className="w-full h-auto py-6 bg-yi-orange hover:bg-yi-orange/90 flex-col gap-2"
            onClick={handleApply}
          >
            <FileText className="w-6 h-6" />
            <div>
              <div className="font-bold text-lg">Submit Application</div>
              <div className="text-xs opacity-90">Official EC 2026 Application Form</div>
            </div>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            size="lg" 
            variant="outline"
            className="w-full h-auto py-6 flex-col gap-2 border-2"
            onClick={handleScheduleCall}
          >
            <Calendar className="w-6 h-6" />
            <div>
              <div className="font-bold text-lg">Discuss with Leadership</div>
              <div className="text-xs opacity-70">Schedule a 1-on-1 call</div>
            </div>
          </Button>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button 
            size="lg" 
            variant="ghost"
            className="w-full"
            onClick={() => window.location.href = '/assessment'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Explore Other Roles
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            size="lg" 
            variant="ghost"
            className="w-full"
            onClick={handleDownloadPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            Save as PDF
          </Button>
        </motion.div>
      </div>
    </Card>
  );
};
