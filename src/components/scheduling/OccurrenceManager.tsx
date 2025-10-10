// src/components/scheduling/OccurrenceManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  X,
  Edit,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  CalendarDays,
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { LoadingSpinner } from '@/components/ui/loading';

interface SessionOccurrence {
  id: number;
  session_template: number;
  actual_date: string;
  start_time: string;
  end_time: string;
  room: any;
  teacher: any;
  status: string;
  course_code: string;
  course_name: string;
  room_code: string;
  teacher_name: string;
  is_cancelled: boolean;
  is_room_modified: boolean;
  is_teacher_modified: boolean;
  is_time_modified: boolean;
  cancellation_reason?: string;
}

interface OccurrenceManagerProps {
  scheduleId?: number;
  dateFrom?: string;
  dateTo?: string;
}

const OccurrenceManager: React.FC<OccurrenceManagerProps> = ({
  scheduleId,
  dateFrom,
  dateTo,
}) => {
  const [occurrences, setOccurrences] = useState<SessionOccurrence[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState<SessionOccurrence | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // États pour reprogrammation
  const [rescheduleData, setRescheduleData] = useState({
    new_date: '',
    new_start_time: '',
    new_end_time: '',
    reason: '',
  });

  // États pour modification
  const [modifyData, setModifyData] = useState({
    room: '',
    teacher: '',
    notes: '',
  });

  useEffect(() => {
    loadOccurrences();
  }, [scheduleId, dateFrom, dateTo]);

  const loadOccurrences = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (scheduleId) params.append('schedule', scheduleId.toString());
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await axios.get(`/api/schedules/occurrences/?${params.toString()}`);
      setOccurrences(response.data.results || response.data);
    } catch (err: any) {
      setError('Erreur lors du chargement des occurrences');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOccurrence = (occurrence: SessionOccurrence) => {
    setSelectedOccurrence(occurrence);
  };

  const openCancelDialog = () => {
    setCancelDialogOpen(true);
  };

  const openRescheduleDialog = () => {
    if (selectedOccurrence) {
      setRescheduleData({
        new_date: selectedOccurrence.actual_date,
        new_start_time: selectedOccurrence.start_time,
        new_end_time: selectedOccurrence.end_time,
        reason: '',
      });
    }
    setRescheduleDialogOpen(true);
  };

  const openModifyDialog = () => {
    if (selectedOccurrence) {
      setModifyData({
        room: selectedOccurrence.room?.toString() || '',
        teacher: selectedOccurrence.teacher?.toString() || '',
        notes: '',
      });
    }
    setModifyDialogOpen(true);
  };

  const handleModifyOccurrence = async () => {
    if (!selectedOccurrence) return;

    try {
      setLoading(true);
      await axios.patch(`/api/schedules/occurrences/${selectedOccurrence.id}/`, {
        room: modifyData.room ? parseInt(modifyData.room) : null,
        teacher: modifyData.teacher ? parseInt(modifyData.teacher) : null,
        notes: modifyData.notes,
      });

      setSuccess('Séance modifiée avec succès');
      setModifyDialogOpen(false);
      loadOccurrences();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOccurrence = async () => {
    if (!selectedOccurrence) return;

    try {
      setLoading(true);
      await axios.post(`/api/schedules/occurrences/${selectedOccurrence.id}/cancel/`, {
        reason: cancellationReason,
        notify_students: true,
        notify_teacher: true,
      });

      setSuccess('Séance annulée avec succès');
      setCancelDialogOpen(false);
      setCancellationReason('');
      loadOccurrences();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'annulation');
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleOccurrence = async () => {
    if (!selectedOccurrence) return;

    try {
      setLoading(true);
      await axios.post(`/api/schedules/occurrences/${selectedOccurrence.id}/reschedule/`, {
        new_date: rescheduleData.new_date,
        new_start_time: rescheduleData.new_start_time,
        new_end_time: rescheduleData.new_end_time,
        reason: rescheduleData.reason,
        notify_students: true,
        notify_teacher: true,
      });

      setSuccess('Séance reprogrammée avec succès');
      setRescheduleDialogOpen(false);
      loadOccurrences();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la reprogrammation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (occurrence: SessionOccurrence): 'default' | 'secondary' | 'destructive' => {
    if (occurrence.is_cancelled) return 'destructive';
    if (occurrence.status === 'completed') return 'secondary';
    return 'default';
  };

  const getStatusLabel = (occurrence: SessionOccurrence) => {
    if (occurrence.is_cancelled) return 'Annulé';
    if (occurrence.status === 'completed') return 'Terminé';
    if (occurrence.status === 'in_progress') return 'En cours';
    if (occurrence.is_room_modified || occurrence.is_teacher_modified || occurrence.is_time_modified) {
      return 'Modifié';
    }
    return 'Planifié';
  };

  if (loading && occurrences.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <CardTitle>Gestion des séances</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              {occurrences.length} séance(s)
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="relative">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6"
                onClick={() => setError(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}

          {success && (
            <Alert className="relative bg-green-50 text-green-900 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6"
                onClick={() => setSuccess(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}

          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Heure</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Cours</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Salle</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Enseignant</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {occurrences.map((occurrence) => (
                    <tr
                      key={occurrence.id}
                      className={`
                        ${occurrence.is_cancelled ? 'bg-red-50/50 opacity-60' : ''}
                        ${occurrence.is_room_modified || occurrence.is_teacher_modified ? 'bg-yellow-50/50' : ''}
                        hover:bg-muted/30 transition-colors
                      `}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(occurrence.actual_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {occurrence.start_time} - {occurrence.end_time}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{occurrence.course_name}</p>
                          <p className="text-xs text-muted-foreground">{occurrence.course_code}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{occurrence.room_code}</span>
                          {occurrence.is_room_modified && (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              </TooltipTrigger>
                              <TooltipContent>Salle modifiée</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{occurrence.teacher_name}</span>
                          {occurrence.is_teacher_modified && (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              </TooltipTrigger>
                              <TooltipContent>Enseignant modifié</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusVariant(occurrence)} className="text-xs">
                          {getStatusLabel(occurrence)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!occurrence.is_cancelled && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleSelectOccurrence(occurrence)}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={openModifyDialog}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={openRescheduleDialog}>
                                <Clock className="mr-2 h-4 w-4" />
                                Reprogrammer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={openCancelDialog}
                                className="text-destructive focus:text-destructive"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Annuler
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dialog d'annulation */}
          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Annuler la séance</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <label className="text-sm font-medium mb-2 block">
                  Raison de l&apos;annulation
                </label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Entrez la raison de l'annulation..."
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                  Fermer
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelOccurrence}
                  disabled={!cancellationReason || loading}
                  loading={loading}
                >
                  Annuler la séance
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog de reprogrammation */}
          <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reprogrammer la séance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nouvelle date</label>
                  <Input
                    type="date"
                    value={rescheduleData.new_date}
                    onChange={(e) =>
                      setRescheduleData({ ...rescheduleData, new_date: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Heure de début</label>
                    <Input
                      type="time"
                      value={rescheduleData.new_start_time}
                      onChange={(e) =>
                        setRescheduleData({ ...rescheduleData, new_start_time: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Heure de fin</label>
                    <Input
                      type="time"
                      value={rescheduleData.new_end_time}
                      onChange={(e) =>
                        setRescheduleData({ ...rescheduleData, new_end_time: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Raison de la reprogrammation (optionnel)
                  </label>
                  <textarea
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={rescheduleData.reason}
                    onChange={(e) =>
                      setRescheduleData({ ...rescheduleData, reason: e.target.value })
                    }
                    placeholder="Entrez la raison (optionnel)..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleRescheduleOccurrence}
                  disabled={loading}
                  loading={loading}
                >
                  Reprogrammer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog de modification */}
          <Dialog open={modifyDialogOpen} onOpenChange={setModifyDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier la séance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {selectedOccurrence && (
                  <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">{selectedOccurrence.course_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {new Date(selectedOccurrence.actual_date).toLocaleDateString('fr-FR')} - {selectedOccurrence.start_time} à {selectedOccurrence.end_time}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Salle
                  </label>
                  <Input
                    type="text"
                    value={modifyData.room}
                    onChange={(e) =>
                      setModifyData({ ...modifyData, room: e.target.value })
                    }
                    placeholder="ID ou code de la nouvelle salle"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Actuel: {selectedOccurrence?.room_code || 'Non défini'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Enseignant
                  </label>
                  <Input
                    type="text"
                    value={modifyData.teacher}
                    onChange={(e) =>
                      setModifyData({ ...modifyData, teacher: e.target.value })
                    }
                    placeholder="ID du nouvel enseignant"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Actuel: {selectedOccurrence?.teacher_name || 'Non défini'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Notes (optionnel)
                  </label>
                  <textarea
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={modifyData.notes}
                    onChange={(e) =>
                      setModifyData({ ...modifyData, notes: e.target.value })
                    }
                    placeholder="Raison de la modification..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModifyDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleModifyOccurrence}
                  disabled={loading}
                  loading={loading}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default OccurrenceManager;
