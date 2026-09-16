import DisplayIncomeExpense from '@/components/IncomeExpenditure/DisplayIncomeExpense';
import IncomeExpenditure from '@/components/IncomeExpenditure/IncomeExpenditure';
import TopIncomeComponent from '@/components/IncomeExpenditure/TopIncomeComponent';
import {IncomeExpense} from '@/types';
import React, {useState} from 'react';
import {Route} from '@/routes/_app/_event/events.$id';

const MainIncomeExpense = () => {
  const [addNewModal, setAddNewModal] = useState(false);
  const [editIncomeModal, setEditIncomeModal] = useState(true);

  const {id: EventId} = Route.useParams();
  return (
    <div>
      <TopIncomeComponent
        id={EventId}
        addNewModal={addNewModal}
        editIncomeModal={editIncomeModal}
        setAddNewModal={setAddNewModal}
        setEditIncomeModal={setEditIncomeModal}
      />
      {addNewModal && (
        <IncomeExpenditure
          setAddNewModal={setAddNewModal}
          setEditIncomeModal={setEditIncomeModal}
        />
      )}
      {editIncomeModal && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <DisplayIncomeExpense status={IncomeExpense.Income} />
          <DisplayIncomeExpense status={IncomeExpense.Recivable} />
          <DisplayIncomeExpense status={IncomeExpense.Expense} />
          <DisplayIncomeExpense status={IncomeExpense.Payable} />
        </div>
      )}
    </div>
  );
};

export default MainIncomeExpense;
