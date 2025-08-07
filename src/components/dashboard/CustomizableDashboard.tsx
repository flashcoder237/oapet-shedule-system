// src/components/dashboard/CustomizableDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Grid3x3,
  Layout,
  Settings,
  Plus,
  X,
  Edit,
  Eye,
  EyeOff,
  Move,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  User,
  BookOpen,
  MapPin,
  Target,
  Zap,
  Activity,
  Award,
  Bell,
  Database,
  FileText,
  Globe,
  Hash,
  Heart,
  Home,
  Info,
  Layers,
  Lock,
  Mail,
  MessageCircle,
  Music,
  Navigation,
  Phone,
  Play,
  Search,
  Share2,
  Shield,
  Star,
  Tag,
  Trash2,
  Upload,
  Video,
  Wifi,
  Download,
  RefreshCw,
  Filter,
  SortAsc,
  ChevronDown,
  MoreVertical,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'calendar' | 'activity' | 'progress' | 'table' | 'metric';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  data: any;
  config: {
    showTitle: boolean;
    showBorder: boolean;
    backgroundColor: string;
    textColor: string;
    refreshInterval?: number;
  };
  isVisible: boolean;
  isLocked: boolean;
}

interface DashboardLayout {
  id: string;
  name: string;
  widgets: Widget[];
  gridSize: { cols: number; rows: number };
  theme: 'light' | 'dark' | 'auto';
}

interface CustomizableDashboardProps {
  initialLayout?: DashboardLayout;
  onLayoutChange?: (layout: DashboardLayout) => void;
  editable?: boolean;
  responsive?: boolean;
}

