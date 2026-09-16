import AddRawMaterial from '@/components/Dish/AddRawMaterial';
import DisplayRawMaterial from '@/components/Dish/DisplayRawMaterial';

const AddRawMaterialPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <AddRawMaterial />
        </div>
        <div className="col-span-8">
          <DisplayRawMaterial />
        </div>
      </div>
    </div>
  );
};

export default AddRawMaterialPage;
