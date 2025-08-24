'use client';

import React, { useState, useEffect } from 'react';
import { X, Building, MapPin, Users, Monitor, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import type { Room } from '@/types/api';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: Room | null;
  onSave: (roomData: any) => Promise<void>;
}

export default function RoomModal({
  isOpen,
  onClose,
  room,
  onSave
}: RoomModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    building: '',
    floor: 1,
    capacity: 30,
    room_type: 'classroom',
    has_projector: false,
    has_computer: false,
    has_audio_system: false,
    has_whiteboard: true,
    is_accessible: true,
    description: '',
    is_active: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { addToast } = useToast();
  const isEditing = !!room;

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || '',
        code: room.code || '',
        building: room.building?.toString() || '',
        floor: Number(room.floor) || 1,
        capacity: Number(room.capacity) || 30,
        room_type: room.room_type?.toString() || 'classroom',
        has_projector: room.has_projector || false,
        has_computer: room.has_computer || false,
        has_audio_system: room.has_audio_system || false,
        has_whiteboard: room.has_whiteboard || true,
        is_accessible: room.is_accessible !== false,
        description: room.description || '',
        is_active: room.is_active !== false
      });
    } else {
      // Reset form for new room
      setFormData({
        name: '',
        code: '',
        building: '',
        floor: 1,
        capacity: 30,
        room_type: 'classroom',
        has_projector: false,
        has_computer: false,
        has_audio_system: false,
        has_whiteboard: true,
        is_accessible: true,
        description: '',
        is_active: true
      });
    }
    setErrors({});
  }, [room, isOpen]);

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Le nom de la salle est requis';
    if (!formData.code.trim()) newErrors.code = 'Le code de la salle est requis';
    if (!formData.building.trim()) newErrors.building = 'Le bâtiment est requis';
    if (formData.capacity < 1) newErrors.capacity = 'La capacité doit être supérieure à 0';
    if (formData.floor < 1) newErrors.floor = 'L\'étage doit être supérieur à 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      
      addToast({
        title: "Succès",
        description: `Salle ${isEditing ? 'mise à jour' : 'créée'} avec succès`,
      });
      
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      addToast({
        title: "Erreur",
        description: error.message || `Impossible de ${isEditing ? 'mettre à jour' : 'créer'} la salle`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? 'Modifier la salle' : 'Nouvelle salle'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEditing ? 'Modifiez les informations de la salle' : 'Créez une nouvelle salle de cours'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la salle *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Salle A101"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code de la salle *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="A101"
                />
                {errors.code && (
                  <p className="text-red-500 text-sm mt-1">{errors.code}</p>
                )}
              </div>

              {/* Building */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bâtiment *
                </label>
                <select
                  value={formData.building}
                  onChange={(e) => handleChange('building', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.building ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un bâtiment</option>
                  <option value="A">Bâtiment A</option>
                  <option value="B">Bâtiment B</option>
                  <option value="C">Bâtiment C</option>
                  <option value="D">Bâtiment D</option>
                </select>
                {errors.building && (
                  <p className="text-red-500 text-sm mt-1">{errors.building}</p>
                )}
              </div>

              {/* Floor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Étage *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.floor}
                  onChange={(e) => handleChange('floor', parseInt(e.target.value) || 1)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.floor ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.floor && (
                  <p className="text-red-500 text-sm mt-1">{errors.floor}</p>
                )}
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 30)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.capacity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.capacity && (
                  <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
                )}
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de salle
                </label>
                <select
                  value={formData.room_type}
                  onChange={(e) => handleChange('room_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="classroom">Salle de classe</option>
                  <option value="laboratory">Laboratoire</option>
                  <option value="conference">Salle de conférence</option>
                  <option value="amphitheater">Amphithéâtre</option>
                  <option value="computer_lab">Salle informatique</option>
                  <option value="library">Bibliothèque</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>

            {/* Equipment */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Équipements</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="has_projector"
                    checked={formData.has_projector}
                    onChange={(e) => handleChange('has_projector', e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="has_projector" className="text-sm font-medium text-gray-700">
                    Projecteur
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="has_computer"
                    checked={formData.has_computer}
                    onChange={(e) => handleChange('has_computer', e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="has_computer" className="text-sm font-medium text-gray-700">
                    Ordinateur
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="has_audio_system"
                    checked={formData.has_audio_system}
                    onChange={(e) => handleChange('has_audio_system', e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="has_audio_system" className="text-sm font-medium text-gray-700">
                    Système audio
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="has_whiteboard"
                    checked={formData.has_whiteboard}
                    onChange={(e) => handleChange('has_whiteboard', e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="has_whiteboard" className="text-sm font-medium text-gray-700">
                    Tableau blanc
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_accessible"
                    checked={formData.is_accessible}
                    onChange={(e) => handleChange('is_accessible', e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_accessible" className="text-sm font-medium text-gray-700">
                    Accessible PMR
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Salle active
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Description de la salle (optionnel)"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isEditing ? 'Mettre à jour' : 'Créer la salle'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}