/* eslint-disable */
import React, {useEffect, useState} from 'react';
import {useUpdateCounterIndexing} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useDeleteCounter, useGetCounter} from './counterHelper';
import {DndContext, closestCenter, DragEndEvent} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {
  EditIcon,
  GripVertical,
  Trash,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {FiEye} from 'react-icons/fi';

const DraggableCell = ({item, onEdit, onDelete}: any) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const {setNodeRef, attributes, listeners, transform, transition, isDragging} =
    useSortable({id: item.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 ${isDragging ? 'z-50' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-400 hover:text-gray-600 cursor-grab transition-colors active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>
      <span className="bg-gray-100 text-gray-700 inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">
        {item.index + 1}
      </span>
      <span className="text-gray-800 font-medium">{item.name}</span>
    </div>
  );
};

const ActionCell = ({item, onEdit, onDelete}: any) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onEdit(item.id)}
        className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
        aria-label="Edit counter"
      >
        <EditIcon size={14} />
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
        aria-label="Delete counter"
      >
        {isDeleting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash size={14} />
        )}
      </button>
    </div>
  );
};

const CounterDisplay: React.FC<{onEdit: (id: string) => void}> = ({onEdit}) => {
  const {data: counter = [], isLoading, isError} = useGetCounter();
  const {mutateAsync: deleteCounter} = useDeleteCounter();
  const {mutate: updateIndexing} = useUpdateCounterIndexing();

  const [rows, setRows] = useState<any[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    // Add index to each item for display
    const indexedRows = counter.map((item: any, index: number) => ({
      ...item,
      index,
    }));
    setRows(indexedRows);
  }, [counter]);

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if (!over || active.id === over.id) return;

    setIsReordering(true);

    setRows((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      const newOrder = arrayMove(prev, oldIndex, newIndex);

      // Update indexes after reordering
      const updatedOrder = newOrder.map((item, index) => ({
        ...item,
        index,
      }));

      updateIndexing(
        newOrder.map((item, index) => ({
          counterId: item.id,
          indexing: index,
        })),
        {
          onSettled: () => setIsReordering(false),
        },
      );

      return updatedOrder;
    });
  };

  const columns: Column<any>[] = [
    {
      header: 'Order',
      accessor: 'name',
      render: (item) => (
        <DraggableCell item={item} onEdit={onEdit} onDelete={deleteCounter} />
      ),
      className: 'min-w-[200px]',
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (item) => (
        <ActionCell item={item} onEdit={onEdit} onDelete={deleteCounter} />
      ),
      className: 'min-w-[150px]',
    },
  ];

  if (isLoading) {
    return (
      <div className="border-gray-200 mt-6 rounded-lg border bg-white p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={32} className="mb-4 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading counters...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-6 rounded-lg border border-red-100 bg-red-50 p-6">
        <div className="flex items-center gap-3 text-red-800">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">Failed to load counters</p>
            <p className="mt-1 text-sm text-red-600">
              Please try refreshing the page
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="border-gray-200 mt-6 rounded-lg border bg-white p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-gray-100 mb-4 rounded-full p-4">
            <EditIcon size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No counters found</p>
          <p className="text-gray-500 mt-1 text-sm">
            Add your first counter to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={rows.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mt-6">
          {/* <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 text-lg font-semibold">Counters</h3>
              <p className="text-gray-500 mt-1 text-sm">
                Drag and drop to reorder counters
                {isReordering && (
                  <span className="ml-2 inline-flex items-center gap-1 text-blue-600">
                    <Loader2 size={12} className="animate-spin" />
                    Saving order...
                  </span>
                )}
              </p>
            </div>
            <div className="text-gray-500 bg-gray-50 rounded-md px-3 py-1.5 text-sm">
              {rows.length} counter{rows.length !== 1 ? 's' : ''}
            </div>
          </div> */}

          <GenericTable
            data={rows}
            columns={columns}
            title="Counter List"
            searchAble
            action={false}
            paginationOff
            onEdit={() => {}} // Handled in ActionCell
            onDelete={() => {}} // Handled in ActionCell
          />

          <div className="text-gray-500 mt-4 flex items-center gap-2 text-sm">
            <GripVertical size={14} />
            <span>Drag the handle to reorder counters</span>
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default CounterDisplay;
