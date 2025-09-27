import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Extend Window interface for webkit speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface VoiceInterfaceProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onTranscript,
  isListening,
  onToggleListening,
}) => {
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Recognition Error",
          description: "Please check your microphone permissions and try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current = recognition;
    } else {
      toast({
        title: "Browser not supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, toast]);

  useEffect(() => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.start();
      } else {
        recognitionRef.current.stop();
        setTranscript('');
      }
    }
  }, [isListening]);

  return (
    <Card className="p-6 bg-gradient-card shadow-medical">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div 
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening 
                ? 'bg-gradient-primary shadow-glow animate-pulse' 
                : 'bg-secondary'
            }`}
          >
            <Button
              onClick={onToggleListening}
              variant="ghost"
              size="lg"
              className="w-full h-full rounded-full"
            >
              {isListening ? (
                <Mic className="w-8 h-8 text-primary-foreground" />
              ) : (
                <MicOff className="w-8 h-8 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {isListening ? 'Listening...' : 'Tap to speak'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isListening 
              ? 'Speak naturally about your medical information' 
              : 'Click the microphone to start voice input'
            }
          </p>
        </div>

        {transcript && (
          <div className="mt-4 p-4 bg-accent rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-medical-primary" />
              <span className="text-sm font-medium">Live Transcript:</span>
            </div>
            <p className="text-sm text-accent-foreground text-left">
              {transcript}
            </p>
          </div>
        )}

        {isListening && (
          <div className="flex justify-center">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-medical-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};