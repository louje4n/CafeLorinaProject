import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../api/supabase'; // Your database connection

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true); // True while checking for an active session

    useEffect(() => {
        // 1. Check if a user is already logged in when the app opens
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user || null);
            setLoading(false);
        });

        // 2. Set up a listener for any authentication state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session);
                setUser(session?.user || null);
                setLoading(false);
            }
        );

        // Cleanup subscription when component unmounts
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    };

    const signUp = async (email, password, displayName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { display_name: displayName }, // Passes the display name to our database trigger
            },
        });
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

// Helper hook to easily access auth functions anywhere in the app
export const useAuth = () => useContext(AuthContext);