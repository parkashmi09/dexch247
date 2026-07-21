import { useDispatch, useSelector } from 'react-redux'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setCredentials, logout } from '../store/slices/authSlice'
import { authService } from '../services/authService'
import { OWNER_IDENTIFIERS } from '../config/constants'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { token, user, isAuthenticated } = useSelector((state) => state.auth)
  const queryClient = useQueryClient()

  const isOwnerIdentifier = (id) => {
    const norm = (id || '').trim().toLowerCase()
    return OWNER_IDENTIFIERS.some((o) => o.trim().toLowerCase() === norm)
  }

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      // Check if user is owner
      const identifier = credentials.email || credentials.username
      const isOwner = isOwnerIdentifier(identifier)

      if (isOwner) {
        return { ...(await authService.ownerLogin(credentials)), __loginType: 'owner' }
      }

      // Non-owner: try staff login first; if the credentials don't match a
      // staff account, fall back to an executive (multi-login) account. A
      // single login box serves both — the backend tells us which succeeded.
      let staffError = null
      try {
        const staffRes = await authService.login(credentials)
        if (staffRes?.success || staffRes?.require2FA) {
          return { ...staffRes, __loginType: 'staff' }
        }
        staffError = staffRes // explicit { success:false } without throwing
      } catch (err) {
        staffError = err
      }

      try {
        const execRes = await authService.executiveLogin(credentials)
        return { ...execRes, __loginType: 'executive' }
      } catch (execErr) {
        // Neither path worked — surface the most useful error.
        throw (staffError instanceof Error ? staffError : execErr)
      }
    },
    onSuccess: async (data) => {
      // Executive (multi-login): no profile endpoint — the login response
      // already carries the permission map. Store it and stop here.
      if (data.__loginType === 'executive') {
        if (data.success && data.token) {
          dispatch(setCredentials({
            token: data.token,
            user: data.executive,
            role: 'executive'
          }))
          queryClient.invalidateQueries()
        }
        return data
      }

      if (data.success && data.token) {
        const isOwner = data.__loginType === 'owner'
        const role = isOwner ? 'owner' : 'staff'

        // Store token in Redux with role
        dispatch(setCredentials({
          token: data.token,
          user: null,
          role: role
        }))

        // Immediately fetch profile after login
        try {
          console.log(`Fetching ${role} profile after login...`)
          const profileResponse = isOwner
            ? await authService.getOwnerProfile()
            : await authService.getProfile()

          console.log('Profile response:', profileResponse)

          // Owner profile has data directly, staff profile has data.user
          const userData = isOwner
            ? profileResponse.data
            : profileResponse.data?.user

          if (profileResponse && profileResponse.success && userData) {
            dispatch(setCredentials({
              token: data.token,
              user: userData,
              role: role
            }))
            console.log('Profile stored in Redux:', userData)
          } else {
            console.warn('Profile response missing user data:', profileResponse)
          }
        } catch (error) {
          console.error('Profile fetch error:', error)
          // If profile fetch fails, logout user
          if (error.response?.status === 401) {
            dispatch(logout())
            throw new Error('Session expired. Please login again.')
          }
        }

        queryClient.invalidateQueries()
      }
      return data
    },
    onError: (error) => {
      console.error('Login error:', error)
      throw error
    },
  })

  const verify2FAMutation = useMutation({
    mutationFn: async (data) => {
      if (data.ownerId) {
        return await authService.verifyOwner2FA(data);
      } else {
        return await authService.verifyStaff2FA(data);
      }
    },
    onSuccess: async (data, variables) => {
      if (data.success && data.token) {
        const isOwner = !!variables.ownerId;
        const role = isOwner ? 'owner' : 'staff';

        // Store token in Redux with role
        dispatch(setCredentials({
          token: data.token,
          user: null,
          role: role
        }))

        // Immediately fetch profile after successful 2FA
        try {
          console.log(`Fetching ${role} profile after 2FA...`)
          const profileResponse = isOwner
            ? await authService.getOwnerProfile()
            : await authService.getProfile()

          const userData = isOwner
            ? profileResponse.data
            : profileResponse.data?.user

          if (profileResponse && profileResponse.success && userData) {
            dispatch(setCredentials({
              token: data.token,
              user: userData,
              role: role
            }))
          } else {
            dispatch(logout())
          }
        } catch (error) {
          console.error('Profile fetch error:', error)
          dispatch(logout())
          throw new Error('Session expired. Please login again.')
        }

        queryClient.invalidateQueries();
      }
    },
    onError: (error) => {
      console.error('2FA Verify error:', error);
      throw error;
    }
  });

  const handleLogout = () => {
    // Only delete token, don't call API
    dispatch(logout())
    queryClient.clear()
  }

  return {
    token,
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: handleLogout,
    loginError: loginMutation.error,
    verify2FA: verify2FAMutation.mutateAsync,
    isVerifying2FA: verify2FAMutation.isPending,
  }
}

