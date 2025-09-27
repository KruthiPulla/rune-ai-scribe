import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { PatientData } from './PatientForm';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onUpdateForm: (field: keyof PatientData, value: string | Date) => void;
  patientData: PatientData;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onUpdateForm, patientData }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Rune, your AI medical assistant. I'll help you fill out your medical information form. You can speak naturally, and I'll extract the relevant information automatically. Please tell me about yourself and your medical concerns.",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const processUserMessage = async (message: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Enhanced AI processing with better pattern matching
    const lowerMessage = message.toLowerCase();
    let extractedInfo = [];
    
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
          onUpdateForm('name', extractedName);
          extractedInfo.push(`name: ${extractedName}`);
          break;
        }
      }
    }

    // Enhanced date of birth and age extraction
    const dobPatterns = [
      /(?:born(?:\s+on)?|birth(?:\s+(?:date|is))?|date of birth)\s+(?:is\s+)?(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i,
    ];
    
    for (const pattern of dobPatterns) {
      const dobMatch = lowerMessage.match(pattern);
      if (dobMatch && dobMatch[1] && !patientData.dateOfBirth) {
        try {
          const parts = dobMatch[1].split(/[-\/]/);
          const parsedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          
          if (!isNaN(parsedDate.getTime()) && 
              parsedDate < new Date() && 
              parsedDate > new Date('1900-01-01')) {
            onUpdateForm('dateOfBirth', parsedDate);
            // Auto-calculate age
            const today = new Date();
            const age = today.getFullYear() - parsedDate.getFullYear();
            const monthDiff = today.getMonth() - parsedDate.getMonth();
            const calculatedAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDate.getDate())) ? age - 1 : age;
            onUpdateForm('age', calculatedAge.toString());
            extractedInfo.push(`date of birth and age: ${calculatedAge}`);
            break;
          }
        } catch (error) {
          console.log('Date parsing error:', error);
        }
      }
    }
    
    // Enhanced age extraction
    const agePatterns = [
      /(?:i'm|i am|age(?:\s+is)?)\s+(\d+)(?:\s+years?\s+old)?/i,
      /(\d+)\s+years?\s+old/i,
      /age\s*:?\s*(\d+)/i,
    ];
    
    for (const pattern of agePatterns) {
      const ageMatch = lowerMessage.match(pattern);
      if (ageMatch && ageMatch[1]) {
        const age = parseInt(ageMatch[1]);
        if (age > 0 && age < 150 && !patientData.age) {
          onUpdateForm('age', ageMatch[1]);
          extractedInfo.push(`age: ${ageMatch[1]} years`);
          break;
        }
      }
    }
    
    // Enhanced gender extraction
    const genderPatterns = [
      /(?:gender(?:\s+is)?|i am|i'm)\s+(male|female|man|woman|boy|girl)/i,
      /(?:^|\s)(male|female|man|woman|boy|girl)(?:\s|$)/i,
    ];
    
    for (const pattern of genderPatterns) {
      const genderMatch = lowerMessage.match(pattern);
      if (genderMatch && genderMatch[1] && !patientData.gender) {
        let gender = genderMatch[1].toLowerCase();
        if (gender === 'man' || gender === 'boy') gender = 'male';
        if (gender === 'woman' || gender === 'girl') gender = 'female';
        onUpdateForm('gender', gender);
        extractedInfo.push(`gender: ${gender}`);
        break;
      }
    }
    
    // Enhanced phone extraction
    const phonePatterns = [
      /(?:mobile|phone|number|contact)(?:\s+(?:is|number))?\s*:?\s*([0-9\-\(\)\s+]{8,15})/i,
      /(\d{3,4}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/,
    ];
    
    for (const pattern of phonePatterns) {
      const phoneMatch = message.match(pattern);
      if (phoneMatch && phoneMatch[1]) {
        const phone = phoneMatch[1].trim();
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length >= 8 && cleanPhone.length <= 15 && !patientData.mobile) {
          onUpdateForm('mobile', phone);
          extractedInfo.push(`mobile: ${phone}`);
          break;
        }
      }
    }
    
    // Enhanced address extraction
    const addressPatterns = [
      /(?:live(?:\s+in)?|address(?:\s+is)?|from)\s+([a-zA-Z\s,]+?)(?:\s+(?:my|and|i|symptoms|mobile|phone)|$)/i,
      /(?:gachibowli|hyderabad|bangalore|mumbai|delhi|chennai|kolkata|pune)/i,
    ];
    
    for (const pattern of addressPatterns) {
      const addressMatch = message.match(pattern);
      if (addressMatch && addressMatch[1] && !patientData.address) {
        const address = addressMatch[1].trim();
        if (address.length > 2) {
          onUpdateForm('address', address);
          extractedInfo.push(`address: ${address}`);
          break;
        }
      }
    }
    
    // Enhanced symptoms extraction
    const symptomKeywords = [
      'pain', 'hurt', 'ache', 'fever', 'cough', 'headache', 'nausea', 'dizzy', 'tired', 'sick',
      'cold', 'flu', 'sore throat', 'stomach', 'breathing', 'fatigue', 'weakness', 'vomiting'
    ];
    
    const symptomsPattern = /(?:symptoms?(?:\s+are)?|suffering from|having|feel|feeling)\s+(.+?)(?:\s+(?:and|my|i|mobile|phone|address)|$)/i;
    const symptomsMatch = message.match(symptomsPattern);
    
    if (symptomsMatch || symptomKeywords.some(keyword => lowerMessage.includes(keyword))) {
      let newSymptomText = '';
      
      if (symptomsMatch) {
        newSymptomText = symptomsMatch[1].trim();
      } else if (symptomKeywords.some(keyword => lowerMessage.includes(keyword))) {
        newSymptomText = message.trim();
      }
      
      if (newSymptomText) {
        const currentSymptoms = patientData.symptoms;
        const updatedSymptoms = currentSymptoms 
          ? `${currentSymptoms}. ${newSymptomText}` 
          : newSymptomText;
        onUpdateForm('symptoms', updatedSymptoms);
        extractedInfo.push(`symptoms: ${newSymptomText}`);
      }
    }
    
    // Generate AI response based on extracted information
    let aiResponse = "";
    
    if (extractedInfo.length > 0) {
      aiResponse = `Great! I've extracted and updated the following information: ${extractedInfo.join(', ')}. `;
    } else {
      aiResponse = "I heard what you said, but couldn't extract specific form information from it. ";
    }
    
    // Check for missing fields
    const missingFields = [];
    if (!patientData.name) missingFields.push('your name');
    if (!patientData.age && !patientData.dateOfBirth) missingFields.push('your age or date of birth');
    if (!patientData.gender) missingFields.push('your gender');
    if (!patientData.mobile) missingFields.push('your mobile number');
    if (!patientData.address) missingFields.push('your address');
    
    if (missingFields.length > 0) {
      aiResponse += `I still need ${missingFields.join(', ')}. Could you please provide this information?`;
    } else {
      aiResponse += "Perfect! Your form is now complete. Is there anything else you'd like to add or modify?";
    }
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsProcessing(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    await processUserMessage(inputMessage);
  };

  const handleVoiceInput = (transcript: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: transcript,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    processUserMessage(transcript);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Expose voice input handler for parent component
  React.useImperativeHandle(React.createRef(), () => ({
    handleVoiceInput,
  }));

  return (
    <Card className="flex flex-col h-full bg-gradient-card shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-medical-primary">
          <Bot className="w-5 h-5" />
          AI Assistant Chat
          <Sparkles className="w-4 h-4 ml-auto text-medical-secondary animate-pulse" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-medical-primary' 
                      : 'bg-gradient-primary'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-medical-primary text-white'
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-primary">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-medical-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-medical-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-medical-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-6 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message or use voice input above..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};