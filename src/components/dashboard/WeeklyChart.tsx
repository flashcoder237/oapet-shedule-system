// src/components/dashboard/WeeklyChart.tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, BarChart3, TrendingUp, Filter } from 'lucide-react';

interface ChartData {
  day: string;
  courses: number;
  students: number;
  efficiency: number;
}

interface WeeklyChartProps {
  weekData?: ChartData[];
}

export default function WeeklyChart({ weekData = [] }: WeeklyChartProps) {
  // Les données viennent maintenant des props

  if (weekData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analyse Hebdomadaire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune donnée hebdomadaire disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCourses = Math.max(...weekData.map(d => d.courses));
  const maxStudents = Math.max(...weekData.map(d => d.students));

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analyse hebdomadaire
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filtrer
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-1" />
              Période
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Graphique principal */}
          <div className="relative h-64 bg-gradient-to-t from-primary-subtle/10 to-transparent rounded-lg p-4">
            <div className="absolute inset-4 flex items-end justify-between">
              {weekData.map((data, index) => (
                <motion.div
                  key={data.day}
                  className="flex flex-col items-center space-y-2"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Barre des cours */}
                  <div className="relative flex flex-col items-center">
                    <motion.div
                      className="w-8 bg-gradient-to-t from-primary to-accent rounded-t-md relative group cursor-pointer"
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.courses / maxCourses) * 120}px` }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {data.courses} cours
                      </div>
                    </motion.div>
                    
                    {/* Indicateur d'efficacité */}
                    <motion.div
                      className={`w-3 h-3 rounded-full mt-2 ${
                        data.efficiency >= 90 ? 'bg-green-500' :
                        data.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                    />
                  </div>
                  
                  {/* Label du jour */}
                  <span className="text-sm font-medium text-secondary">
                    {data.day}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Métriques détaillées */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center p-4 bg-surface rounded-lg"
            >
              <div className="text-2xl font-bold text-primary mb-1">
                {weekData.reduce((sum, d) => sum + d.courses, 0)}
              </div>
              <div className="text-sm text-secondary">Total cours</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+12%</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center p-4 bg-surface rounded-lg"
            >
              <div className="text-2xl font-bold text-primary mb-1">
                {Math.round(weekData.reduce((sum, d) => sum + d.efficiency, 0) / weekData.length)}%
              </div>
              <div className="text-sm text-secondary">Efficacité moy.</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+5%</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center p-4 bg-surface rounded-lg"
            >
              <div className="text-2xl font-bold text-primary mb-1">
                {weekData.reduce((sum, d) => sum + d.students, 0)}
              </div>
              <div className="text-sm text-secondary">Total étudiants</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+8%</span>
              </div>
            </motion.div>
          </div>

          {/* Légende */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center space-x-6 text-sm"
          >
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-t from-primary to-accent rounded"></div>
              <span className="text-secondary">Nombre de cours</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-secondary">Efficacité ≥90%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-secondary">Efficacité 80-89%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-secondary">Efficacité &lt;80%</span>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}