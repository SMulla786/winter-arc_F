import RawMaterialListdata from '@/components/Store/RawMaterialListdata';
import { useAuthContext } from '@/context/AuthContext';
import { useNavigate } from '@tanstack/react-router';

const InventoryPage = () => {
  const navigate = useNavigate();

  const { user } = useAuthContext();
  const role = user?.role;
  const storeInventoryRestriction = user?.employeeRestriction?.storeInventory;

  const hasEditAccess =
    role === 'CATEROR' || storeInventoryRestriction === 'EDIT';

  return (
    <div>
      {/*  BUTTON OUTSIDE */}
      {hasEditAccess && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => navigate({to:'/addrawmaterialnew'})}
            className="mx-1 rounded bg-primary px-6 py-1 text-white"
          >
            Add Raw Material
          </button>
        </div>
      )}

      {/* WHITE BOX */}
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-boxdark">
        <RawMaterialListdata hasEditAccess={hasEditAccess} />
      </div>
    </div>
  );
};

export default InventoryPage;