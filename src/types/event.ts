export type ID = {id: string};

export interface SubEvents {
  SubEventName: string;
  SubEventID: string;
}

export interface IEventTypes {
  EventName: string;
  EventID: string;
  SubEvents: SubEvents[];
}

export interface DishSubEvent {
  caterorDishID: string;
  discountPercentage?: number;
  peopleCount?: number;
  quantity?: number;
}

export interface UpdateDishDiscount extends DishSubEvent {
  id: string;
}

export interface StaffSubEvent {
  staffID: string;
  subEventID: string;
}

export interface Maharaj {
  MaharajID: string;
  Name: string;
}
