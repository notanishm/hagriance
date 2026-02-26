import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Info } from 'lucide-react';
import { RISK_FACTORS } from '../data/loans';

const RiskAssessment = ({ score, breakdown }) => {
    const getScoreColor = (s) => {
        if (s >= 80) return '#10B981'; // Success/Green
        if (s >= 60) return '#F59E0B'; // Warning/Amber
        return '#EF4444'; // Danger/Red
    };

    const color = getScoreColor(score);

    return (
        <div className="card" style={{ padding: '2rem', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldCheck color={color} size={28} />
                    <h3 style={{ margin: 0 }}>Platform Risk Score</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color, lineHeight: 1 }}>{score}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/100</span></div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {score >= 80 ? 'Low Risk' : score >= 60 ? 'Medium Risk' : 'High Risk'}
                    </div>
                </div>
            </div>

            <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', marginBottom: '2.5rem' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ height: '100%', background: color }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {Object.entries(RISK_FACTORS).map(([key, config]) => {
                    const value = breakdown[config.id] || 0;
                    const percentage = (value / config.weight) * 100;

                    return (
                        <div key={key}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    {config.label} <Info size={12} />
                                </span>
                                <span style={{ fontWeight: 600 }}>{value} / {config.weight} pts</span>
                            </div>
                            <div style={{ height: '6px', background: '#f8fafc', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${percentage}%`,
                                    background: percentage > 70 ? 'var(--primary)' : '#94a3b8',
                                    borderRadius: '3px'
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                borderLeft: `4px solid ${color}`
            }}>
                * This score is calculated based on verified platform data and historical performance. Banks are advised to perform their own due diligence for high-value loans.
            </div>
        </div>
    );
};

export default RiskAssessment;
