'use client';

import React, { useState } from 'react';
import { SpecificationColumn, SpecificationTable, SpecificationItem } from '@/types/products';

export interface AdminSpecificationBuilderProps {
  specTable?: SpecificationTable;
  legacySpecs?: SpecificationItem[];
  onChange: (updatedTable: SpecificationTable, updatedLegacySpecs: SpecificationItem[]) => void;
}

export const AdminSpecificationBuilder: React.FC<AdminSpecificationBuilderProps> = ({
  specTable,
  legacySpecs,
  onChange,
}) => {
  // Normalize columns
  const initialColumns: SpecificationColumn[] =
    Array.isArray(specTable?.columns) && specTable.columns.length > 0
      ? specTable.columns
      : Array.isArray(legacySpecs) && legacySpecs.length > 0
      ? legacySpecs.map((s, idx) => ({
          key: s.key || `col_${idx + 1}`,
          label: s.label || s.key || `Specification ${idx + 1}`,
          value: s.value || '',
          order: idx,
        }))
      : [
          { key: 'version', label: 'VERSION', value: 'V2.1', order: 0 },
          { key: 'capacity', label: 'CAPACITY', value: '50 KG', order: 1 },
          { key: 'speed', label: 'SPEED', value: '80 PPM', order: 2 },
          { key: 'voltage', label: 'VOLTAGE', value: '220V', order: 3 },
          { key: 'dimensions', label: 'DIMENSIONS', value: '1200x800x1600 MM', order: 4 },
        ];

  const [columns, setColumns] = useState<SpecificationColumn[]>(initialColumns);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  const syncChanges = (newCols: SpecificationColumn[]) => {
    setColumns(newCols);
    const newLegacy: SpecificationItem[] = newCols.map((c) => ({
      key: c.key,
      label: c.label,
      value: c.value,
      group: 'Technical Specifications',
    }));
    onChange({ columns: newCols }, newLegacy);
  };

  const handleAddColumn = () => {
    if (!newLabel.trim() || !newValue.trim()) return;

    const key = newLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const newCol: SpecificationColumn = {
      key: `${key}_${Date.now().toString().slice(-4)}`,
      label: newLabel.trim().toUpperCase(),
      value: newValue.trim(),
      order: columns.length,
    };

    const updated = [...columns, newCol];
    syncChanges(updated);
    setNewLabel('');
    setNewValue('');
  };

  const handleUpdateColumn = (index: number, field: 'label' | 'value', text: string) => {
    const updated = [...columns];
    updated[index] = {
      ...updated[index],
      [field]: text,
    };
    syncChanges(updated);
  };

  const handleRemoveColumn = (index: number) => {
    const updated = columns.filter((_, i) => i !== index).map((col, idx) => ({
      ...col,
      order: idx,
    }));
    syncChanges(updated);
  };

  const handleMoveColumn = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === columns.length - 1)
    ) {
      return;
    }

    const updated = [...columns];
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const reordered = updated.map((c, i) => ({ ...c, order: i }));
    syncChanges(reordered);
  };

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            2-Row Technical Specification Table Builder
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configures exactly 2 rows: Row 1 = Specification Labels, Row 2 = Technical Values. Add unlimited columns.
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400">
          {columns.length} Columns Active
        </span>
      </div>

      {/* Add New Column Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          + Add Parameter Column
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Column Label (Row 1)
            </label>
            <input
              type="text"
              placeholder="e.g. VOLTAGE, CAPACITY, MAX SPEED"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Parameter Value (Row 2)
            </label>
            <input
              type="text"
              placeholder="e.g. 415V 3-Phase, 120 PPM, 50-500 ML"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button
              type="button"
              onClick={handleAddColumn}
              disabled={!newLabel.trim() || !newValue.trim()}
              className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              Add Column
            </button>
          </div>
        </div>
      </div>

      {/* Column Editor List */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Columns Configuration ({columns.length})
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {columns.map((col, idx) => (
            <div
              key={col.key || idx}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <span className="w-6 text-center text-xs font-mono font-bold text-slate-500">
                {idx + 1}
              </span>

              {/* Label Input */}
              <div className="flex-1">
                <input
                  type="text"
                  value={col.label}
                  onChange={(e) => handleUpdateColumn(idx, 'label', e.target.value)}
                  placeholder="Label"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-white uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Value Input */}
              <div className="flex-1">
                <input
                  type="text"
                  value={col.value}
                  onChange={(e) => handleUpdateColumn(idx, 'value', e.target.value)}
                  placeholder="Value"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Reorder Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveColumn(idx, 'left')}
                  disabled={idx === 0}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 text-xs transition-colors"
                  title="Move Left"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveColumn(idx, 'right')}
                  disabled={idx === columns.length - 1}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 text-xs transition-colors"
                  title="Move Right"
                >
                  →
                </button>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleRemoveColumn(idx)}
                className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors"
                title="Remove Column"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live 2-Row Table Preview */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span>●</span> Live 2-Row Specification Table Preview
          </span>
          <span className="text-[11px] text-slate-500">
            Scroll horizontally on narrow screens
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 shadow-inner">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-xs font-extrabold text-slate-300 tracking-wider uppercase whitespace-nowrap border-r border-slate-800/80 last:border-r-0"
                  >
                    {col.label || `COL ${idx + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-slate-950/80">
                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className="px-4 py-3.5 text-xs font-semibold text-amber-300 font-mono whitespace-nowrap border-r border-slate-800/80 last:border-r-0"
                  >
                    {col.value || '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
