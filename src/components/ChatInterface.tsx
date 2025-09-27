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
  onUpdateForm: (field: keyof PatientData, value: string) => void;
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
    
    // Simulate AI processing and form filling
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple pattern matching for demo (in real app, this would be AI-powered)
    const lowerMessage = message.toLowerCase();
    
    // Extract name
    const nameMatch = lowerMessage.match(/(?:my name is|i'm|i am|call me)\s+([a-zA-Z\s]+)/);
    if (nameMatch) {
      onUpdateForm('name', nameMatch[1].trim());
    }
    
    // Extract age
    const ageMatch = lowerMessage.match(/(?:i'm|i am|age)\s+(\d+)(?:\s+years?\s+old)?/);
    if (ageMatch) {
      onUpdateForm('age', ageMatch[1]);
    }
    
    // Extract gender
    if (lowerMessage.includes('male') && !lowerMessage.includes('female')) {
      onUpdateForm('gender', 'male');
    } else if (lowerMessage.includes('female')) {
      onUpdateForm('gender', 'female');
    }
    
    // Extract phone
    const phoneMatch = lowerMessage.match(/(?:phone|number|mobile|call)\s*(?:is|:)?\s*([0-9\-\(\)\s+]+)/);
    if (phoneMatch) {
      onUpdateForm('mobile', phoneMatch[1].trim());
    }
    
    // Extract symptoms
    const symptomKeywords = ['pain', 'hurt', 'ache', 'fever', 'cough', 'headache', 'nausea', 'dizzy', 'tired', 'sick'];
    if (symptomKeywords.some(keyword => lowerMessage.includes(keyword))) {
      const currentSymptoms = patientData.symptoms;
      const newSymptoms = currentSymptoms ? `${currentSymptoms} ${message}` : message;
      onUpdateForm('symptoms', newSymptoms);
    }
    
    // Generate AI response
    let aiResponse = "Thank you for that information. I've updated your form with the details you provided. ";
    
    const missingFields = [];
    if (!patientData.name && !nameMatch) missingFields.push('your name');
    if (!patientData.age && !ageMatch) missingFields.push('your age');
    if (!patientData.gender && !lowerMessage.includes('male') && !lowerMessage.includes('female')) missingFields.push('your gender');
    if (!patientData.mobile && !phoneMatch) missingFields.push('your mobile number');
    if (!patientData.address) missingFields.push('your address');
    
    if (missingFields.length > 0) {
      aiResponse += `Could you also provide ${missingFields.join(', ')}?`;
    } else {
      aiResponse += "Your form appears to be complete! Is there anything else you'd like to add or modify?";
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