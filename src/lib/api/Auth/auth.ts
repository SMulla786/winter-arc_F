import {api} from '@/utils/axios';
import {AxiosError} from 'axios';
import {UpdateUserTypes, User} from '@/types/auth';
import {signInValidationSchema} from '@/lib/validation/authSchemas';
import {z} from 'zod';
import {verifyVerificationCodeSchema} from '@/lib/validations/user.validation';
import {unAuthenticatedApi} from '@/utils/axios';

// ** USER API ENDPOINTS

type UserLoginType = z.infer<typeof signInValidationSchema>;
type verifyVerificationCodeType = z.infer<typeof verifyVerificationCodeSchema>;

// user registration endpoint

const registerUser = async (data: User) => {
  try {
    const res = await unAuthenticatedApi.post('/users/register', data, {
      params: {
        redirect: 'http://localhost:5173/verify-email',
      },
    });
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to register');
    }
    throw error;
  }
};

// code verification api endpoint

const verifyCode = async (data: verifyVerificationCodeType) => {
  try {
    const res = await unAuthenticatedApi.post('/users/verify-code', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Code Verification Unsuccessfull',
      );
    }
  }
};

// user login endpoint

const loginUser = async (data: UserLoginType) => {
  const {identifier, password} = data;

  let isEmail = false;
  if (identifier.endsWith('@gmail.com')) {
    isEmail = true;
  }

  try {
    if (isEmail) {
      const res = await unAuthenticatedApi.post('/users/login', {
        email: identifier,
        password: password,
      });
      return res.data;
    }
    const res = await unAuthenticatedApi.post('/users/login', {
      username: identifier,
      password: password,
    });
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to login');
    }
    throw error;
  }
};

// user update endpoint

const UpdateUser = async (data: UpdateUserTypes) => {
  try {
    const res = await api.patch('/users/update-account', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to update user , please try after some time',
      );
    }
  }
};

// logout user endpoint

const logoutUser = async () => {
  try {
    const res = await api.post('/users/logout');
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to logout , Please try after some time',
      );
    }
  }
};

// requesting access token

const requestRefreshAccessToken = async (data: {refreshToken: string}) => {
  try {
    const res = await api.post('/users/refresh-token', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to request access token',
      );
    }
  }
};

const changeCurrentPassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const res = await api.post('/users/change-password', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to change password',
      );
    }
  }
};

const requestResetPassword = async (data: {email: string}) => {
  try {
    const res = await api.post('/users/reset-password-request', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to change password',
      );
    }
  }
};

const resetPassword = async (data: {newPassword: string}) => {
  try {
    const res = await api.post('/users/reset-password', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to change password',
      );
    }
  }
};

const getCurrentUser = async () => {
  try {
    const res = await api.get('/users/current-user');
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to change password',
      );
    }
  }
};

export {
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
};
