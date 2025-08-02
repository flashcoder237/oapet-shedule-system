# Système Avancé de Planification d'Emploi du Temps Universitaire
# Basé sur les données ITC 2007 avec Machine Learning

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import requests
import os
import json
import joblib
import networkx as nx
from collections import defaultdict
from itertools import combinations
import warnings
warnings.filterwarnings('ignore')

class TimetableDataProcessor:
    """Classe pour traiter les données ITC 2007"""
    
    def __init__(self):
        self.base_url = "https://raw.githubusercontent.com/Docheinstein/itc2007-cct/master/datasets/"
        self.datasets_dir = "itc_datasets"
        
    def download_datasets(self):
        """Télécharge les datasets ITC 2007"""
        os.makedirs(self.datasets_dir, exist_ok=True)
        instances = [f"comp{i:02d}.ctt" for i in range(1, 22)]
        successful_downloads = []
        
        print("Téléchargement des datasets ITC 2007...")
        for instance in instances:
            try:
                url = self.base_url + instance
                response = requests.get(url, timeout=15)
                if response.status_code == 200:
                    file_path = f"{self.datasets_dir}/{instance}"
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(response.text)
                    successful_downloads.append(file_path)
                    print(f"✓ {instance}")
            except Exception as e:
                print(f"✗ Erreur {instance}: {str(e)}")
        
        print(f"Téléchargement terminé: {len(successful_downloads)} fichiers")
        return successful_downloads
    
    def parse_instance(self, file_path):
        """Parse une instance ITC"""
        data = {
            'metadata': {},
            'courses': [],
            'rooms': [],
            'curricula': [],
            'unavailability': [],
            'room_constraints': []
        }
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            lines = content.split('\n')
            sections = content.split('\n\n')
            
            # Parse métadonnées
            for line in lines:
                if ':' in line and not any(line.startswith(prefix) for prefix in 
                    ['COURSES:', 'ROOMS:', 'CURRICULA:', 'UNAVAILABILITY_', 'ROOM_']):
                    key, value = line.split(':', 1)
                    try:
                        data['metadata'][key.strip().lower()] = int(value.strip())
                    except ValueError:
                        data['metadata'][key.strip().lower()] = value.strip()
            
            # Parse sections
            for section in sections:
                section_lines = [line.strip() for line in section.split('\n') if line.strip()]
                if not section_lines:
                    continue
                
                header = section_lines[0]
                data_lines = section_lines[1:]
                
                if header == 'COURSES:':
                    for line in data_lines:
                        parts = line.split()
                        if len(parts) >= 5:
                            data['courses'].append({
                                'id': parts[0],
                                'teacher': parts[1],
                                'lectures': int(parts[2]),
                                'min_days': int(parts[3]),
                                'students': int(parts[4])
                            })
                
                elif header == 'ROOMS:':
                    for line in data_lines:
                        parts = line.split()
                        if len(parts) >= 2:
                            data['rooms'].append({
                                'id': parts[0],
                                'capacity': int(parts[1])
                            })
                
                elif header == 'CURRICULA:':
                    for line in data_lines:
                        parts = line.split()
                        if len(parts) >= 3:
                            data['curricula'].append({
                                'id': parts[0],
                                'num_courses': int(parts[1]),
                                'courses': parts[2:]
                            })
                
                elif header == 'UNAVAILABILITY_CONSTRAINTS:':
                    for line in data_lines:
                        parts = line.split()
                        if len(parts) >= 3:
                            data['unavailability'].append({
                                'course': parts[0],
                                'day': int(parts[1]),
                                'period': int(parts[2])
                            })
                
                elif header == 'ROOM_CONSTRAINTS:':
                    for line in data_lines:
                        parts = line.split()
                        if len(parts) >= 2:
                            data['room_constraints'].append({
                                'course': parts[0],
                                'room': parts[1]
                            })
        
        except Exception as e:
            print(f"Erreur parsing {file_path}: {str(e)}")
        
        return data

