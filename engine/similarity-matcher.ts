/**
 * Similarity matching engine for finding comparable cohorts
 */

import { Demographics } from '../models/assessment-data';

export interface SimilarityConfig {
  weights: {
    fsm: number;          // Weight for FSM% similarity (default: 0.4)
    eal: number;          // Weight for EAL% similarity (default: 0.3)
    send: number;         // Weight for SEND% similarity (default: 0.3)
  };
  minSimilarityScore: number;  // Minimum threshold (0-1, default: 0.7)
  maxResults: number;          // Maximum cohorts to return (default: 10)
}

export const DEFAULT_SIMILARITY_CONFIG: SimilarityConfig = {
  weights: {
    fsm: 0.4,
    eal: 0.3,
    send: 0.3,
  },
  minSimilarityScore: 0.7,
  maxResults: 10,
};

export interface CohortWithDemographics {
  cohortId: string;
  cohortName: string;
  demographics: Demographics;
}

export interface SimilarCohortMatch extends CohortWithDemographics {
  similarityScore: number;
  demographicBreakdown: {
    fsmSimilarity: number;
    ealSimilarity: number;
    sendSimilarity: number;
  };
}

/**
 * Calculate similarity score between two demographic profiles
 * Returns a score between 0 (completely different) and 1 (identical)
 */
export function calculateSimilarity(
  target: Demographics,
  candidate: Demographics,
  config: Partial<SimilarityConfig> = {}
): number {
  // Merge with defaults
  const weights = config.weights || DEFAULT_SIMILARITY_CONFIG.weights;

  // Calculate similarity for each dimension using inverse of normalized difference
  // Formula: 1 - (|target - candidate| / 100)
  const fsmSimilarity = 1 - Math.abs(target.fsmPercentage - candidate.fsmPercentage) / 100;
  const ealSimilarity = 1 - Math.abs(target.ealPercentage - candidate.ealPercentage) / 100;
  const sendSimilarity = 1 - Math.abs(target.sendPercentage - candidate.sendPercentage) / 100;

  // Weighted average
  const overallSimilarity =
    fsmSimilarity * weights.fsm +
    ealSimilarity * weights.eal +
    sendSimilarity * weights.send;

  return overallSimilarity;
}

/**
 * Find similar cohorts to a target cohort
 */
export function findSimilarCohorts(
  target: CohortWithDemographics,
  candidates: CohortWithDemographics[],
  config: Partial<SimilarityConfig> = {}
): SimilarCohortMatch[] {
  // Merge with defaults
  const fullConfig: SimilarityConfig = {
    weights: config.weights || DEFAULT_SIMILARITY_CONFIG.weights,
    minSimilarityScore: config.minSimilarityScore ?? DEFAULT_SIMILARITY_CONFIG.minSimilarityScore,
    maxResults: config.maxResults ?? DEFAULT_SIMILARITY_CONFIG.maxResults,
  };

  // Calculate similarity for each candidate
  const matches: SimilarCohortMatch[] = candidates
    .filter(c => c.cohortId !== target.cohortId) // Exclude self
    .map(candidate => {
      const fsmSimilarity = 1 - Math.abs(target.demographics.fsmPercentage - candidate.demographics.fsmPercentage) / 100;
      const ealSimilarity = 1 - Math.abs(target.demographics.ealPercentage - candidate.demographics.ealPercentage) / 100;
      const sendSimilarity = 1 - Math.abs(target.demographics.sendPercentage - candidate.demographics.sendPercentage) / 100;

      const similarityScore =
        fsmSimilarity * fullConfig.weights.fsm +
        ealSimilarity * fullConfig.weights.eal +
        sendSimilarity * fullConfig.weights.send;

      return {
        ...candidate,
        similarityScore,
        demographicBreakdown: {
          fsmSimilarity,
          ealSimilarity,
          sendSimilarity,
        },
      };
    })
    .filter(match => match.similarityScore >= fullConfig.minSimilarityScore)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, fullConfig.maxResults);

  return matches;
}

/**
 * Calculate demographic distance (opposite of similarity)
 * Useful for identifying outliers
 */
