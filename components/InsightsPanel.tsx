/**
 * React component for displaying AI-generated insights
 */

import React, { useState, useEffect } from 'react';
import { InsightPanel, Insight, Recommendation, InsightSeverity } from '../models/insights';
import { ViewLevel } from '../models/insights';

interface InsightsPanelProps {
  viewLevel: ViewLevel;
  cohortId: string;
  assessmentId: string;
  apiBaseUrl?: string;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  viewLevel,
  cohortId,
  assessmentId,
  apiBaseUrl = '/api',
}) => {
  const [insightPanel, setInsightPanel] = useState<InsightPanel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [viewLevel, cohortId, assessmentId]);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/insights/${viewLevel}/${cohortId}/${assessmentId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }

      const data = await response.json();
      setInsightPanel(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="insights-panel loading">
        <div className="spinner" />
        <p>Analyzing performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="insights-panel error">
        <h3>⚠️ Error Loading Insights</h3>
        <p>{error}</p>
        <button onClick={fetchInsights}>Retry</button>
      </div>
    );
  }

  if (!insightPanel || insightPanel.insights.length === 0) {
    return (
      <div className="insights-panel empty">
        <p>No significant insights found for this cohort.</p>
      </div>
    );
  }

  return (
    <div className="insights-panel">
      <header className="insights-header">
        <h2>🤖 AI Insights - Key Findings</h2>
        <div className="insights-summary">
          <span>{insightPanel.summary.significantGaps} significant gaps</span>
          <span>{insightPanel.summary.peerLearningOpportunities} peer learning opportunities</span>
          <span className="cache-info">
            {new Date(insightPanel.generatedAt).toLocaleTimeString()}
          </span>
        </div>
      </header>

      <div className="insights-list">
        {insightPanel.insights.map((insight) => (
          <InsightCard
            key={insight.insightId}
            insight={insight}
            expanded={expandedInsight === insight.insightId}
            onToggle={() =>
              setExpandedInsight(
                expandedInsight === insight.insightId ? null : insight.insightId
              )
            }
          />
        ))}
      </div>

      <footer className="insights-footer">
        <p>
          💡 These insights are AI-generated based on comparative analysis with similar cohorts.
          Review recommendations with your professional judgment.
        </p>
      </footer>
    </div>
  );
};

interface InsightCardProps {
  insight: Insight;
  expanded: boolean;
  onToggle: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, expanded, onToggle }) => {
  return (
    <div className={`insight-card severity-${insight.severity} ${expanded ? 'expanded' : ''}`}>
      <div className="insight-header" onClick={onToggle}>
        <div className="insight-icon">{getSeverityIcon(insight.severity)}</div>
        <div className="insight-title-section">
          <h3>{insight.title}</h3>
          <p className="insight-summary">{insight.summary}</p>
        </div>
        <button className="expand-button">{expanded ? '▼' : '▶'}</button>
      </div>

      {expanded && (
        <div className="insight-body">
          <section className="insight-analysis">
            <h4>📊 Analysis</h4>
            <div className="analysis-content">{formatAnalysis(insight.detailedAnalysis)}</div>

            {insight.evidence.skillBreakdown && insight.evidence.skillBreakdown.length > 0 && (
              <div className="skill-breakdown">
                <h5>Skill-Level Breakdown:</h5>
                <ul>
                  {insight.evidence.skillBreakdown.map((skill, idx) => (
                    <li key={idx} className={`impact-${skill.impactLevel}`}>
                      <strong>{skill.skill}</strong>: {skill.currentScore}% (vs.{' '}
                      {skill.comparisonScore}%, gap: {skill.gap > 0 ? '+' : ''}
                      {skill.gap}%)
                      {skill.commonErrors && skill.commonErrors.length > 0 && (
                        <div className="common-errors">
                          <em>Common errors: {skill.commonErrors.join(', ')}</em>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insight.evidence.trend && (
              <div className="trend-info">
                <strong>Trend:</strong>{' '}
                <span className={`trend-${insight.evidence.trend.direction}`}>
                  {insight.evidence.trend.direction === 'improving' && '📈 Improving'}
                  {insight.evidence.trend.direction === 'stable' && '➡️ Stable'}
                  {insight.evidence.trend.direction === 'declining' && '📉 Declining'}
                </span>
                {' '}({insight.evidence.trend.changeRate > 0 ? '+' : ''}
                {insight.evidence.trend.changeRate.toFixed(1)}% change)
              </div>
            )}
          </section>

          <section className="insight-recommendations">
            <h4>💡 Recommended Actions</h4>
            {insight.recommendations.map((rec) => (
              <RecommendationCard key={rec.recommendationId} recommendation={rec} />
            ))}
          </section>

          {insight.evidence.comparisonCohorts.length > 0 && (
            <section className="comparison-cohorts">
              <h4>📊 Similar Cohorts Comparison</h4>
              <ul>
                {insight.evidence.comparisonCohorts.slice(0, 3).map((cohort) => (
                  <li key={cohort.cohortId}>
                    <strong>{cohort.cohortName}</strong>: {cohort.performance} (
                    {cohort.gap > 0 ? '+' : ''}
                    {cohort.gap})
                    <br />
                    <small>
                      Demographics: {cohort.demographics.fsmPercentage}% FSM,{' '}
                      {cohort.demographics.ealPercentage}% EAL,{' '}
                      {cohort.demographics.sendPercentage}% SEND
                    </small>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  return (
    <div className="recommendation-card">
      <h5>{recommendation.title}</h5>
      <p>{recommendation.description}</p>

      {recommendation.rationale && (
        <p className="rationale">
          <em>Why: {recommendation.rationale}</em>
        </p>
      )}

      {recommendation.targetMetric && (
        <div className="target-metric">
          <strong>Target:</strong> {recommendation.targetMetric.metric}:{' '}
          {recommendation.targetMetric.currentValue} → {recommendation.targetMetric.targetValue}{' '}
          ({recommendation.targetMetric.timeframe})
        </div>
      )}

      {recommendation.peerExample && (
        <div className="peer-example">
          <strong>💡 Peer Example: {recommendation.peerExample.cohortName}</strong>
          <p>Strategy: {recommendation.peerExample.strategy}</p>
          <p>Results: {recommendation.peerExample.evidenceOfSuccess}</p>
        </div>
      )}

      {recommendation.dashboardActions && recommendation.dashboardActions.length > 0 && (
        <div className="action-buttons">
          {recommendation.dashboardActions.map((action, idx) => (
            <button
              key={idx}
              className={`action-button ${action.actionType}`}
              onClick={() => handleDashboardAction(action)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper functions

function getSeverityIcon(severity: InsightSeverity): string {
  switch (severity) {
    case 'critical':
      return '🚨';
    case 'attention':
      return '⚠️';
    case 'positive':
      return '✅';
    default:
      return 'ℹ️';
  }
}

function formatAnalysis(text: string): React.ReactNode {
  // Split by line breaks and format bullet points
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      return <li key={idx}>{line.replace(/^[•\-]\s*/, '')}</li>;
    }
    return <p key={idx}>{line}</p>;
  });
}

function handleDashboardAction(action: any) {
  if (action.actionType === 'navigate' && action.targetUrl) {
    window.location.href = action.targetUrl;
  } else if (action.actionType === 'contact_peer') {
    // Open contact modal or email
    console.log('Contact peer:', action.parameters);
  } else if (action.actionType === 'create_plan') {
    window.location.href = action.targetUrl;
  } else if (action.actionType === 'create_report') {
    // Open create report modal
    console.log('Create report:', action.parameters);
  }
}

export default InsightsPanel;
