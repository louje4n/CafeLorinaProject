import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [name, setName]         = useState('');
  const [handle, setHandle]     = useState('');
  const [bio, setBio]           = useState('');
  const [avatarUri, setAvatarUri] = useState(null);
  const [badges, setBadges]     = useState([]);

  useEffect(() => {
    // Load profile from Supabase whenever auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user);
      } else {
        // Signed out — reset to empty
        setName('');
        setHandle('');
        setBio('');
        setAvatarUri(null);
        setBadges([]);
      }
    });

    // Also load on mount if already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(user) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, bio, handle')
      .eq('id', user.id)
      .single();

    const displayName = data?.display_name || user.user_metadata?.display_name || 'User';
    const firstName = displayName.split(' ')[0].toLowerCase();

    setName(displayName);
    setHandle(data?.handle || `@${firstName}`);
    setBio(data?.bio || '');
    setAvatarUri(data?.avatar_url || null);
  }

  return (
    <ProfileContext.Provider value={{
      name, setName,
      handle, setHandle,
      bio, setBio,
      avatarUri, setAvatarUri,
      badges, setBadges,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
