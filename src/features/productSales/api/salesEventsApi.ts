import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import type { SalesEvent, SalesEventInput } from '../types/salesEvents';

interface SalesEventRow {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

function mapRow(row: SalesEventRow): SalesEvent {
  return { id: row.id, name: row.name, startDate: row.start_date, endDate: row.end_date };
}

export async function fetchSalesEvents(): Promise<SalesEvent[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase.from('sales_events').select('id, name, start_date, end_date').order('start_date', { ascending: false });
  if (error || !data) return [];

  return (data as SalesEventRow[]).map(mapRow);
}

export async function createSalesEvent(input: SalesEventInput): Promise<void> {
  const { error } = await supabase
    .from('sales_events')
    .insert({ name: input.name, start_date: input.startDate, end_date: input.endDate });
  if (error) throw error;
}

export async function updateSalesEvent(id: string, input: SalesEventInput): Promise<void> {
  const { error } = await supabase
    .from('sales_events')
    .update({ name: input.name, start_date: input.startDate, end_date: input.endDate })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteSalesEvent(id: string): Promise<void> {
  const { error } = await supabase.from('sales_events').delete().eq('id', id);
  if (error) throw error;
}
