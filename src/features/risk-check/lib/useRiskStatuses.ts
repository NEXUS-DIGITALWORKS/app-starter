import { useCallback, useEffect, useState } from 'react';
import type { RiskStatus, RiskStatusMap } from '../types';

const STORAGE_KEY = 'riskCheck55.statuses.v1';

function loadStatuses(): RiskStatusMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as RiskStatusMap) : {};
  } catch {
    return {};
  }
}

export function useRiskStatuses() {
  const [statuses, setStatuses] = useState<RiskStatusMap>(() => loadStatuses());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch {
      // localStorageが使えない環境（プライベートモード等）では保存をあきらめる
    }
  }, [statuses]);

  const getStatus = useCallback((id: number): RiskStatus => statuses[id] ?? 'pending', [statuses]);

  const setStatus = useCallback((id: number, status: RiskStatus) => {
    setStatuses((prev) => {
      if (status === 'pending') {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: status };
    });
  }, []);

  const resetAll = useCallback(() => setStatuses({}), []);

  return { getStatus, setStatus, resetAll, statuses };
}
