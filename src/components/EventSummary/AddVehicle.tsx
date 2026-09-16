import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import {useAuthContext} from '@/context/AuthContext';
import {useAddVehicleDraft} from '@/context/FormContext/AddVehicleContext';
import {
  useCreateVehicle,
  useUpdateVehicle,
} from '@/lib/react-query/queriesAndMutations/cateror/eventsummary';
import {zodResolver} from '@hookform/resolvers/zod';
import React, {useEffect, useMemo, useRef} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {FaArrowLeft} from 'react-icons/fa';
import {z} from 'zod';

/* ---------------------------------- */
/* ZOD SCHEMA */
/* ---------------------------------- */

export const vehicleSchema = z.object({
  id: z.string().optional(),
  vehicleName: z.string().min(1, 'Vehicle name is required'),
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  fuelPerKm: z.coerce.number().min(1, 'Fuel per km is required'),
});

export type VehicleType = z.infer<typeof vehicleSchema>;

/* ---------------------------------- */
/* COMPONENT */
/* ---------------------------------- */

const AddVehicle = ({
  currentVehicle,
  showUpdate,
  setShowUpdate,
}: {
  currentVehicle?: {
    id: string;
    vehicleName: string;
    vehicleNumber: string;
    fuelPerKm: string;
  };
  showUpdate?: boolean;
  setShowUpdate?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  /* ---------------------------------- */
  /* FORM SETUP */
  /* ---------------------------------- */

  const methods = useForm<VehicleType>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicleName: '',
      vehicleNumber: '',
      fuelPerKm: 0,
    },
  });

  const {handleSubmit, reset, watch} = methods;

  /* ---------------------------------- */
  /* MUTATIONS */
  /* ---------------------------------- */

  const {mutate: addVehicle, isSuccess} = useCreateVehicle();
  const {mutate: updateVehicle} = useUpdateVehicle();

  /* ---------------------------------- */
  /* DRAFT CONTEXT */
  /* ---------------------------------- */

  /* ---------------------------------- */
  /* MODE DETECTION */
  /* ---------------------------------- */

  const isEditMode = Boolean(currentVehicle?.id);
  const hasInitialized = useRef(false);
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.vehiclepage;
  const role = user?.role;
  /* ---------------------------------- */
  /* WATCH FORM VALUES */
  /* ---------------------------------- */

  const values = watch();

  /* ---------------------------------- */
  /* INITIALIZE FORM (ONCE) */
  /* ---------------------------------- */

  useEffect(() => {
    if (hasInitialized.current) return;

    if (isEditMode && currentVehicle) {
      reset({
        id: currentVehicle.id,
        vehicleName: currentVehicle.vehicleName,
        vehicleNumber: currentVehicle.vehicleNumber,
        fuelPerKm: Number(currentVehicle.fuelPerKm),
      });
    }

    hasInitialized.current = true;
  }, [isEditMode, currentVehicle]);

  /* ---------------------------------- */
  /* AUTO SAVE DRAFT (CREATE MODE ONLY) */
  /* ---------------------------------- */

  useEffect(() => {
    if (!hasInitialized.current || isEditMode) return;
  }, [values, isEditMode]);

  /* ---------------------------------- */
  /* CLEAR DRAFT AFTER SUCCESS */
  /* ---------------------------------- */

  useEffect(() => {
    if (!isSuccess) return;
    reset();
  }, [isSuccess, reset]);

  /* ---------------------------------- */
  /* SUBMIT HANDLER */
  /* ---------------------------------- */

  const onSubmit = (data: VehicleType) => {
    if (isEditMode && currentVehicle) {
      updateVehicle(
        {
          id: currentVehicle.id,
          data,
        },
        {
          onSuccess: () => setShowUpdate?.(false),
        },
      );
    } else {
      addVehicle(data, {
        onSuccess: () => reset(),
      });
    }
  };

  /* ---------------------------------- */
  /* RENDER */
  /* ---------------------------------- */

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border border-slate-200 bg-white px-8 py-4 dark:border-slate-600 dark:bg-black"
      >
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12 md:gap-6">
          <div className="col-span-12 flex items-center gap-2">
            {showUpdate && (
              <button type="button" onClick={() => setShowUpdate?.(false)}>
                <FaArrowLeft />
              </button>
            )}
            <h1 className="text-lg font-semibold">Vehicles</h1>
          </div>

          <div className="col-span-12 md:col-span-4">
            <GenericInputField
              label="Vehicle Name"
              name="vehicleName"
              placeholder="Enter vehicle name"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <GenericInputField
              label="Vehicle Number"
              name="vehicleNumber"
              placeholder="Enter vehicle number"
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <GenericInputField
              label="Fuel per km"
              name="fuelPerKm"
              placeholder="Enter fuel per km"
              type="number"
            />
          </div>

          <div className="col-span-12 flex justify-end">
            {(role === 'CATEROR' || restriction === 'EDIT') && (
              <GenericButton type="submit">
                {isEditMode ? 'Update' : 'Submit'}
              </GenericButton>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default AddVehicle;
