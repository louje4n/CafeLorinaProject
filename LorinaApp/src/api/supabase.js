import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ⚠️ Replace these with your actual Project URL and Anon Key from the Supabase Dashboard
const SUPABASE_URL = 'https://vbflhhtrngbkwyehqcoa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yRfpalt9Z03TBZHVFSarHA_ExUfDu7H';

// Initialize the Supabase client with AsyncStorage for session persistence
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// --- Storage Helper Functions ---

/**
 * Uploads a file to a specific Supabase storage bucket
 */
export const uploadFile = async (bucket, path, fileUri) => {
    try {
        const formData = new FormData();
        formData.append('file', {
            uri: fileUri,
            name: path.split('/').pop(),
            type: 'image/jpeg',
        });

        const { data, error } = await supabase.storage.from(bucket).upload(path, formData, {
            upsert: true,
        });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error(`Error uploading file to ${bucket}:`, error.message);
        return { data: null, error };
    }
};

/**
 * Deletes a file from a specific Supabase storage bucket
 */
export const deleteFile = async (bucket, path) => {
    try {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error(`Error deleting file from ${bucket}:`, error.message);
        return { error };
    }
};

/**
 * Retrieves the public URL for a file in a storage bucket
 */
export const getPublicUrl = (bucket, path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
};