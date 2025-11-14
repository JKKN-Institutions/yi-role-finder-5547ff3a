import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Assessment, AssessmentResponse } from '@/types/assessment';
import { toast } from 'sonner';

interface AssessmentContextType {
  assessment: Assessment | null;
  responses: Record<number, any>;
  currentQuestion: number;
  isLoading: boolean;
  saveResponse: (questionNumber: number, questionText: string, data: any) => Promise<void>;
  goToQuestion: (questionNumber: number) => void;
  submitAssessment: () => Promise<void>;
  startAssessment: (email: string, fullName: string) => Promise<void>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const startAssessment = async (email: string, fullName: string) => {
    setIsLoading(true);
    try {
      console.log('Starting assessment with:', { email, fullName });
      
      // Validate inputs
      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }
      if (!fullName || !fullName.trim()) {
        throw new Error('Full name is required');
      }
      
      // Generate session ID for anonymous tracking
      const sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Ensure we have a valid session (create anonymous session if needed)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found, signing in anonymously...');
        const { error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) {
          console.error('Failed to create anonymous session:', anonError);
          throw new Error('Failed to authenticate. Please try again.');
        }
      }
      
      const { data, error } = await supabase
        .from('assessments')
        .insert({ 
          session_id: sessionId,
          user_email: email.trim(), 
          user_name: fullName.trim() 
        })
        .select()
        .single();

      console.log('Supabase response:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to create assessment');
      }
      
      if (!data) {
        throw new Error('No data returned from assessment creation');
      }
      
      setAssessment(data);
      setCurrentQuestion(1);
      console.log('Assessment started successfully');
    } catch (error) {
      console.error('Error starting assessment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start assessment';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveResponse = async (questionNumber: number, questionText: string, data: any) => {
    if (!assessment) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('assessment_responses')
        .upsert({
          assessment_id: assessment.id,
          question_number: questionNumber,
          question_text: questionText,
          response_data: data,
        }, {
          onConflict: 'assessment_id,question_number'
        });

      if (error) throw error;

      setResponses(prev => ({ ...prev, [questionNumber]: data }));

      // Update current question in assessment
      await supabase
        .from('assessments')
        .update({ current_question: questionNumber })
        .eq('id', assessment.id);

    } catch (error) {
      console.error('Error saving response:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const goToQuestion = (questionNumber: number) => {
    setCurrentQuestion(questionNumber);
  };

  const submitAssessment = async () => {
    if (!assessment) return;

    setIsLoading(true);
    try {
      // Update assessment status to completed
      await supabase
        .from('assessments')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', assessment.id);

      // Note: AI analysis will be triggered by admins from the dashboard
      // This ensures proper access control and prevents abuse

      // Clear assessment from context - applicant's role ends here
      setAssessment(null);
      setResponses({});
      setCurrentQuestion(1);
      
      toast.success("Thank you! Your assessment has been submitted successfully.");
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error("Failed to submit assessment");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AssessmentContext.Provider
      value={{
        assessment,
        responses,
        currentQuestion,
        isLoading,
        saveResponse,
        goToQuestion,
        submitAssessment,
        startAssessment,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};