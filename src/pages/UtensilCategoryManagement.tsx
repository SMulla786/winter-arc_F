import DisplayUtensilCategory from '@/components/Utensils/DisplayUtensilCategory';
import UtensilCategory from '@/components/Utensils/UtensilCategory';

const UtensilCategoryManagement: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <UtensilCategory />
        </div>
        <div className="col-span-8">
          <DisplayUtensilCategory />
        </div>
      </div>
    </div>
  );
};

export default UtensilCategoryManagement;