export default function CustomizableDashboard({
  initialLayout,
  onLayoutChange,
  editable = true,
  responsive = true
}: CustomizableDashboardProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout>(
    initialLayout || {
      id: 'default',
      name: 'Mon Tableau de Bord',
      widgets: [],
      gridSize: { cols: 12, rows: 8 },
      theme: 'light'
    }
  );
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [draggedWidget, setDraggedWidget] = useState<Widget | null>(null);

  // Bibliothèque de widgets disponibles
  const widgetLibrary = [
    {
      type: 'stats',
      title: 'Statistiques',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Affiche des métriques importantes',
      defaultSize: 'small' as const,
      category: 'Métriques'
    },
    {
      type: 'chart',
      title: 'Graphique',
      icon: <PieChart className="w-5 h-5" />,
      description: 'Graphiques et visualisations',
      defaultSize: 'medium' as const,
      category: 'Visualisations'
    },
    {
      type: 'calendar',
      title: 'Calendrier',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Vue calendrier des événements',
      defaultSize: 'large' as const,
      category: 'Planning'
    },
    {
      type: 'activity',
      title: 'Activité',
      icon: <Activity className="w-5 h-5" />,
      description: 'Flux d\'activités récentes',
      defaultSize: 'medium' as const,
      category: 'Social'
    },
    {
      type: 'progress',
      title: 'Progression',
      icon: <Target className="w-5 h-5" />,
      description: 'Barres de progression',
      defaultSize: 'small' as const,
      category: 'Métriques'
    },
    {
      type: 'table',
      title: 'Tableau',
      icon: <Database className="w-5 h-5" />,
      description: 'Données tabulaires',
      defaultSize: 'large' as const,
      category: 'Données'
    },
    {
      type: 'metric',
      title: 'Métrique',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Indicateur simple',
      defaultSize: 'small' as const,
      category: 'Métriques'
    }
  ];

  const themes = [
    { id: 'light', name: 'Clair', icon: <Monitor className="w-4 h-4" /> },
    { id: 'dark', name: 'Sombre', icon: <Monitor className="w-4 h-4" /> },
    { id: 'auto', name: 'Automatique', icon: <Monitor className="w-4 h-4" /> }
  ];

  const getSizeClasses = (size: Widget['size']) => {
    switch (size) {
      case 'small': return 'col-span-3 row-span-2';
      case 'medium': return 'col-span-6 row-span-3';
      case 'large': return 'col-span-12 row-span-4';
      default: return 'col-span-3 row-span-2';
    }
  };

  const getResponsiveSizeClasses = (size: Widget['size'], mode: string) => {
    if (mode === 'mobile') {
      return 'col-span-12'; // Tous les widgets en pleine largeur sur mobile
    }
    if (mode === 'tablet') {
      switch (size) {
        case 'small': return 'col-span-6 row-span-2';
        case 'medium': return 'col-span-12 row-span-3';
        case 'large': return 'col-span-12 row-span-4';
        default: return 'col-span-6 row-span-2';
      }
    }
    return getSizeClasses(size);
  };

  const addWidget = (widgetType: any) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: widgetType.type,
      title: widgetType.title,
      size: widgetType.defaultSize,
      position: { x: 0, y: 0 },
      data: generateSampleData(widgetType.type),
      config: {
        showTitle: true,
        showBorder: true,
        backgroundColor: 'var(--card)',
        textColor: 'var(--foreground),',
        refreshInterval: 300000 // 5 minutes
      },
      isVisible: true,
      isLocked: false
    };

    setCurrentLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));
    setShowWidgetLibrary(false);
  };

  const generateSampleData = (type: string) => {
    // Retourner une structure vide - les données viendront de l'API
    switch (type) {
      case 'stats':
        return {
          value: 0,
          label: 'Chargement...',
          change: '',
          trend: 'neutral'
        };
      case 'chart':
        return {
          type: 'bar',
          data: []
        };
      case 'calendar':
        return {
          events: []
        };
      case 'activity':
        return {
          activities: []
        };
      case 'progress':
        return {
          tasks: []
        };
      case 'table':
        return {
          headers: [],
          rows: []
        };
      case 'metric':
        return {
          value: 0,
          unit: '%',
          label: 'Chargement...',
          color: 'gray'
        };
      default:
        return {};
    }
  };

  const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, ...updates } : w
      )
    }));
  };

  const removeWidget = (widgetId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }));
  };

  const duplicateWidget = (widgetId: string) => {
    const widget = currentLayout.widgets.find(w => w.id === widgetId);
    if (widget) {
      const newWidget = {
        ...widget,
        id: `widget-${Date.now()}`,
        title: `${widget.title} (Copie)`,
        position: { x: widget.position.x + 1, y: widget.position.y + 1 }
      };
      setCurrentLayout(prev => ({
        ...prev,
        widgets: [...prev.widgets, newWidget]
      }));
    }
  };

  const resetLayout = () => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: []
    }));
  };

  const saveLayout = () => {
    onLayoutChange?.(currentLayout);
    setIsEditMode(false);
    // Simulation de sauvegarde
    console.log('Layout sauvegardé:', currentLayout);
  };

  const renderWidget = (widget: Widget) => {
    const { data, config } = widget;

    const baseClasses = `
      relative p-4 rounded-lg transition-all duration-200
      ${config.showBorder ? 'border border-border' : ''}
      ${isEditMode ? 'cursor-move hover:shadow-lg' : ''}
      ${selectedWidget === widget.id ? 'ring-2 ring-primary shadow-lg' : ''}
    `;

    const style = {
      backgroundColor: config.backgroundColor,
      color: config.textColor
    };

    const renderWidgetContent = () => {
      switch (widget.type) {
        case 'stats':
          return (
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {data.value?.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mb-1">{data.label}</div>
              <div className={`text-xs flex items-center justify-center gap-1 ${
                data.trend === 'up' ? 'text-emerald-600' : 'text-destructive'
              }`}>
                <TrendingUp className="w-3 h-3" />
                {data.change}
              </div>
            </div>
          );

        case 'chart':
          return (
            <div className="h-full flex flex-col">
              <div className="flex-1 flex items-end justify-between gap-2 mb-4">
                {data.data?.map((item: any, index: number) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-primary rounded-t w-full mb-1"
                      style={{ height: `${(item.value / 30) * 100}%` }}
                    ></div>
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'calendar':
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Aujourd'hui</h4>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              {data.events?.map((event: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">{event.title}</div>
                    <div className="text-xs text-muted-foreground">{event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          );

        case 'activity':
          return (
            <div className="space-y-3">
              {data.activities?.map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          );

        case 'progress':
          return (
            <div className="space-y-4">
              {data.tasks?.map((task: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{task.name}</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          );

        case 'table':
          return (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {data.headers?.map((header: string, index: number) => (
                      <th key={index} className="text-left py-2 px-1 font-medium text-foreground">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows?.map((row: string[], rowIndex: number) => (
                    <tr key={rowIndex} className="border-b border-border">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="py-2 px-1 text-muted-foreground">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );

        case 'metric':
          return (
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${
                data.color === 'green' ? 'text-emerald-600' : 
                data.color === 'red' ? 'text-destructive' : 'text-blue-600'
              }`}>
                {data.value}{data.unit}
              </div>
              <div className="text-sm text-muted-foreground">{data.label}</div>
              <div className="mt-2">
                <div className={`w-full h-2 rounded-full ${
                  data.color === 'green' ? 'bg-emerald-100' : 
                  data.color === 'red' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <div 
                    className={`h-2 rounded-full ${
                      data.color === 'green' ? 'bg-emerald-500' : 
                      data.color === 'red' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${data.value}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );

        default:
          return (
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-sm">Widget {widget.type}</div>
            </div>
          );
      }
    };

    return (
      <motion.div
        layout
        className={baseClasses}
        style={style}
        onClick={() => isEditMode && setSelectedWidget(widget.id)}
        whileHover={isEditMode ? { scale: 1.02 } : {}}
        transition={{ duration: 0.2 }}
      >
        {/* En-tête du widget */}
        {config.showTitle && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">{widget.title}</h3>
            {isEditMode && (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateWidget(widget.id, { isVisible: !widget.isVisible });
                  }}
                  className="p-1 hover:bg-muted rounded"
                >
                  {widget.isVisible ? 
                    <Eye className="w-3 h-3" /> : 
                    <EyeOff className="w-3 h-3" />
                  }
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Ouvrir menu contextuel
                  }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <MoreVertical className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Contenu du widget */}
        {widget.isVisible && (
          <div className="h-full">
            {renderWidgetContent()}
          </div>
        )}

        {/* Overlay d'édition */}
        {isEditMode && selectedWidget === widget.id && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-primary rounded-lg flex items-center justify-center">
            <div className="bg-card rounded-lg shadow-lg p-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => duplicateWidget(widget.id)}>
                <Copy className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Edit className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => removeWidget(widget.id)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-primary">{currentLayout.name}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={previewMode === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('tablet')}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWidgetLibrary(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Widget
              </Button>
              <Button variant="outline" size="sm" onClick={resetLayout}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button size="sm" onClick={saveLayout}>
                <Save className="w-4 h-4 mr-1" />
                Sauvegarder
              </Button>
            </>
          )}
          
          <Button
            variant={isEditMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Aperçu
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-1" />
                Modifier
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Grille de widgets */}
      <div className="flex-1 p-4 overflow-auto">
        <div className={`
          grid gap-4 h-full
          ${previewMode === 'desktop' ? 'grid-cols-12' : ''}
          ${previewMode === 'tablet' ? 'grid-cols-8' : ''}
          ${previewMode === 'mobile' ? 'grid-cols-1' : ''}
        `}>
          <AnimatePresence>
            {currentLayout.widgets.map(widget => (
              <motion.div
                key={widget.id}
                className={responsive ? 
                  getResponsiveSizeClasses(widget.size, previewMode) : 
                  getSizeClasses(widget.size)
                }
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {renderWidget(widget)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Bibliothèque de widgets */}
      <AnimatePresence>
        {showWidgetLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowWidgetLibrary(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Bibliothèque de Widgets</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWidgetLibrary(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {widgetLibrary.map((widget, index) => (
                    <motion.div
                      key={index}
                      className="p-4 border border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                      onClick={() => addWidget(widget)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {widget.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{widget.title}</h4>
                          <span className="text-xs text-muted-foreground">{widget.category}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{widget.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}