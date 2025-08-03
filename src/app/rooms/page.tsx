'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RoomsPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion des Salles</h1>
          <p className="text-secondary mt-1">Gérez les salles de cours et leurs disponibilités</p>
        </div>
        <Button>
          Ajouter une salle
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <p>Page des salles en cours de développement...</p>
        </CardContent>
      </Card>
    </div>
  );
}