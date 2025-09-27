import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Phone, Calendar as CalendarIcon, Users, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface PatientData {
  name: string;
  age: string;
  dateOfBirth?: Date;
  gender: string;
  address: string;
  mobile: string;
  symptoms: string;
}

interface PatientFormProps {
  data: PatientData;
  onChange: (field: keyof PatientData, value: string | Date) => void;
  filledFields: Set<keyof PatientData>;
}

export const PatientForm: React.FC<PatientFormProps> = ({ data, onChange, filledFields }) => {
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleDateOfBirthChange = (date: Date | undefined) => {
    if (date) {
      onChange('dateOfBirth', date);
      const calculatedAge = calculateAge(date);
      onChange('age', calculatedAge.toString());
    }
  };

  return (
    <Card className="bg-gradient-card shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-medical-primary">
          <FileText className="w-5 h-5" />
          Patient Information Form
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
              {filledFields.has('name') && (
                <Badge variant="secondary" className="ml-auto bg-medical-primary/10 text-medical-primary">
                  ✓ Filled
                </Badge>
              )}
            </Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Enter patient's full name"
              className={filledFields.has('name') ? 'border-medical-primary/50 bg-medical-primary/5' : ''}
            />
            <div className="text-xs text-muted-foreground">
              💡 Voice tip: Say "My name is [Your Name]" or "I'm [Your Name]"
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Date of Birth
              {filledFields.has('dateOfBirth') && (
                <Badge variant="secondary" className="ml-auto bg-medical-primary/10 text-medical-primary">
                  ✓ Filled
                </Badge>
              )}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data.dateOfBirth && "text-muted-foreground",
                    filledFields.has('dateOfBirth') ? 'border-medical-primary/50 bg-medical-primary/5' : ''
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.dateOfBirth ? format(data.dateOfBirth, "PPP") : <span>Pick date of birth</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.dateOfBirth}
                  onSelect={handleDateOfBirthChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <div className="text-xs text-muted-foreground">
              💡 Voice tip: Say "I was born on [date]" or "My date of birth is [date]"
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Age {data.dateOfBirth && <span className="text-xs text-medical-primary">(Auto-calculated)</span>}
              {filledFields.has('age') && (
                <Badge variant="secondary" className="ml-auto bg-medical-primary/10 text-medical-primary">
                  ✓ Filled
                </Badge>
              )}
            </Label>
            <Input
              id="age"
              value={data.age}
              onChange={(e) => onChange('age', e.target.value)}
              placeholder="Enter age or select date of birth above"
              type="number"
              className={filledFields.has('age') ? 'border-medical-primary/50 bg-medical-primary/5' : ''}
              disabled={!!data.dateOfBirth}
            />
            <div className="text-xs text-muted-foreground">
              💡 Voice tip: Say "I'm [age] years old" or "I am [age]"
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gender
              {filledFields.has('gender') && (
                <Badge variant="secondary" className="ml-auto bg-medical-primary/10 text-medical-primary">
                  ✓ Filled
                </Badge>
              )}
            </Label>
            <Select value={data.gender} onValueChange={(value) => onChange('gender', value)}>
              <SelectTrigger className={filledFields.has('gender') ? 'border-medical-primary/50 bg-medical-primary/5' : ''}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Mobile Number
              {filledFields.has('mobile') && (
                <Badge variant="secondary" className="ml-auto bg-medical-primary/10 text-medical-primary">
                  ✓ Filled
                </Badge>
              )}
            </Label>
            <Input
              id="mobile"
              value={data.mobile}
              onChange={(e) => onChange('mobile', e.target.value)}
              placeholder="Enter mobile number"
              type="tel"
              className={filledFields.has('mobile') ? 'border-medical-primary/50 bg-medical-primary/5' : ''}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address
            {filledFields.has('address') && (
              <Badge variant="secondary" className="ml-auto bg-medical-primary/10 text-medical-primary">
                ✓ Filled
              </Badge>
            )}
          </Label>
          <Textarea
            id="address"
            value={data.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Enter complete address"
            rows={2}
            className={filledFields.has('address') ? 'border-medical-primary/50 bg-medical-primary/5' : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="symptoms" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Symptoms & Medical Information
            {filledFields.has('symptoms') && (
              <Badge variant="secondary" className="ml-auto bg-medical-primary/10 text-medical-primary">
                ✓ Filled
              </Badge>
            )}
          </Label>
          <Textarea
            id="symptoms"
            value={data.symptoms}
            onChange={(e) => onChange('symptoms', e.target.value)}
            placeholder="Describe symptoms, medical history, and any relevant information"
            rows={4}
            className={filledFields.has('symptoms') ? 'border-medical-primary/50 bg-medical-primary/5' : ''}
          />
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Form Completion:</span>
            <span className="font-medium text-medical-primary">
              {filledFields.size}/7 fields completed
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 mt-2">
            <div
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(filledFields.size / 7) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};