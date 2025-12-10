'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface SuccessCardProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

export const SuccessCard: React.FC<SuccessCardProps> = ({
  title,
  description,
  buttonText,
  onButtonClick
}) => (
  <Card className="max-w-md mx-auto">
    <CardContent className="text-center py-12">
      <div className="mb-4 flex justify-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-primary" />
      </div>
      </div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-700 mb-6">{description}</p>
      <Button onClick={onButtonClick} className="w-full">
        {buttonText}
      </Button>
    </CardContent>
  </Card>
);