class FeatureExtractor:
    """Classe pour extraire les features des données ITC"""
    
    def create_conflict_graph(self, instance_data):
        """Crée un graphe de conflits entre cours"""
        G = nx.Graph()
        
        for course in instance_data['courses']:
            G.add_node(course['id'], **course)
        
        for curriculum in instance_data['curricula']:
            course_pairs = combinations(curriculum['courses'], 2)
            for c1, c2 in course_pairs:
                if G.has_node(c1) and G.has_node(c2):
                    G.add_edge(c1, c2, conflict_type='curriculum')
        
        return G
    
    def extract_features(self, files):
        """Extrait les features de tous les fichiers"""
        all_features = []
        
        processor = TimetableDataProcessor()
        
        for file_path in files:
            instance_name = os.path.basename(file_path).replace('.ctt', '')
            print(f"Traitement {instance_name}...")
            
            data = processor.parse_instance(file_path)
            if not data['courses']:
                continue
            
            conflict_graph = self.create_conflict_graph(data)
            
            # Statistiques globales
            total_lectures = sum(course['lectures'] for course in data['courses'])
            total_periods = data['metadata'].get('days', 5) * data['metadata'].get('periods_per_day', 6)
            avg_room_capacity = np.mean([room['capacity'] for room in data['rooms']])
            
            # Features par cours
            for course in data['courses']:
                course_id = course['id']
                
                features = {
                    'instance': instance_name,
                    'course_id': course_id,
                    'lectures': course['lectures'],
                    'min_days': course['min_days'],
                    'students': course['students'],
                    'teacher': course['teacher'],
                    'total_courses': len(data['courses']),
                    'total_rooms': len(data['rooms']),
                    'total_days': data['metadata'].get('days', 5),
                    'periods_per_day': data['metadata'].get('periods_per_day', 6),
                    'total_curricula': len(data['curricula']),
                    'total_lectures': total_lectures,
                    'avg_room_capacity': avg_room_capacity,
                }
                
                # Features calculées
                features.update({
                    'lecture_density': course['lectures'] / total_periods,
                    'student_lecture_ratio': course['students'] / max(course['lectures'], 1),
                    'course_room_ratio': len(data['courses']) / len(data['rooms']),
                    'utilization_pressure': total_lectures / total_periods,
                    'min_days_constraint_tightness': course['lectures'] / max(course['min_days'], 1),
                })
                
                # Features de réseau
                if conflict_graph.has_node(course_id):
                    neighbors = list(conflict_graph.neighbors(course_id))
                    features.update({
                        'conflict_degree': len(neighbors),
                        'conflict_density': len(neighbors) / max(len(data['courses']) - 1, 1),
                        'clustering_coefficient': nx.clustering(conflict_graph, course_id),
                    })
                    
                    try:
                        centrality = nx.betweenness_centrality(conflict_graph)
                        features['betweenness_centrality'] = centrality.get(course_id, 0)
                    except:
                        features['betweenness_centrality'] = 0
                else:
                    features.update({
                        'conflict_degree': 0,
                        'conflict_density': 0,
                        'clustering_coefficient': 0,
                        'betweenness_centrality': 0,
                    })
                
                # Contraintes
                unavail_constraints = [u for u in data['unavailability'] if u['course'] == course_id]
                features['unavailability_count'] = len(unavail_constraints)
                features['unavailability_ratio'] = len(unavail_constraints) / total_periods
                
                room_constraints = [r for r in data['room_constraints'] if r['course'] == course_id]
                features['room_constraint_count'] = len(room_constraints)
                
                # Score de difficulté composite
                difficulty_components = {
                    'conflict_weight': features['conflict_degree'] * 0.25,
                    'constraint_weight': features['unavailability_count'] * 0.20,
                    'density_weight': features['lecture_density'] * 0.15,
                    'student_weight': min(features['students'] / 1000, 1) * 0.15,
                    'room_pressure_weight': features['course_room_ratio'] * 0.10,
                    'utilization_weight': features['utilization_pressure'] * 0.10,
                    'min_days_weight': max(0, course['lectures'] - course['min_days']) * 0.05
                }
                
                features['difficulty_score'] = sum(difficulty_components.values())
                all_features.append(features)
        
        return pd.DataFrame(all_features)

