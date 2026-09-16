import Dish from '@/components/Dish/Dish';
import DisplayDish from '@/components/Dish/DisplayDish';

const DishManagement: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <Dish />
        </div>
        <div className="col-span-8">
          <DisplayDish />
        </div>
      </div>
    </div>
  );
};

export default DishManagement;
