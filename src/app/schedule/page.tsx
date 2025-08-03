'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SchedulePage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Emploi du Temps</h1>
          <p className="text-secondary mt-1">Planification et gestion des cours avec IA</p>
        </div>
        <Button>
          Nouveau planning
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <p>Page de planification en cours de développement...</p>
        </CardContent>
      </Card>
    </div>
  );
}