import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Phone, Calendar, Users, FileText } from 'lucide-react';

export interface PatientData {
  name: string;
  age: string;
  gender: string;
  address: string;
  mobile: string;
  symptoms: string;
}

interface PatientFormProps {
  data: PatientData;
  onChange: (field: keyof PatientData, value: string) => void;
  filledFields: Set<keyof PatientData>;
}

export const PatientForm: React.FC<PatientFormProps> = ({ data, onChange, filledFields }) => {
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="age" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Age
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
              placeholder="Enter age"
              type="number"
              className={filledFields.has('age') ? 'border-medical-primary/50 bg-medical-primary/5' : ''}
            />
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
              {filledFields.size}/6 fields completed
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 mt-2">
            <div
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(filledFields.size / 6) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};