import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  registerUser,
  verifyCode,
  loginUser,
  UpdateUser,
  logoutUser,
  requestRefreshAccessToken,
  changeCurrentPassword,
  resetPassword,
  requestResetPassword,
  getCurrentUser,
} from '@/lib/api/Auth/auth';
import {AUTH_KEYS, QUERY_KEYS} from '../queryKeys'; // assuming you have query keys defined
import toast from 'react-hot-toast';

// Hook to register a new user
const useRegisterUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('User registered successfully');
      queryClient.invalidateQueries({queryKey: [AUTH_KEYS.GET_CURRENT_USER]});
    },
    onError: (error) => {
      toast.error('Failed to register user: ' + error.message);
    },
  });
};

// Hook to verify the verification code
const useVerifyCode = () => {
  return useMutation({
    mutationFn: verifyCode,
    onSuccess: () => {
      toast.success('Code verified successfully');
    },
    onError: (error) => {
      toast.error('Code verification failed: ' + error.message);
    },
  });
};

// Hook to log in a user
const useLoginUser = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (res) => {
      localStorage.setItem(QUERY_KEYS.TOKEN, JSON.stringify(res.data));
      toast.success('Logged in successfully');
    },
    onError: (error) => {
      toast.error('Failed to login: ' + error.message);
    },
  });
};

// Hook to update a user
const useUpdateUser = () => {
  return useMutation({
    mutationFn: UpdateUser,
    onSuccess: () => {
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update user: ' + error.message);
    },
  });
};

// Hook to log out a user
const useLogoutUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      toast.success('Logged out successfully');
      queryClient.invalidateQueries({queryKey: [AUTH_KEYS.GET_CURRENT_USER]});
    },
    onError: (error) => {
      toast.error('Failed to logout: ' + error.message);
    },
  });
};

// Hook to refresh access token
const useRequestRefreshAccessToken = () => {
  return useMutation({
    mutationFn: requestRefreshAccessToken,
    onSuccess: () => {
      toast.success('Access token refreshed');
    },
    onError: (error) => {
      toast.error('Failed to refresh access token: ' + error.message);
    },
  });
};

// Hook to change the current password
const useChangeCurrentPassword = () => {
  return useMutation({
    mutationFn: changeCurrentPassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      toast.error('Failed to change password: ' + error.message);
    },
  });
};

// Hook to request password reset
const useRequestResetPassword = () => {
  return useMutation({
    mutationFn: requestResetPassword,
    onSuccess: () => {
      toast.success('Password reset request successful');
    },
    onError: (error) => {
      toast.error('Failed to request password reset: ' + error.message);
    },
  });
};

// Hook to reset the password
const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (error) => {
      toast.error('Failed to reset password: ' + error.message);
    },
  });
};

// Hook to get the current user
const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [AUTH_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

export {
  useRegisterUser,
  useVerifyCode,
  useLoginUser,
  useUpdateUser,
  useLogoutUser,
  useRequestRefreshAccessToken,
  useChangeCurrentPassword,
  useRequestResetPassword,
  useResetPassword,
  useGetCurrentUser,
};
