import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import AddDish from '@/components/Dish/AddDish';

type Dish = {
  Name: string;
  Category: string;
};

const DishNames: Dish[] = [
  {Name: 'Dish 1', Category: 'sweet'},
  {Name: 'Dish 2', Category: 'sweet'},
];

const columns: Column<Dish>[] = [
  {header: 'Dish Name', accessor: 'Name', sortable: true},
  {header: 'Dish Category', accessor: 'Category', sortable: true},
];

const AddDishPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">{/* <AddDish /> */}</div>
        {/* <div className="col-span-8">
          <GenericTable
            data={DishNames}
            columns={columns}
            itemsPerPage={5}
            action
            onDelete={() => {}}
            onEdit={() => {}}
          />
        </div> */}
      </div>
    </div>
  );
};

export default AddDishPage;
