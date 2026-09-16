import DisplayUtensils from '@/components/Utensils/DisplayUtensils';
import Utensil from '@/components/Utensils/Utensil';

const UtensilManagement: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <Utensil />
        </div>
        <div className="col-span-8">
          <DisplayUtensils />
        </div>
      </div>
    </div>
  );
};

export default UtensilManagement;
