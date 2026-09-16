import React from 'react';
import {Link, useRouter} from '@tanstack/react-router';
import {FiMail, FiUser, FiLock, FiPhone} from 'react-icons/fi';
import {z} from 'zod';
import {
  registerUserSchema,
  signUpValidationSchema,
} from '@/lib/validation/authSchemas';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {useRegisterUser} from '@/lib/react-query/queriesAndMutations/auth';
import SyncLoader from 'react-spinners/SyncLoader';
import {useModal} from '@/context/ModalContext';

type signUpValues = z.infer<typeof registerUserSchema>;

const SignUp: React.FC = () => {
  const {openModal} = useModal();
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<signUpValues>({
    resolver: zodResolver(signUpValidationSchema),
  });
  const router = useRouter();

  const {mutateAsync: signUp, isError, isPending, error} = useRegisterUser();

  const handleRedirectionToGmail = () => {
    window.location.href = 'https://www.gmail.com';
  };

  const onsubmit = async (data: signUpValues) => {
    console.log(data);
    try {
      await signUp(data);
      openModal(
        'INFO',
        <p>We have sent a email verfication link</p>,
        handleRedirectionToGmail,
      );

      router.navigate({to: '/verification-mail-notifier'});
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <h2 className="mb-9 text-center text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
        Sign Up
      </h2>

      <form onSubmit={handleSubmit(onsubmit)}>
        <div className="mb-4">
          <label className="mb-2.5 block font-medium text-black dark:text-white">
            Name
          </label>
          <div className="relative">
            <input
              type="text"
              {...register('fullname')}
              placeholder="Enter your full name"
              className={`w-full rounded-lg border ${errors.fullname ? 'border-red-500' : 'border-stroke'} bg-transparent py-4 pl-6 pr-10 text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
            />
            {errors.fullname && (
              <p className="text-red-500">{errors.fullname.message}</p>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="mb-2.5 block font-medium text-black dark:text-white">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              {...register('username')}
              placeholder="Enter your username"
              className={`w-full rounded-lg border ${errors.username ? 'border-red-500' : 'border-stroke'} bg-transparent py-4 pl-6 pr-10 text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
            />

            <span className="absolute right-4.5 top-4">
              <FiUser size={22} />
            </span>
            {errors.username && (
              <p className="text-red-500">{errors.username.message}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2.5 block font-medium text-black dark:text-white">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              {...register('email')}
              placeholder="Enter your email"
              className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-stroke'} bg-transparent py-4 pl-6 pr-10 text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
            />

            <span className="absolute right-4 top-4">
              <FiMail size={22} />
            </span>
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2.5 block font-medium text-black dark:text-white">
            Phone Number
          </label>
          <div className="relative">
            <input
              type="text"
              {...register('phoneNumber')}
              placeholder="Enter your phone number"
              className={`w-full rounded-lg border ${errors.phoneNumber ? 'border-red-500' : 'border-stroke'} bg-transparent py-4 pl-6 pr-10 text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
            />

            <span className="absolute right-4 top-4">
              <FiPhone size={22} />
            </span>

            {errors.phoneNumber && (
              <p className="text-red-500">{errors.phoneNumber.message}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2.5 block font-medium text-black dark:text-white">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              {...register('password')}
              placeholder="Enter your password"
              className={`w-full rounded-lg border ${errors.password ? 'border-red-500' : 'border-stroke'} bg-transparent py-4 pl-6 pr-10 text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
            />

            <span className="absolute right-4 top-4">
              <FiLock size={22} />
            </span>

            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>
        </div>

        {isError && (
          <p className="text-red-500">
            {error?.message || 'An error occurred'}
          </p>
        )}

        <div className="mb-5">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
          >
            {isPending ? <SyncLoader className="bg-primary" /> : 'Sign Up'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p>
            Already have an account?{' '}
            <Link to="/signin" className="text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </>
  );
};

export default SignUp;
