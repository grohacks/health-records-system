import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { RootState } from '../store'
import {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  clearCurrentUser,
  clearError,
} from '../store/slices/usersSlice'
import { User } from '../types'

export const useUsers = () => {
  const dispatch = useAppDispatch()
  const { users, currentUser, loading, error } = useAppSelector((state: RootState) => state.users)

  const getUsers = useCallback(async () => {
    try {
      await dispatch(fetchUsers()).unwrap()
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }, [dispatch])

  const getUserById = useCallback(
    async (id: number) => {
      try {
        await dispatch(fetchUserById(id)).unwrap()
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    },
    [dispatch]
  )

  const addUser = useCallback(
    async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        await dispatch(createUser(userData)).unwrap()
      } catch (error) {
        console.error('Failed to create user:', error)
      }
    },
    [dispatch]
  )

  const editUser = useCallback(
    async (id: number, userData: Partial<User>) => {
      try {
        await dispatch(updateUser({ id, userData })).unwrap()
      } catch (error) {
        console.error('Failed to update user:', error)
      }
    },
    [dispatch]
  )

  const removeUser = useCallback(
    async (id: number) => {
      try {
        await dispatch(deleteUser(id)).unwrap()
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    },
    [dispatch]
  )

  const resetCurrentUser = useCallback(() => {
    dispatch(clearCurrentUser())
  }, [dispatch])

  const resetError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    users,
    currentUser,
    loading,
    error,
    getUsers,
    getUserById,
    addUser,
    editUser,
    removeUser,
    resetCurrentUser,
    resetError,
  }
} 