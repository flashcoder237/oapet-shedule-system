// src/app/page.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <h1 className="text-4xl font-bold text-primary mb-6">
        Système de Gestion des Emplois du Temps
      </h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-8">
        Faculté de Médécine - Université de Douala
      </h2>
      <p className="text-xl text-gray-600 max-w-2xl mb-10">
        Une solution complète pour la gestion optimisée des emplois du temps, des salles de cours, 
        et des ressources pédagogiques.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/dashboard" 
          className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-700-dark text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all"
        >
          Accéder au tableau de bord
          <ArrowRight size={20} />
        </Link>
        <Link 
          href="/schedule" 
          className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-600-dark text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all"
        >
          Consulter les emplois du temps
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}