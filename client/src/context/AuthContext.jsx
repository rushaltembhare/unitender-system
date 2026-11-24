import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 2FA pending state
  const [pendingUser, setPendingUser] = useState(null);
  const [is2faRequired, setIs2faRequired] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('742910');

  // Fetch users on load - Login page is ALWAYS first page
  const loadUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (data.success && data.users.length > 0) {
        setAllUsers(data.users);
        // Default to not authenticated so Login Page is ALWAYS the landing page
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Authenticate with Username / Email and Password
  const loginWithCredentials = async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, message: data.message || 'Invalid credentials' };
      }

      if (data.requiresTwoFactor) {
        setPendingUser(data.user);
        setIs2faRequired(true);
        setSimulatedOtp(data.simulatedOtp || '742910');
        return { success: true, requires2fa: true, user: data.user };
      } else {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('unitender_user_id', data.user.id);
        return { success: true, requires2fa: false, user: data.user };
      }
    } catch (err) {
      return { success: false, message: 'Server communication error' };
    }
  };

  // Sign up for first-time users
  const signUp = async (formData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, message: data.message || 'Sign up failed' };
      }

      // Refresh users list
      await loadUsers();

      // Proceed to 2FA for the newly created user
      setPendingUser(data.user);
      setIs2faRequired(true);
      setSimulatedOtp('742910');
      return { success: true, user: data.user, requires2fa: true };
    } catch (err) {
      return { success: false, message: 'Registration failed due to network error' };
    }
  };

  // Initiate login with selected persona or credentials
  const initiateLogin = (targetUser) => {
    if (!targetUser) return;

    if (targetUser.twoFactorEnabled) {
      setPendingUser(targetUser);
      setIs2faRequired(true);
      setSimulatedOtp('742910');
      return { requires2fa: true, user: targetUser };
    } else {
      // Direct login
      setUser(targetUser);
      setIsAuthenticated(true);
      localStorage.setItem('unitender_user_id', targetUser.id);
      return { requires2fa: false, user: targetUser };
    }
  };

  // Complete 2FA OTP verification
  const verify2faLogin = async (otp) => {
    if (!pendingUser) return { success: false, message: 'No pending login' };

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: pendingUser.id, otp })
      });
      const data = await res.json();

      if (data.success) {
        setUser(pendingUser);
        setIsAuthenticated(true);
        localStorage.setItem('unitender_user_id', pendingUser.id);
        setIs2faRequired(false);
        setPendingUser(null);
        return { success: true, user: pendingUser };
      } else {
        return { success: false, message: data.message || 'Incorrect OTP code.' };
      }
    } catch (err) {
      return { success: false, message: 'Verification network error.' };
    }
  };

  const cancel2fa = () => {
    setIs2faRequired(false);
    setPendingUser(null);
  };

  // Direct role switcher (for dev / testing inside authenticated app)
  const switchUser = async (targetUserId) => {
    const target = allUsers.find(u => u.id === targetUserId);
    if (!target) return;
    setUser(target);
    setIsAuthenticated(true);
    localStorage.setItem('unitender_user_id', target.id);
  };

  // Logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('unitender_user_id');
  };

  return (
    <AuthContext.Provider value={{
      user,
      allUsers,
      loading,
      isAuthenticated,
      is2faRequired,
      pendingUser,
      simulatedOtp,
      loginWithCredentials,
      signUp,
      initiateLogin,
      verify2faLogin,
      cancel2fa,
      switchUser,
      logout,
      loadUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
