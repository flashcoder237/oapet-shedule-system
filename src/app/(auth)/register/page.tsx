// src/app/auth/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, User, Building, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'professor' // Default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  const departments = [
    { id: 'med-gen', name: 'Médecine Générale' },
    { id: 'chir', name: 'Chirurgie' },
    { id: 'ped', name: 'Pédiatrie' },
    { id: 'gyn', name: 'Gynécologie' },
    { id: 'radio', name: 'Radiologie' },
    { id: 'lab', name: 'Laboratoire' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Évaluer la force du mot de passe
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 8) strength += 25;
      if (value.match(/[A-Z]/)) strength += 25;
      if (value.match(/[0-9]/)) strength += 25;
      if (value.match(/[^A-Za-z0-9]/)) strength += 25;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordStrength < 75) {
      setError('Le mot de passe est trop faible');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulation d'une requête d'inscription - à remplacer par un appel API réel
    setTimeout(() => {
      // Dans un vrai scénario, ceci serait remplacé par un appel API
      setIsLoading(false);
      router.push('/login?registered=true');
    }, 1500);
  };

  const getStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Système de gestion des emplois du temps
          </p>
          <p className="text-center text-sm font-medium text-primary">
            Faculté de Médécine - Université de Douala
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center" role="alert">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            {/* Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                Nom complet
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-border placeholder-muted-foreground text-foreground bg-card focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Dr. Nom Prénom"
                />
              </div>
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-border placeholder-muted-foreground text-foreground bg-card focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="exemple@fmedudouala.cm"
                />
              </div>
            </div>
            
            {/* Département */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-foreground mb-1">
                Département
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-muted-foreground" />
                </div>
                <select
                  id="department"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-border placeholder-muted-foreground text-foreground bg-card focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                >
                  <option value="" disabled>Sélectionnez un département</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-border placeholder-muted-foreground text-foreground bg-card focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Mot de passe"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-muted-foreground focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStrengthColor()}`} 
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 flex space-x-2 text-xs">
                    <div className="flex items-center text-muted-foreground">
                      {passwordStrength >= 25 ? (
                        <Check className="w-3 h-3 text-green-500 mr-1" />
                      ) : null}
                      8+ caractères
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      {formData.password.match(/[A-Z]/) ? (
                        <Check className="w-3 h-3 text-green-500 mr-1" />
                      ) : null}
                      Majuscules
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      {formData.password.match(/[0-9]/) ? (
                        <Check className="w-3 h-3 text-green-500 mr-1" />
                      ) : null}
                      Chiffres
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Confirmer mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-border placeholder-muted-foreground text-foreground bg-card focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  placeholder="Confirmer le mot de passe"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70"
            >
              {isLoading ? 'Création en cours...' : 'Créer un compte'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Vous avez déjà un compte?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}