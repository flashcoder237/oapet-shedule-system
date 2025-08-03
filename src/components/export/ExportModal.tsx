// src/components/export/ExportModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  FileText, 
  Table, 
  Calendar,
  Printer,
  Mail,
  Settings,
  CheckCircle,
  Clock,
  Users,
  Building
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any;
  type: 'schedule' | 'courses' | 'rooms' | 'stats';
}

export default function ExportModal({ isOpen, onClose, data, type }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv' | 'ical'>('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeImages: true,
    includeStats: true,
    includeNotes: false,
    dateRange: 'current_week',
    departments: [],
    levels: []
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const formats = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Format portable, idéal pour l\'impression',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200'
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Fichier Excel pour analyse et modification',
      icon: <Table className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200'
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Format compatible avec tous les logiciels',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'ical',
      name: 'iCal',
      description: 'Calendrier pour Outlook, Google Calendar',
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200'
    }
  ];

  const dateRanges = [
    { id: 'current_week', name: 'Semaine actuelle' },
    { id: 'current_month', name: 'Mois actuel' },
    { id: 'current_semester', name: 'Semestre actuel' },
    { id: 'academic_year', name: 'Année académique' },
    { id: 'custom', name: 'Période personnalisée' }
  ];

  const departments = [
    'Médecine', 'Pharmacie', 'Dentaire', 'Sciences Infirmières', 'Kinésithérapie'
  ];

  const levels = [
    'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'M1', 'M2', 'D1', 'D2', 'D3'
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulation de l'export
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsExporting(false);
    setExportComplete(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setExportComplete(false);
      onClose();
    }, 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    // Logique d'envoi par email
    console.log('Envoi par email...');
  };

  const getTitle = () => {
    switch (type) {
      case 'schedule': return 'Exporter l\'emploi du temps';
      case 'courses': return 'Exporter les cours';
      case 'rooms': return 'Exporter les salles';
      case 'stats': return 'Exporter les statistiques';
      default: return 'Exporter les données';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-auto"
        >
          <Card>
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Download className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">{getTitle()}</h2>
                    <p className="text-secondary text-sm">
                      Choisissez le format et les options d'export
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {exportComplete ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    Export terminé !
                  </h3>
                  <p className="text-secondary">
                    Le fichier a été téléchargé avec succès
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Formats */}
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-4">
                      Format d'export
                    </h3>
                    <div className="space-y-3">
                      {formats.map((format) => (
                        <motion.div
                          key={format.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedFormat === format.id
                              ? `${format.bgColor} border-current ${format.color}`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedFormat(format.id as any)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={selectedFormat === format.id ? format.color : 'text-gray-400'}>
                              {format.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-primary">{format.name}</h4>
                              <p className="text-sm text-secondary">{format.description}</p>
                            </div>
                            {selectedFormat === format.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`w-5 h-5 rounded-full ${format.color.replace('text-', 'bg-')} flex items-center justify-center`}
                              >
                                <CheckCircle className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Options */}
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-4">
                      Options d'export
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Période */}
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">
                          Période
                        </label>
                        <select
                          value={exportOptions.dateRange}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.value }))}
                          className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          {dateRanges.map(range => (
                            <option key={range.id} value={range.id}>{range.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Contenu */}
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2">
                          Contenu à inclure
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={exportOptions.includeImages}
                              onChange={(e) => setExportOptions(prev => ({ 
                                ...prev, 
                                includeImages: e.target.checked 
                              }))}
                              className="rounded"
                            />
                            <span className="ml-2 text-sm">Images et logos</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={exportOptions.includeStats}
                              onChange={(e) => setExportOptions(prev => ({ 
                                ...prev, 
                                includeStats: e.target.checked 
                              }))}
                              className="rounded"
                            />
                            <span className="ml-2 text-sm">Statistiques</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={exportOptions.includeNotes}
                              onChange={(e) => setExportOptions(prev => ({ 
                                ...prev, 
                                includeNotes: e.target.checked 
                              }))}
                              className="rounded"
                            />
                            <span className="ml-2 text-sm">Notes et commentaires</span>
                          </label>
                        </div>
                      </div>

                      {/* Filtres */}
                      {type === 'schedule' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-primary mb-2">
                              Départements
                            </label>
                            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                              {departments.map(dept => (
                                <label key={dept} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    value={dept}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setExportOptions(prev => ({
                                          ...prev,
                                          departments: [...prev.departments, dept] as any
                                        }));
                                      } else {
                                        setExportOptions(prev => ({
                                          ...prev,
                                          departments: prev.departments.filter((d: string) => d !== dept)
                                        }));
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <span className="ml-2 text-xs">{dept}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-primary mb-2">
                              Niveaux
                            </label>
                            <div className="grid grid-cols-3 gap-2 max-h-24 overflow-y-auto">
                              {levels.map(level => (
                                <label key={level} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    value={level}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setExportOptions(prev => ({
                                          ...prev,
                                          levels: [...prev.levels, level] as any
                                        }));
                                      } else {
                                        setExportOptions(prev => ({
                                          ...prev,
                                          levels: prev.levels.filter((l: string) => l !== level)
                                        }));
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <span className="ml-2 text-xs">{level}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {!exportComplete && (
                <div className="flex justify-between pt-6 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handlePrint}
                      disabled={isExporting}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleEmail}
                      disabled={isExporting}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={isExporting}
                    >
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleExport}
                      disabled={isExporting}
                    >
                      {isExporting ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Export en cours...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Exporter
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}