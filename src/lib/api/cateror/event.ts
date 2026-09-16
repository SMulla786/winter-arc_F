/*eslint-disable*/
import {
  bulkAddDishWastageSchema,
  eventPeopleValidationSchema,
  SubEventRawMaterialListValidation,
} from '@/lib/validation/eventSchema';
import {api, unAuthenticatedApi} from '@/utils/axios';
import {AxiosError} from 'axios';
import z from 'zod';
type bulkAddDishWastageRequestBody = z.infer<typeof bulkAddDishWastageSchema>;
type EventPeopleRequestBody = z.infer<typeof eventPeopleValidationSchema>;
type AddSubEventDishRawMaterialBody = z.infer<
  typeof SubEventRawMaterialListValidation
>;

const addEvent = async (data: {
  name: string;
  startDate: string;
  endDate: string;
  eventId?: string;
  clientId?: string;
}) => {
  try {
    console.log('dataaaaaaaaaaaaaaaa', data);
    const res = await api.post('/cateror/events', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const getEventById = async (id: string) => {
  try {
    const res = await api.get(`/cateror/events/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};
const updateEvent = async (data: {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}) => {
  try {
    const res = await api.patch(`/cateror/events/${data.id}`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update event',
      );
    }
    throw error;
  }
};

const getallEvents = async () => {
  try {
    const res = await api.get('/cateror/events');
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add event');
    }
    throw error;
  }
};

export type pinData = {
  eventId: string;
  pinned: boolean;
};
const postassign = async (data: pinData) => {
  try {
    const res = await api.put(`/cateror/events`, data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to post event');
    }
    throw error;
  }
};

const getallDishCategoriesWithDishes = async () => {
  try {
    const res = await api.get('/cateror/dishcatdish');
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const createSubevent = async (data: {
  name: string;
  address: string;
  dishes: {dishId: string}[];
  expectedPeople: number;
  time: string;
  date: string;
  maleWaiters: number;
  femaleWaiters: number;
  cooks: number;
  washers: number;
  helpers: number;
  manpower: number;
  eventId: string;
  note: string;
}) => {
  try {
    const res = await api.post('/cateror/events/subevents', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

export const createSubeventExternal = async (data: {
  name: string;
  address: string;
  dishes: {dishId: string}[];
  expectedPeople: number;
  time: string;
  date: string;
  maleWaiters: number;
  femaleWaiters: number;
  cooks: number;
  washers: number;
  helpers: number;
  manpower: number;
  eventId: string;
  note: string;
}) => {
  try {
    const res = await api.post('subevents', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const updateSubEvent = async (data: {
  id: string;
  name: string;
  address: string;
  dishes: {dishId: string}[];
  expectedPeople: number;
  time: string;
  date: string;
  eventId: string;
  subEventId: string;
  note: string;
  addon: {id: string}[];
}) => {
  try {
    const res = await api.patch(
      `/cateror/events/subevents/${data.subEventId}`,
      data,
    );
    return res;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update SubEvent',
      );
    }
    throw error;
  }
};

export const addCutleryInSubEvent = async (
  subEventId: string,
  data: {id: string}[],
) => {
  try {
    const res = await api.post(
      `/cateror/events/subevents/cutlery/${subEventId}`,
      data,
    );
    return res;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update SubEvent',
      );
    }
    throw error;
  }
};

export const getCutleryInSubEvent = async (subEventId: string) => {
  try {
    const res = await api.get(
      `/cateror/events/subevents/cutlery/${subEventId}`,
    );

    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const addSubEventDishRawMaterial = async (
  data: AddSubEventDishRawMaterialBody,
) => {
  // rawMaterialId: z.string().optional(),
  //   quantity: z.number().optional(),
  //   processId: z.string().optional(),

  try {
    const res = await api.post('/cateror/events/subevents/rawmaterials', {
      ...data,
    });
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to Add Raw Material to Dish',
      );
    }
    throw error;
  }
};

const getSubEvent = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/events/subevents/${eventId}`);

    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const deleteSubEventById = async (id: string) => {
  try {
    const res = await api.delete(`/cateror/events/subevents/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete sub event',
      );
    }
    throw error;
  }
};

const getSubEventById = async (subEventId: string) => {
  try {
    const res = await api.get(`/cateror/events/subeventById/${subEventId}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const getShareDataBySubeventId = async (subEventId: string) => {
  try {
    const res = await api.get(`/cateror/events/subevents/data/${subEventId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to get sharing data from manpower',
      );
    }
    throw error;
  }
};

const getAllRawMaterialFromSubEvent = async (eventId: string) => {
  try {
    const res = await api.get(
      `/cateror/events/subevents/rawmaterials/${eventId}`,
    );
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const getAllRawmaterialsFromEvent = async (id: string) => {
  try {
    const res = await api.get(`/cateror/events/rawmaterials/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};
const getAllRawmaterialsUsageFromEvent = async (id: string) => {
  try {
    const res = await api.get(`/cateror/events/rawmaterials/usage/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

export const getallexternalpo = async (listId: string) => {
  console.log('api idd//////', listId);
  try {
    const res = await api.get(`/cateror/purchase/rmlist/${listId}`);
    console.log('getexternalpodataaa', res);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

export const getallexternalpodata = async (listId: string) => {
  console.log('api idd//////', listId);
  try {
    const res = await api.get(`/cateror/purchase/rmlistId/${listId}`);
    console.log('getexternalpodataaa', res);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get external po data',
      );
    }
    throw error;
  }
};

export const getFoodVendorAssignments = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/events/dishes/foodvendors/${eventId}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

export const updateFoodVendorAssignments = async (
  subEventId: string,
  data: {
    id: string;
    actual: number;
  },
) => {
  try {
    const res = await api.put(
      `/cateror/events/dishes/foodvendors/${subEventId}`,
      data,
    );
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update food vendor',
      );
    }
    throw error;
  }
};

const bulkAddEventDishWastage = async (data: bulkAddDishWastageRequestBody) => {
  console.log('dataaaaaaaaaaaaaaaa', data);

  if (!data.subeventId) {
    throw new Error('Missing subeventId');
  }

  try {
    const res = await api.patch(`/cateror/wastages`, {
      eventId: data.subeventId,
      wastages: data.wastages,
    });
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const getWastages = async (id: string) => {
  try {
    const res = await api.get(`/cateror/wastages/subevent/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

// after event

const updateActualPeople = async (
  data: {
    subEventId: string;
    actualPeople: number;
  }[],
) => {
  console.log('Sending Data :::::::::::::::::::::::::::::::::', data);
  try {
    const res = await api.put('/cateror/events/addActualPeople', data);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update People',
      );
    }
    throw error;
  }
};

const createExtraCost = async (data: {
  EventId: string;
  name: string;
  amount: number;
  description: string;
}) => {
  try {
    const res = await api.post(`/cateror/events/ExtraCost/${data.EventId}`, {
      name: data.name,
      amount: Number(data.amount),
      description: data.description,
    });
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const updateSubeventCost = async (data: {
  subeventId: string;
  amount: number;
  perPlate: number;
}) => {
  try {
    console.log('====================================');
    console.log('api  dsssata', data);
    console.log('====================================');
    const res = await api.put(
      `/cateror/events/subevents/quotations/${data.subeventId}`,
      {cost: data.amount, perPlate: data.perPlate},
    );
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

export const updateBillingCost = async (data: {
  subeventId: string;
  amount: number;
}) => {
  try {
    console.log('====================================');
    console.log('dsssata', data);
    console.log('====================================');
    const res = await api.put(
      `/cateror/events/subevents/bill/${data.subeventId}`,
      {cost: data.amount},
    );
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const getExtraCost = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/events/ExtraCost/${eventId}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const deleteExtraCost = async (id: string) => {
  try {
    const res = await api.delete(`/cateror/events/ExtraCost/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const getActualPeople = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/events/actualPeople/${eventId}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get actual people',
      );
    }
    throw error;
  }
};

const getQuotation = async (eventId: string) => {
  try {
    const res = await api.get(`/cateror/events/quotations/${eventId}`);
    // console.log("res",res)
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const updateQuotation = async (EventId: string, data: any) => {
  try {
    // console.log('data111111111111111111111', data);
    const res = await api.patch(`/cateror/events/quotations/${EventId}`, data);
    console.log('res', res);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to update Quotation',
      );
    }
    throw error;
  }
};
export const subEventPrediction = async (
  subEventId: string,
  preparationPeople: number,
) => {
  try {
    const res = await api.post('/cateror/events/subevents/predict', {
      subEventId,
      preparationPeople,
    });
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const getQrData = async (subEventId: string) => {
  try {
    console.log('subEventId', subEventId);
    const res = await unAuthenticatedApi.get(`/subeventbyId/${subEventId}`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to get Qr Data');
    }
    throw error;
  }
};

const deleteEvent = async (eventId: string) => {
  try {
    const res = await api.delete(`/cateror/events/${eventId}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const getEventSummary = async (id: string) => {
  const response = await api.get(`cateror/events/summary/${id}`);
  return response.data;
};

export const getAllDishProcess = async (id: string) => {
  try {
    const res = await api.get(`/cateror/events/process/${id}`);
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to add dish');
    }
    throw error;
  }
};

const postMultiPackagesToSubEvent = async (
  subEventId: string,
  data: string[],
) => {
  try {
    const res = await api.post(
      `/cateror/events/subEvents/packges/${subEventId}`,
      data,
    );
    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to add packages',
      );
    }
    throw error;
  }
};

const getMultiPackagesToSubEvent = async (subEventId: string) => {
  try {
    const res = await api.get(
      `/cateror/events/subEvents/packges/${subEventId}`,
    );

    return res;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to get packages',
      );
    }
    throw error;
  }
};

export {
  addEvent,
  addSubEventDishRawMaterial,
  bulkAddEventDishWastage,
  createExtraCost,
  createSubevent,
  deleteExtraCost,
  deleteSubEventById,
  getActualPeople,
  getallDishCategoriesWithDishes,
  getallEvents,
  getAllRawMaterialFromSubEvent,
  getAllRawmaterialsFromEvent,
  getExtraCost,
  getQrData,
  getQuotation,
  getSubEvent,
  getSubEventById,
  getShareDataBySubeventId,
  getWastages,
  updateActualPeople,
  updateQuotation,
  updateSubEvent,
  updateSubeventCost,
  deleteEvent,
  updateEvent,
  getEventById,
  getEventSummary,
  postassign,
  postMultiPackagesToSubEvent,
  getMultiPackagesToSubEvent,
  getAllRawmaterialsUsageFromEvent,
};
