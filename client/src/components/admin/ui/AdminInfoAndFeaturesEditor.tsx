'use client';

import React, { useState } from 'react';

export interface AdminInfoAndFeaturesEditorProps {
  entityType: 'category' | 'product' | 'model';
  description?: string;
  infoPoints?: string[];
  features?: string[];
  onChangeDescription: (desc: string) => void;
  onChangeInfoPoints: (points: string[]) => void;
  onChangeFeatures: (features: string[]) => void;
}

export const AdminInfoAndFeaturesEditor: React.FC<AdminInfoAndFeaturesEditorProps> = ({
  entityType,
  description = '',
  infoPoints = [],
  features = [],
  onChangeDescription,
  onChangeInfoPoints,
  onChangeFeatures,
}) => {
  const [newInfoPoint, setNewInfoPoint] = useState('');
  const [newFeature, setNewFeature] = useState('');

  // Info Points handlers
  const handleAddInfoPoint = () => {
    if (!newInfoPoint.trim()) return;
    onChangeInfoPoints([...infoPoints, newInfoPoint.trim()]);
    setNewInfoPoint('');
  };

  const handleUpdateInfoPoint = (index: number, text: string) => {
    const updated = [...infoPoints];
    updated[index] = text;
    onChangeInfoPoints(updated);
  };

  const handleRemoveInfoPoint = (index: number) => {
    onChangeInfoPoints(infoPoints.filter((_, i) => i !== index));
  };

  // Features handlers
  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    onChangeFeatures([...features, newFeature.trim()]);
    setNewFeature('');
  };

  const handleUpdateFeature = (index: number, text: string) => {
    const updated = [...features];
    updated[index] = text;
    onChangeFeatures(updated);
  };

  const handleRemoveFeature = (index: number) => {
    onChangeFeatures(features.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Description / Overview Paragraph */}
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {entityType === 'category'
              ? 'About The Category (Editorial Overview)'
              : entityType === 'product'
              ? 'Product Information (Editorial Paragraph)'
              : 'Model Technical Overview'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Main descriptive content displayed in the editorial section of the public page.
          </p>
        </div>

        <textarea
          rows={5}
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          placeholder="Enter editorial description, operational overview, or manufacturing capabilities..."
          className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed font-normal"
        />
      </div>

      {/* Product Information Points (Numbered Points 01, 02, 03...) */}
      <div className="space-y-4 border-b border-slate-800 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Information Points ({infoPoints.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Structured engineering points (e.g. &quot;01 High-speed operation&quot;, &quot;02 Stainless steel construction&quot;).
            </p>
          </div>
        </div>

        {/* Add Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newInfoPoint}
            onChange={(e) => setNewInfoPoint(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddInfoPoint();
              }
            }}
            placeholder="e.g. Multi-axis servo synchronization with automatic tension control"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
          />
          <button
            type="button"
            onClick={handleAddInfoPoint}
            disabled={!newInfoPoint.trim()}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs transition-colors shadow-sm shrink-0"
          >
            + Add Point
          </button>
        </div>

        {/* List of Points */}
        {infoPoints.length > 0 && (
          <div className="space-y-2">
            {infoPoints.map((point, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700"
              >
                <span className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleUpdateInfoPoint(idx, e.target.value)}
                  className="flex-1 px-2.5 py-1 rounded bg-transparent border-none text-xs text-slate-200 focus:outline-none focus:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveInfoPoint(idx)}
                  className="p-1.5 rounded text-red-400 hover:bg-red-500/10 text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Specific Features (Numbered Points: 01 — HIGH SPEED...) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Specific Features ({features.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Key engineering features displayed as prominent numbered cards (e.g. &quot;01 — HIGH SPEED&quot;).
            </p>
          </div>
        </div>

        {/* Add Feature Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddFeature();
              }
            }}
            placeholder="e.g. HIGH-SPEED PRECISION SERVO DRIVE"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 uppercase"
          />
          <button
            type="button"
            onClick={handleAddFeature}
            disabled={!newFeature.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs transition-colors shadow-sm shrink-0"
          >
            + Add Feature
          </button>
        </div>

        {/* List of Features */}
        {features.length > 0 && (
          <div className="space-y-2">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700"
              >
                <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <input
                  type="text"
                  value={feat}
                  onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                  className="flex-1 px-2.5 py-1 rounded bg-transparent border-none text-xs font-semibold text-slate-200 focus:outline-none focus:bg-slate-900 uppercase"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="p-1.5 rounded text-red-400 hover:bg-red-500/10 text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
