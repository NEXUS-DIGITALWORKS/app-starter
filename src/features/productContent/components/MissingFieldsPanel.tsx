import { useState } from 'react';
import type { MissingField } from '../types';

interface MissingFieldsPanelProps {
  fields: MissingField[];
}

export default function MissingFieldsPanel({ fields }: MissingFieldsPanelProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-[#111827]">不足項目</h3>
      <ul className="space-y-2.5">
        {fields.map((field) => (
          <li key={field.key}>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#344054]">
              <input
                type="checkbox"
                checked={checked[field.key] ?? false}
                onChange={(e) => setChecked((prev) => ({ ...prev, [field.key]: e.target.checked }))}
                className="h-4 w-4 shrink-0 rounded border-[#D0D5DD] text-[#3157E5] focus-visible:ring-2 focus-visible:ring-[#3157E5]"
              />
              {field.label}
            </label>
          </li>
        ))}
        {fields.length === 0 && <li className="text-sm text-[#98A2B3]">不足している項目はありません</li>}
      </ul>
    </div>
  );
}