class TimetableMLModel:
    """Classe principale pour le modèle ML de planification"""
    
    def __init__(self):
        self.models = {}
        self.best_model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = []
        self.results = {}
        
    def prepare_data(self, df):
        """Prépare les données pour l'entraînement"""
        # Features prédictives
        self.feature_names = [
            'lectures', 'min_days', 'students', 'total_courses', 'total_rooms',
            'total_days', 'periods_per_day', 'lecture_density', 'student_lecture_ratio',
            'course_room_ratio', 'utilization_pressure', 'min_days_constraint_tightness',
            'conflict_degree', 'conflict_density', 'clustering_coefficient',
            'betweenness_centrality', 'unavailability_count', 'unavailability_ratio',
            'room_constraint_count'
        ]
        
        # Encodage des variables catégorielles
        self.label_encoders['teacher'] = LabelEncoder()
        self.label_encoders['instance'] = LabelEncoder()
        
        df['teacher_encoded'] = self.label_encoders['teacher'].fit_transform(df['teacher'])
        df['instance_encoded'] = self.label_encoders['instance'].fit_transform(df['instance'])
        
        # Features finales
        X_features = self.feature_names + ['teacher_encoded', 'instance_encoded']
        X = df[X_features].fillna(0)
        y = df['difficulty_score']
        
        return X, y
    
    def create_models(self):
        """Crée les modèles à tester"""
        self.models = {
            'XGBoost': xgb.XGBRegressor(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            ),
            'Random Forest': RandomForestRegressor(
                n_estimators=150,
                max_depth=12,
                random_state=42
            ),
            'Neural Network': MLPRegressor(
                hidden_layer_sizes=(100, 50),
                max_iter=1000,
                random_state=42
            ),
            'Gradient Boosting': GradientBoostingRegressor(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            )
        }
    
    def train_models(self, X, y):
        """Entraîne et évalue tous les modèles"""
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Normalisation pour les modèles qui en ont besoin
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        print("Entraînement des modèles...")
        for name, model in self.models.items():
            print(f"  {name}...")
            
            # Choix des données selon le modèle
            if name == 'Neural Network':
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
                cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='r2')
            else:
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='r2')
            
            # Métriques
            mse = mean_squared_error(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            self.results[name] = {
                'model': model,
                'mse': mse,
                'mae': mae,
                'r2': r2,
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std()
            }
        
        # Sélection du meilleur modèle
        best_name = max(self.results.keys(), key=lambda k: self.results[k]['r2'])
        self.best_model = self.results[best_name]['model']
        
        return best_name, self.results
    
    def save_model(self, model_dir='models'):
        """Sauvegarde le modèle et ses composants"""
        os.makedirs(model_dir, exist_ok=True)
        
        # Sauvegarde du modèle
        joblib.dump(self.best_model, f'{model_dir}/timetable_model.pkl')
        joblib.dump(self.scaler, f'{model_dir}/scaler.pkl')
        
        # Sauvegarde des encodeurs
        for name, encoder in self.label_encoders.items():
            joblib.dump(encoder, f'{model_dir}/{name}_encoder.pkl')
        
        # Métadonnées
        metadata = {
            'feature_names': self.feature_names + ['teacher_encoded', 'instance_encoded'],
            'model_type': type(self.best_model).__name__,
            'performance': {name: {k: v for k, v in results.items() if k != 'model'} 
                          for name, results in self.results.items()}
        }
        
        with open(f'{model_dir}/metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Modèle sauvegardé dans {model_dir}/")
        return model_dir

class TimetablePredictor:
    """Classe pour utiliser le modèle entraîné"""
    
    def __init__(self, model_dir='models'):
        self.model = joblib.load(f'{model_dir}/timetable_model.pkl')
        self.scaler = joblib.load(f'{model_dir}/scaler.pkl')
        
        # Chargement des encodeurs
        self.label_encoders = {}
        encoder_files = ['teacher_encoder.pkl', 'instance_encoder.pkl']
        for encoder_file in encoder_files:
            name = encoder_file.replace('_encoder.pkl', '')
            self.label_encoders[name] = joblib.load(f'{model_dir}/{encoder_file}')
        
        # Métadonnées
        with open(f'{model_dir}/metadata.json', 'r') as f:
            self.metadata = json.load(f)
        
        self.feature_names = self.metadata['feature_names']
    
    def predict_difficulty(self, course_data):
        """Prédit la difficulté de planification d'un cours"""
        # Préparer les features
        features = {}
        for feature in self.feature_names:
            if feature.endswith('_encoded'):
                # Gestion des variables encodées
                original_feature = feature.replace('_encoded', '')
                if original_feature in course_data:
                    try:
                        encoded_value = self.label_encoders[original_feature].transform([course_data[original_feature]])[0]
                        features[feature] = encoded_value
                    except ValueError:
                        features[feature] = 0  # Valeur inconnue
                else:
                    features[feature] = 0
            else:
                features[feature] = course_data.get(feature, 0)
        
        # Prédiction
        feature_vector = np.array([features[f] for f in self.feature_names]).reshape(1, -1)
        
        if isinstance(self.model, MLPRegressor):
            feature_vector = self.scaler.transform(feature_vector)
        
        difficulty = self.model.predict(feature_vector)[0]
        
        # Classification
        if difficulty < 0.3:
            level = "Faible"
            priority = 3
        elif difficulty < 0.7:
            level = "Moyenne"
            priority = 2
        else:
            level = "Élevée"
            priority = 1
        
        return {
            'difficulty_score': difficulty,
            'complexity_level': level,
            'priority': priority,
            'recommendations': self._get_recommendations(level, course_data)
        }
    
    def _get_recommendations(self, level, course_data):
        """Génère des recommandations basées sur la complexité"""
        recommendations = []
        
        if level == "Élevée":
            recommendations.extend([
                "Planifier en priorité absolue",
                "Allouer les meilleurs créneaux",
                "Prévoir des alternatives",
                "Assigner une salle adaptée"
            ])
        elif level == "Moyenne":
            recommendations.extend([
                "Planifier après les cours prioritaires",
                "Vérifier les contraintes",
                "Optimiser l'utilisation des ressources"
            ])
        else:
            recommendations.extend([
                "Flexible pour combler les créneaux",
                "Peut être reprogrammé si nécessaire"
            ])
        
        # Recommandations spécifiques
        if course_data.get('students', 0) > 100:
            recommendations.append("Nécessite une grande salle")
        
        if course_data.get('lectures', 0) > 3:
            recommendations.append("Étaler sur plusieurs jours")
        
        return recommendations

def main():
    """Fonction principale pour créer le modèle"""
    print("SYSTÈME DE PLANIFICATION D'EMPLOI DU TEMPS UNIVERSITAIRE")
    print("=" * 60)
    
    # 1. Téléchargement et traitement des données
    processor = TimetableDataProcessor()
    files = processor.download_datasets()
    
    if not files:
        print("Aucun fichier téléchargé. Vérifiez votre connexion internet.")
        return
    
    # 2. Extraction des features
    print("\nExtraction des features...")
    extractor = FeatureExtractor()
    df = extractor.extract_features(files)
    
    if df.empty:
        print("Aucune donnée extraite.")
        return
    
    print(f"Dataset créé: {len(df)} cours de {df['instance'].nunique()} instances")
    
    # 3. Analyse exploratoire rapide
    print("\nAnalyse des données:")
    print(f"  - Score de difficulté moyen: {df['difficulty_score'].mean():.3f}")
    print(f"  - Écart-type: {df['difficulty_score'].std():.3f}")
    print(f"  - Conflits moyens par cours: {df['conflict_degree'].mean():.1f}")
    
    # 4. Entraînement des modèles
    print("\nEntraînement des modèles ML...")
    ml_model = TimetableMLModel()
    ml_model.create_models()
    
    X, y = ml_model.prepare_data(df)
    best_name, results = ml_model.train_models(X, y)
    
    # 5. Affichage des résultats
    print(f"\nMeilleur modèle: {best_name}")
    print("Performances:")
    for name, result in sorted(results.items(), key=lambda x: x[1]['r2'], reverse=True):
        print(f"  {name}: R² = {result['r2']:.4f}, MAE = {result['mae']:.4f}")
    
    # 6. Sauvegarde
    model_dir = ml_model.save_model()
    
    # 7. Test du modèle sauvegardé
    print(f"\nTest du modèle sauvegardé...")
    predictor = TimetablePredictor(model_dir)
    
    # Test avec un cours exemple
    test_course = {
        'lectures': 3,
        'min_days': 2,
        'students': 120,
        'teacher': 'Prof_Smith',
        'instance': 'comp01',
        'total_courses': 30,
        'total_rooms': 10,
        'total_days': 5,
        'periods_per_day': 6,
        'lecture_density': 0.1,
        'student_lecture_ratio': 40,
        'course_room_ratio': 3,
        'utilization_pressure': 0.7,
        'min_days_constraint_tightness': 1.5,
        'conflict_degree': 4,
        'conflict_density': 0.15,
        'clustering_coefficient': 0.3,
        'betweenness_centrality': 0.1,
        'unavailability_count': 2,
        'unavailability_ratio': 0.067,
        'room_constraint_count': 1
    }
    
    prediction = predictor.predict_difficulty(test_course)
    print(f"Test - Difficulté: {prediction['difficulty_score']:.3f} ({prediction['complexity_level']})")
    
    print(f"\n✓ Système créé avec succès!")
    print(f"✓ Modèles sauvegardés dans {model_dir}/")
    print(f"✓ Prêt pour utilisation en production")

if __name__ == "__main__":
    main()