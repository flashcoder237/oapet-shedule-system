// src/lib/api/optimizedClient.ts
import { apiClient } from './client';

interface RequestBatchItem {
  endpoint: string;
  params?: Record<string, any>;
  resolve: (data: any) => void;
  reject: (error: Error) => void;
}

class OptimizedApiClient {
  private batchQueue: RequestBatchItem[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 50; // 50ms pour regrouper les requêtes

  // Méthode pour batching les requêtes GET
  async batchGet<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.batchQueue.push({
        endpoint,
        params,
        resolve,
        reject,
      });

      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }

      this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, this.BATCH_DELAY);
    });
  }

  private async processBatch() {
    if (this.batchQueue.length === 0) return;

    const currentBatch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimeout = null;

    // Regrouper les requêtes similaires
    const groupedRequests = new Map<string, RequestBatchItem[]>();
    
    currentBatch.forEach(item => {
      const key = `${item.endpoint}:${JSON.stringify(item.params || {})}`;
      if (!groupedRequests.has(key)) {
        groupedRequests.set(key, []);
      }
      groupedRequests.get(key)!.push(item);
    });

    // Traiter chaque groupe
    for (const [key, requests] of groupedRequests) {
      const firstRequest = requests[0];
      
      try {
        const data = await apiClient.get(firstRequest.endpoint, firstRequest.params);
        
        // Résoudre toutes les promesses du groupe avec les mêmes données
        requests.forEach(request => request.resolve(data));
      } catch (error) {
        // Rejeter toutes les promesses du groupe
        requests.forEach(request => request.reject(error as Error));
      }
    }
  }

  // Précharger des données
  async prefetch(endpoints: Array<{ endpoint: string; params?: Record<string, any> }>) {
    const promises = endpoints.map(({ endpoint, params }) => 
      apiClient.get(endpoint, params).catch(() => null) // Ignorer les erreurs de préchargement
    );
    
    return Promise.allSettled(promises);
  }

  // Invalider le cache pour des patterns spécifiques
  invalidateQueries(patterns: string[]) {
    patterns.forEach(pattern => {
      apiClient.invalidateCache(pattern);
    });
  }

  // Optimisation pour les listes avec pagination
  async getOptimizedList<T>(
    baseEndpoint: string,
    options: {
      page?: number;
      pageSize?: number;
      filters?: Record<string, any>;
      prefetchNext?: boolean;
    } = {}
  ) {
    const { page = 1, pageSize = 20, filters = {}, prefetchNext = true } = options;
    
    const params = {
      page,
      page_size: pageSize,
      ...filters,
    };

    // Récupérer la page demandée
    const data = await apiClient.get<T>(baseEndpoint, params);

    // Précharger la page suivante si demandé
    if (prefetchNext && page < Math.ceil((data as any).count / pageSize)) {
      this.prefetch([{
        endpoint: baseEndpoint,
        params: { ...params, page: page + 1 }
      }]);
    }

    return data;
  }
}

export const optimizedApiClient = new OptimizedApiClient();