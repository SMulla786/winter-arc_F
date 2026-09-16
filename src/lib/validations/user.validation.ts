import {z} from 'zod';
import {
  password,
  emailSchema,
  usernameSchema,
  fullnameSchema,
  phoneNumberSchema,
  refreshTokenSchema,
} from './custom.validation';

const registerUserSchema = z.object({
  fullname: fullnameSchema.trim(),
  email: emailSchema.trim(),
  username: usernameSchema.trim(),
  password: password,
  phoneNumber: phoneNumberSchema.trim(),
});

const loginUserSchema = z.object({
  email: emailSchema.optional(),
  username: usernameSchema.optional(),
  password: password,
});

const changePasswordSchema = z.object({
  currentPassword: password,
  newPassword: password,
});

const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  newPassword: password,
});

const updateUserSchema = z.object({
  fullname: fullnameSchema,
  email: emailSchema,
});

const refreshTokenRequestSchema = z.object({
  refreshToken: refreshTokenSchema,
  cookies: z
    .object({
      refreshToken: refreshTokenSchema,
    })
    .refine((data) => data.refreshToken, {
      message: 'Refresh token is required',
      path: ['refreshToken'],
    }),
});

const verifyVerificationCodeSchema = z.object({
  username: usernameSchema,
  code: z.string().length(6, {
    message: 'Verification code must be 6 digits!',
  }),
});

export default {
  registerUserSchema,
  loginUserSchema,
  changePasswordSchema,
  updateUserSchema,
  refreshTokenSchema,
  requestPasswordResetSchema,
  refreshTokenRequestSchema,
  verifyVerificationCodeSchema,
  resetPasswordSchema,
};
