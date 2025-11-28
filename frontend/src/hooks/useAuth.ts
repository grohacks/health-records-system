import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { RootState } from '../store';
import {
  login as loginAction,
  register as registerAction,
  logout as logoutAction,
  getProfile as getProfileAction,
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error } = useAppSelector((state: RootState) => state.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        await dispatch(loginAction({ email, password })).unwrap();
        navigate('/dashboard');
      } catch (err) {
        // Error is handled by the reducer
      }
    },
    [dispatch, navigate]
  );

  const register = useCallback(
    async (userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: string;
    }) => {
      try {
        await dispatch(registerAction(userData)).unwrap();
        navigate('/login');
      } catch (err) {
        // Error is handled by the reducer
      }
    },
    [dispatch, navigate]
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
    navigate('/login');
  }, [dispatch, navigate]);

  const getProfile = useCallback(async () => {
    try {
      await dispatch(getProfileAction()).unwrap();
    } catch (err) {
      // Error is handled by the reducer
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    getProfile,
  };
}; 