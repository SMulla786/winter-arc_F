import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useEffect} from 'react';
import React, {useState} from 'react';
import {Route} from '@/routes/_auth/verify-email.lazy';
import {useVerifyCode} from '@/lib/react-query/queriesAndMutations/auth';
import {useModal} from '@/context/ModalContext';
import {useNavigate} from '@tanstack/react-router';

type SearchParams = {
  code: string;
  username: string;
};

const EmailVerificationPage = ({codelength = 6}) => {
  const {openModal} = useModal();
  const navigate = useNavigate();
  const {code, username} = Route.useSearch<SearchParams>();
  const [codeValues, setCodeValues] = useState(Array(codelength).fill(''));

  const {mutateAsync: verifyCode} = useVerifyCode();

  useEffect(() => {
    const splitCode = code.toString().split('');
    //delay in adding code to field
    const timeoutId = setTimeout(() => {
      if (splitCode.length === codelength) {
        setCodeValues(splitCode);
      }
    }, 2000);

    () => clearTimeout(timeoutId);
  }, [code, codelength]);

  const handleInputChange = (value: string, index: number) => {
    const newCodeValues = [...codeValues];
    newCodeValues[index] = value;
    setCodeValues(newCodeValues);

    // Move to the next input if value is filled
    if (value.length === 1 && index < codelength - 1) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle keyboard navigation (backspace, arrow keys)
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === 'Backspace' && !codeValues[index]) {
      // Move to the previous input on backspace if the current input is empty
      if (index > 0) {
        const prevInput = document.getElementById(`code-input-${index - 1}`);
        if (prevInput) {
          prevInput.focus();
        }
      }
    }
  };

  const handleRedirection = () => {
    navigate({to: '/signin'});
  };

  const handleSubmit = async (data: SearchParams) => {
    try {
      const res = await verifyCode({
        code: data.code,
        username: data.username,
      });

      if (res)
        openModal(
          'INFO',
          <p>Email Verification Successfull!</p>,
          handleRedirection,
        );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <h2 className="mb-9 text-center text-lg font-bold text-black dark:text-white sm:text-title-lg">
        Email Verification
      </h2>
      <div className="flex items-center justify-center gap-2">
        {Array(codelength)
          .fill('')
          .map((_, index) => (
            <input
              key={index}
              id={`code-input-${index}`}
              className="w-20 rounded border-2 border-stroke p-4 text-center font-bold"
              placeholder="0"
              maxLength={1}
              value={codeValues[index]}
              onChange={(e) => handleInputChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
      </div>
      <div className="flex justify-center">
        <GenericButton
          className="mt-9"
          onClick={() =>
            handleSubmit({code: code.toString(), username: username})
          }
        >
          Verify Code
        </GenericButton>
      </div>
    </>
  );
};

export default EmailVerificationPage;
