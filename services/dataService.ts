import { supabase, isSupabaseConfigured } from './supabaseClient';
import { PropertyRecord, PropertyInput, AnalysisReport } from '../types';

// Mock User ID for local mode
const LOCAL_USER_ID = 'local-user-123';

export const saveProperty = async (input: PropertyInput, report: AnalysisReport): Promise<PropertyRecord> => {
  const newRecord: PropertyRecord = {
    ...input,
    id: crypto.randomUUID(),
    userId: LOCAL_USER_ID,
    createdAt: new Date().toISOString(),
    report
  };

  if (isSupabaseConfigured && supabase) {
    // Supabase Implementation
    
    // Get current user correctly
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Insert Property
    const { data: propData, error: propError } = await supabase
      .from('properties')
      .insert([{
        // Mapping fields to standard snake_case column names typically used in SQL
        // Simplified for this demo to match object structure or assume JSONB
        title: input.title,
        description: input.description,
        price: input.price,
        location: input.location,
        details: input, // Storing strict structured data in a JSONB column 'details'
        user_id: user?.id
      }])
      .select()
      .single();

    if (propError) console.error("Supabase Error", propError);

    // 2. Insert Report
    if (propData) {
       await supabase.from('reports').insert({
         property_id: propData.id,
         content: report
       });
       newRecord.id = propData.id; // Sync ID
    }
    return newRecord; // Return local copy for immediate UI update regardless
  } else {
    // LocalStorage Implementation
    const existing = localStorage.getItem('properties');
    const list = existing ? JSON.parse(existing) : [];
    list.push(newRecord);
    localStorage.setItem('properties', JSON.stringify(list));
    return newRecord;
  }
};

export const getProperties = async (): Promise<PropertyRecord[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('properties').select('*, reports(*)');
    if (error) {
        console.error(error);
        return [];
    }
    // Transform back to types
    return data.map((d: any) => ({
        ...d.details, // Assuming details JSONB column
        id: d.id,
        report: d.reports?.[0]?.content // Assuming relation
    }));
  } else {
    const existing = localStorage.getItem('properties');
    return existing ? JSON.parse(existing) : [];
  }
};