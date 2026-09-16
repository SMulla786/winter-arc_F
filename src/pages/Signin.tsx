import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {signInValidationSchema} from '@/lib/validation/authSchemas';
import {Link} from '@tanstack/react-router';
import {useLoginUser} from '@/lib/react-query/queriesAndMutations/auth';
import {useAuthContext} from '@/context/AuthContext';
import {decodeToken, mapJwtToUser} from '@/types/jwt';
import {FiLock, FiMail} from 'react-icons/fi';
import SyncLoader from 'react-spinners/SyncLoader';
import {useState} from 'react';
import {BsEye, BsEyeSlash} from 'react-icons/bs';

type SignInFormValues = z.infer<typeof signInValidationSchema>;

const SignIn: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {mutateAsync: signIn, isError, isPending, error} = useLoginUser();
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInValidationSchema),
    defaultValues: {},
  });

  const {setUser, setIsAuthenticated, setToken} = useAuthContext();

  const onSubmit = async (values: SignInFormValues) => {
    try {
      const res = await signIn(values);
      const tokenData = decodeToken(res.data.accessToken);
      setUser(mapJwtToUser(tokenData));
      setToken(res.data);
      setIsAuthenticated(true);
      if (tokenData.languageId) {
        localStorage.setItem('languageId', tokenData.languageId);
      }
      if (tokenData.caterorId) {
        localStorage.setItem('caterorId', tokenData.caterorId);
      }
      window.location.href = '/dashboard';
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <h2 className="mb-9 text-center text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
        Sign In
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="mb-2.5 block font-medium text-black dark:text-white">
            Email or username
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your email or username"
              {...register('identifier')}
              className={`w-full rounded-lg border ${errors.identifier ? 'border-red-500' : 'border-stroke'} bg-transparent py-4 pl-6 pr-10 text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
            />
            <span className="absolute right-4 top-4">
              <FiMail size={22} />
            </span>
            {errors.identifier && (
              <p className="text-red-500">{errors.identifier.message}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2.5 block font-medium text-black dark:text-white">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              {...register('password')}
              className={`w-full rounded-lg border ${errors.password ? 'border-red-500' : 'border-stroke'} bg-transparent py-4 pl-6 pr-10 text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
            />
            <span
              className="absolute right-12 top-4 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <BsEyeSlash size={22} /> : <BsEye size={22} />}
            </span>
            <span className="absolute right-4 top-4 cursor-pointer">
              <FiLock size={22} />
            </span>
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>
        </div>

        {isError && (
          <div className="mb-4">
            <p className="text-red-500">{error?.message}</p>
          </div>
        )}

        <div className="mb-5">
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
          >
            {isPending ? <SyncLoader className="bg-primary" /> : 'Sign In'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p>
            Don’t have any account?{' '}
            <Link className="text-primary" to="/signup">
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </>
  );
};

export default SignIn;
