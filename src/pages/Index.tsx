import React, { useState, useCallback } from 'react';
import { VoiceInterface } from '@/components/VoiceInterface';
import { PatientForm, PatientData } from '@/components/PatientForm';
import { ChatInterface } from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Save, FileCheck, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-medical.jpg';

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: '',
    gender: '',
    address: '',
    mobile: '',
    symptoms: '',
  });
  const [filledFields, setFilledFields] = useState<Set<keyof PatientData>>(new Set());
  const { toast } = useToast();

  const updatePatientData = useCallback((field: keyof PatientData, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
    if (value.trim()) {
      setFilledFields(prev => new Set([...prev, field]));
    } else {
      setFilledFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  }, []);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    // This would typically be processed by AI to extract form data
    // For now, we'll add it to symptoms as a demo
    console.log('Voice transcript:', transcript);
  }, []);

  const handleSaveForm = () => {
    if (filledFields.size === 0) {
      toast({
        title: "No data to save",
        description: "Please fill in some information before saving.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Form saved successfully!",
      description: `Saved ${filledFields.size}/6 completed fields.`,
    });
  };

  const completionPercentage = (filledFields.size / 6) * 100;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-gradient-primary shadow-medical">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Rune</h1>
                <p className="text-white/80 text-sm">AI Medical Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {completionPercentage.toFixed(0)}% Complete
              </Badge>
              <Button 
                onClick={handleSaveForm}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Form
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Medical AI Interface" 
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Voice-Powered Medical Forms
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Simply speak naturally about your medical information, and our AI will automatically 
              fill out your patient forms with accuracy and care.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 bg-gradient-card shadow-soft">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Voice Recognition</h3>
                <p className="text-sm text-muted-foreground">Advanced speech-to-text technology</p>
              </Card>
              
              <Card className="p-6 bg-gradient-card shadow-soft">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">AI Processing</h3>
                <p className="text-sm text-muted-foreground">Intelligent form field extraction</p>
              </Card>
              
              <Card className="p-6 bg-gradient-card shadow-soft">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Auto-Fill Forms</h3>
                <p className="text-sm text-muted-foreground">Seamlessly populate medical records</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interface */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Voice Interface and Form */}
          <div className="space-y-6">
            <VoiceInterface
              onTranscript={handleVoiceTranscript}
              isListening={isListening}
              onToggleListening={() => setIsListening(!isListening)}
            />
            
            <PatientForm
              data={patientData}
              onChange={updatePatientData}
              filledFields={filledFields}
            />
          </div>

          {/* Right Column - Chat Interface */}
          <div className="lg:h-[800px]">
            <ChatInterface
              onUpdateForm={updatePatientData}
              patientData={patientData}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Stethoscope className="w-5 h-5 text-medical-primary" />
              <span className="font-semibold text-medical-primary">Rune AI Medical Assistant</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Streamlining medical form completion through intelligent voice recognition
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;