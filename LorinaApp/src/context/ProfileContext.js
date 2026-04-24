import React, { createContext, useContext, useState } from 'react';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [name, setName]   = useState('Sofia R.');
  const [handle, setHandle] = useState('@sofiaR · UTS Sydney');
  const [bio, setBio]     = useState('Coffee lover & study enthusiast. Always searching for the perfect flat white.');
  const [avatarUri, setAvatarUri] = useState(null);
  const [badges, setBadges] = useState([
    { id: '1', label: 'Study Regular', color: '#6B3F1F' },
    { id: '2', label: 'Matcha Fan',    color: '#4A9E6A' },
    { id: '3', label: 'Early Riser',   color: '#C0882A' },
    { id: '4', label: 'Café Hopper',   color: '#5A7FA0' },
  ]);

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
