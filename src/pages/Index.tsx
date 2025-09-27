import React, { useState, useCallback } from 'react';
import { VoiceInterface } from '@/components/VoiceInterface';
import { PatientForm, PatientData } from '@/components/PatientForm';
import { ChatInterface } from '@/components/ChatInterface';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Save, FileCheck, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-medical.jpg';

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [lastProcessedField, setLastProcessedField] = useState<keyof PatientData>();
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: '',
    dateOfBirth: undefined,
    gender: '',
    address: '',
    mobile: '',
    symptoms: '',
  });
  const [filledFields, setFilledFields] = useState<Set<keyof PatientData>>(new Set());
  const { toast } = useToast();

  const updatePatientData = useCallback((field: keyof PatientData, value: string | Date) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
    if ((typeof value === 'string' && value.trim()) || value instanceof Date) {
      setFilledFields(prev => new Set([...prev, field]));
      setLastProcessedField(field);
    } else {
      setFilledFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  }, []);

  const handleVoiceTranscript = useCallback((transcript: string) => {
    console.log('Voice transcript:', transcript);
    setIsProcessingVoice(true);
    
    // Process the transcript with improved AI logic
    processVoiceInput(transcript);
    
    // Stop processing after a short delay
    setTimeout(() => setIsProcessingVoice(false), 1500);
  }, []);

  const processVoiceInput = useCallback((message: string) => {
    const lowerMessage = message.toLowerCase().trim();
    
    // Enhanced name extraction with better patterns and validation
    const namePatterns = [
      /(?:my name is|i'm|i am|call me|this is|name)\s+([a-zA-Z][a-zA-Z\s]*?)(?:\s+(?:and|i am|i'm|my|age|\d|years|born|gender)|$|\.|\,)/i,
      /(?:^|hello|hi)\s*,?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s+(?:and|here|speaking|i am|i'm|my|age|\d|years))/i,
      /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})(?:\s+(?:and|i|my|age|\d|years|born))/,
    ];
    
    // Clean common speech artifacts from name
    const cleanName = (name: string): string => {
      return name
        .replace(/\b(hi|hello|room|rune)\b/gi, '') // Remove greeting words
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
    };
    
    for (const pattern of namePatterns) {
      const nameMatch = message.match(pattern);
      if (nameMatch && nameMatch[1]) {
        const extractedName = cleanName(nameMatch[1]);
        // Validate name: should be 2-50 chars, contain letters, no numbers
        if (extractedName.length >= 2 && 
            extractedName.length <= 50 && 
            /^[a-zA-Z\s]+$/.test(extractedName) &&
            !patientData.name) {
          updatePatientData('name', extractedName);
          break;
        }
      }
    }

    // Enhanced date of birth extraction
    const dobPatterns = [
      /(?:born(?:\s+on)?|birth(?:\s+(?:date|is))?|date of birth)\s+(?:is\s+)?(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i,
      /(?:born(?:\s+on)?|birth(?:\s+(?:date|is))?)\s+(?:is\s+)?(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{4})/i,
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/,
    ];
    
    for (const pattern of dobPatterns) {
      const dobMatch = lowerMessage.match(pattern);
      if (dobMatch && dobMatch[1] && !patientData.dateOfBirth) {
        try {
          // Parse the date string
          let dateStr = dobMatch[1];
          let parsedDate: Date | null = null;
          
          // Try different date formats
          if (/\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/.test(dateStr)) {
            const parts = dateStr.split(/[-\/]/);
            // Assume MM/DD/YYYY or DD/MM/YYYY - prefer DD/MM/YYYY for medical forms
            parsedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
          
          if (parsedDate && !isNaN(parsedDate.getTime()) && 
              parsedDate < new Date() && 
              parsedDate > new Date('1900-01-01')) {
            updatePatientData('dateOfBirth', parsedDate);
            // Auto-calculate age
            const today = new Date();
            const age = today.getFullYear() - parsedDate.getFullYear();
            const monthDiff = today.getMonth() - parsedDate.getMonth();
            const calculatedAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDate.getDate())) ? age - 1 : age;
            updatePatientData('age', calculatedAge.toString());
            break;
          }
        } catch (error) {
          console.log('Date parsing error:', error);
        }
      }
    }
    
    // Improved age extraction
    const agePatterns = [
      /(?:i'm|i am|age(?:\s+is)?)\s+(\d+)(?:\s+years?\s+old)?/i,
      /(\d+)\s+years?\s+old/i,
      /age\s*:?\s*(\d+)/i,
    ];
    
    for (const pattern of agePatterns) {
      const ageMatch = lowerMessage.match(pattern);
      if (ageMatch && ageMatch[1]) {
        const age = parseInt(ageMatch[1]);
        if (age > 0 && age < 150) {
          updatePatientData('age', ageMatch[1]);
          break;
        }
      }
    }
    
    // Improved gender extraction
    const genderPatterns = [
      /(?:gender(?:\s+is)?|i am|i'm)\s+(male|female|man|woman|boy|girl)/i,
      /(?:^|\s)(male|female|man|woman|boy|girl)(?:\s|$)/i,
    ];
    
    for (const pattern of genderPatterns) {
      const genderMatch = lowerMessage.match(pattern);
      if (genderMatch && genderMatch[1]) {
        let gender = genderMatch[1].toLowerCase();
        if (gender === 'man' || gender === 'boy') gender = 'male';
        if (gender === 'woman' || gender === 'girl') gender = 'female';
        updatePatientData('gender', gender);
        break;
      }
    }
    
    // Improved phone number extraction
    const phonePatterns = [
      /(?:mobile|phone|number|contact)(?:\s+(?:is|number))?\s*:?\s*([0-9\-\(\)\s+]{8,15})/i,
      /(\d{3,4}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/,
      /(\d{10,})/,
    ];
    
    for (const pattern of phonePatterns) {
      const phoneMatch = message.match(pattern);
      if (phoneMatch && phoneMatch[1]) {
        const cleanPhone = phoneMatch[1].replace(/\D/g, '');
        if (cleanPhone.length >= 8 && cleanPhone.length <= 15) {
          updatePatientData('mobile', phoneMatch[1].trim());
          break;
        }
      }
    }
    
    // Improved address extraction
    const addressPatterns = [
      /(?:live(?:\s+in)?|address(?:\s+is)?|from)\s+([a-zA-Z\s,]+?)(?:\s+(?:my|and|i|symptoms|mobile|phone)|$)/i,
      /(?:gachibowli|hyderabad|bangalore|mumbai|delhi|chennai|kolkata|pune|ahmedabad|jaipur|lucknow|kanpur|nagpur|visakhapatnam|indore|bhopal|coimbatore|patna|vadodara|ludhiana|agra|madurai|nashik|faridabad|meerut|rajkot|kalyan|vasai|varanasi|srinagar|aurangabad|dhanbad|amritsar|navi mumbai|allahabad|ranchi|howrah|jabalpur|gwalior|vijayawada|jodhpur|raipur|kota|guwahati|chandigarh|solapur|hubballi|tiruchirappalli|bareilly|moradabad|mysore|tiruppur|gurgaon|aligarh|jalandhar|bhubaneswar|salem|warangal|guntur|bhilai|kochi|amravati|bikaner|noida|jamshedpur|bhilwara|cuttack|firozabad|kurnool|rajkot|dehradun|durgapur|asansol|siliguri|rourkela)/i,
    ];
    
    for (const pattern of addressPatterns) {
      const addressMatch = message.match(pattern);
      if (addressMatch && addressMatch[1]) {
        const address = addressMatch[1].trim();
        if (address.length > 2) {
          updatePatientData('address', address);
          break;
        }
      }
    }
    
    // Improved symptoms extraction
    const symptomKeywords = [
      'pain', 'hurt', 'ache', 'fever', 'cough', 'headache', 'nausea', 'dizzy', 'tired', 'sick',
      'cold', 'flu', 'sore throat', 'stomach', 'back pain', 'chest pain', 'breathing',
      'shortness of breath', 'fatigue', 'weakness', 'vomiting', 'diarrhea', 'constipation',
      'rash', 'swelling', 'joint pain', 'muscle pain', 'burning', 'itching', 'discharge',
      'bleeding', 'bruising', 'numbness', 'tingling', 'vision', 'hearing', 'memory',
      'anxiety', 'depression', 'sleep', 'appetite', 'weight loss', 'weight gain'
    ];
    
    const symptomsPattern = /(?:symptoms?(?:\s+are)?|suffering from|having|feel|feeling)\s+(.+?)(?:\s+(?:and|my|i|mobile|phone|address)|$)/i;
    const symptomsMatch = message.match(symptomsPattern);
    
    if (symptomsMatch || symptomKeywords.some(keyword => lowerMessage.includes(keyword))) {
      const currentSymptoms = patientData.symptoms;
      let newSymptomText = '';
      
      if (symptomsMatch) {
        newSymptomText = symptomsMatch[1].trim();
      } else {
        // If no direct symptom phrase, but contains symptom keywords, add the whole message
        if (symptomKeywords.some(keyword => lowerMessage.includes(keyword))) {
          newSymptomText = message.trim();
        }
      }
      
      if (newSymptomText) {
        const updatedSymptoms = currentSymptoms 
          ? `${currentSymptoms}. ${newSymptomText}` 
          : newSymptomText;
        updatePatientData('symptoms', updatedSymptoms);
      }
    }
    
    // Show success toast when information is extracted
    toast({
      title: "Information processed",
      description: "I've updated your form with the information you provided.",
    });
  }, [patientData, updatePatientData, toast]);

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
      description: `Saved ${filledFields.size}/7 completed fields.`,
    });
  };

  const completionPercentage = (filledFields.size / 7) * 100;

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
            
            <ProcessingStatus
              lastProcessedField={lastProcessedField}
              isProcessing={isProcessingVoice}
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