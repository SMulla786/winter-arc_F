import EventUtensil from '@/components/Event/EventUtensil';

const EventUtensilPage: React.FC = () => {
  return (
    <div className="s">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <EventUtensil />
        </div>
      </div>
    </div>
  );
};

export default EventUtensilPage;
