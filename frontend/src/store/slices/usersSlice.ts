import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { User } from '../../types'
import { userApi } from '../../services/api'

interface UsersState {
  users: User[]
  currentUser: User | null
  loading: boolean
  error: string | null
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
}

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async () => {
    const response = await userApi.getAll()
    return response.data
  }
)

export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (id: number) => {
    const response = await userApi.getById(id)
    return response.data
  }
)

export const createUser = createAsyncThunk(
  'users/create',
  async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await userApi.create(userData)
    return response.data
  }
)

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, userData }: { id: number; userData: Partial<User> }) => {
    const response = await userApi.update(id, userData)
    return response.data
  }
)

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: number) => {
    await userApi.delete(id)
    return id
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch users'
      })
      // Fetch single user
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch user'
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false
        state.users.push(action.payload)
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create user'
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        const index = state.users.findIndex((user) => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update user'
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false
        state.users = state.users.filter((user) => user.id !== action.payload)
        if (state.currentUser?.id === action.payload) {
          state.currentUser = null
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete user'
      })
  },
})

export const { clearCurrentUser, clearError } = usersSlice.actions
export default usersSlice.reducer 