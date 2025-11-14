import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useAssessment } from "@/contexts/AssessmentContext";
import { ProgressBar } from "./ProgressBar";
import { Question1 } from "./Question1";
import { Question2 } from "./Question2";
import { Question3 } from "./Question3";
import { Question4 } from "./Question4";
import { Question5 } from "./Question5";
import { toast } from "sonner";
import yiLogo from "@/assets/yi-logo-official.png";

const QUESTIONS = [
  { 
    number: 1, 
    text: "Which Yi verticals excite you most? (Select up to 3)",
    Component: Question1 
  },
  { 
    number: 2, 
    text: "It's Saturday 6 PM. Your vertical needs urgent help for Sunday's event. What's your response?",
    Component: Question2 
  },
  { 
    number: 3, 
    text: "Complete this: 'If I'm on EC 2026, by December I will have...'",
    Component: Question3 
  },
  { 
    number: 4, 
    text: "Your biggest constraint for EC 2026?",
    Component: Question4 
  },
  { 
    number: 5, 
    text: "Your team misses a deadline. You:",
    Component: Question5 
  },
];

export const AssessmentFlow = () => {
  const navigate = useNavigate();
  const { currentQuestion, responses, saveResponse, goToQuestion, submitAssessment, isLoading } = useAssessment();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = async (data: any) => {
    try {
      const question = QUESTIONS[currentQuestion - 1];
      await saveResponse(currentQuestion, question.text, data);
      
      if (currentQuestion < QUESTIONS.length) {
        goToQuestion(currentQuestion + 1);
      }
      
      toast.success("Response saved");
    } catch (error) {
      console.error('Error saving response:', error);
      toast.error("Failed to save response");
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      goToQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitAssessment();
      navigate('/thank-you');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error("Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentQuestionComponent = QUESTIONS[currentQuestion - 1].Component;
  const isLastQuestion = currentQuestion === QUESTIONS.length;

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {/* Logo Header */}
        <div className="flex justify-center">
          <img 
            src={yiLogo} 
            alt="Yi Erode Logo" 
            className="h-10 sm:h-12 w-auto"
          />
        </div>
        
        <ProgressBar currentStep={currentQuestion} totalSteps={QUESTIONS.length} />

        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 shadow-card">
          <AnimatePresence mode="wait">
            {currentQuestion === 1 && (
              <Question1
                key={currentQuestion}
                onAnswer={handleAnswer}
                initialValue={responses[currentQuestion]}
              />
            )}
            {currentQuestion === 2 && (
              <Question2
                key={currentQuestion}
                onAnswer={handleAnswer}
                initialValue={responses[currentQuestion]}
              />
            )}
            {currentQuestion === 3 && (
              <Question3
                key={currentQuestion}
                onAnswer={handleAnswer}
                initialValue={responses[currentQuestion]}
              />
            )}
            {currentQuestion === 4 && (
              <Question4
                key={currentQuestion}
                onAnswer={handleAnswer}
                initialValue={responses[currentQuestion]}
              />
            )}
            {currentQuestion === 5 && (
              <Question5
                key={currentQuestion}
                onAnswer={handleAnswer}
                onSubmit={handleSubmit}
                initialValue={responses[currentQuestion]}
              />
            )}
          </AnimatePresence>
        </div>

        {currentQuestion > 1 && (
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={isLoading || isSubmitting}
            className="w-full h-12 sm:h-auto"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Question
          </Button>
        )}

        <p className="text-xs sm:text-sm text-center text-muted-foreground px-2">
          Your progress is automatically saved
        </p>
      </div>
    </div>
  );
};