export function calculateDemographicDistance(
  target: Demographics,
  candidate: Demographics
): number {
  const fsmDiff = Math.abs(target.fsmPercentage - candidate.fsmPercentage);
  const ealDiff = Math.abs(target.ealPercentage - candidate.ealPercentage);
  const sendDiff = Math.abs(target.sendPercentage - candidate.sendPercentage);

  // Euclidean distance in 3D space (normalized to 0-100 scale)
  return Math.sqrt(
    Math.pow(fsmDiff, 2) +
    Math.pow(ealDiff, 2) +
    Math.pow(sendDiff, 2)
  ) / Math.sqrt(3 * Math.pow(100, 2)); // Normalize to 0-1
}

/**
 * Group cohorts by demographic profile using clustering
 * Useful for MAT-level analysis
 */
export interface DemographicCluster {
  clusterId: string;
  centroid: Demographics;
  cohorts: CohortWithDemographics[];
  avgFSM: number;
  avgEAL: number;
  avgSEND: number;
}

export function clusterCohortsByDemographics(
  cohorts: CohortWithDemographics[],
  maxClusters: number = 5
): DemographicCluster[] {
  // Simple k-means clustering implementation
  // In production, consider using a library like ml-kmeans

  if (cohorts.length === 0) return [];
  if (cohorts.length <= maxClusters) {
    // Each cohort is its own cluster
    return cohorts.map(c => ({
      clusterId: c.cohortId,
      centroid: c.demographics,
      cohorts: [c],
      avgFSM: c.demographics.fsmPercentage,
      avgEAL: c.demographics.ealPercentage,
      avgSEND: c.demographics.sendPercentage,
    }));
  }

  // Initialize centroids (use first k cohorts)
  let centroids: Demographics[] = cohorts
    .slice(0, maxClusters)
    .map(c => c.demographics);

  let clusters: DemographicCluster[] = [];
  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations) {
    // Assign each cohort to nearest centroid
    clusters = centroids.map((centroid, idx) => ({
      clusterId: `cluster_${idx}`,
      centroid,
      cohorts: [],
      avgFSM: 0,
      avgEAL: 0,
      avgSEND: 0,
    }));

    cohorts.forEach(cohort => {
      // Find nearest cluster
      let minDistance = Infinity;
      let nearestClusterIdx = 0;

      centroids.forEach((centroid, idx) => {
        const distance = calculateDemographicDistance(cohort.demographics, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          nearestClusterIdx = idx;
        }
      });

      clusters[nearestClusterIdx].cohorts.push(cohort);
    });

    // Recalculate centroids
    const newCentroids = clusters.map(cluster => {
      if (cluster.cohorts.length === 0) {
        return cluster.centroid; // Keep old centroid if no cohorts assigned
      }

      const avgFSM = cluster.cohorts.reduce((sum, c) => sum + c.demographics.fsmPercentage, 0) / cluster.cohorts.length;
      const avgEAL = cluster.cohorts.reduce((sum, c) => sum + c.demographics.ealPercentage, 0) / cluster.cohorts.length;
      const avgSEND = cluster.cohorts.reduce((sum, c) => sum + c.demographics.sendPercentage, 0) / cluster.cohorts.length;

      cluster.avgFSM = avgFSM;
      cluster.avgEAL = avgEAL;
      cluster.avgSEND = avgSEND;

      return {
        cohortId: '',
        cohortType: 'school' as const,
        fsmPercentage: avgFSM,
        ealPercentage: avgEAL,
        sendPercentage: avgSEND,
        studentCount: 0,
      };
    });

    // Check for convergence
    const hasConverged = centroids.every((old, idx) => {
      const newCentroid = newCentroids[idx];
      return (
        Math.abs(old.fsmPercentage - newCentroid.fsmPercentage) < 1 &&
        Math.abs(old.ealPercentage - newCentroid.ealPercentage) < 1 &&
        Math.abs(old.sendPercentage - newCentroid.sendPercentage) < 1
      );
    });

    if (hasConverged) break;

    centroids = newCentroids;
    iterations++;
  }

  // Filter out empty clusters
  return clusters.filter(c => c.cohorts.length > 0);
}
