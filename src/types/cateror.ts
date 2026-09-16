// types/clients.ts
/* eslint-disable */
export interface User {
  id: string;
  email: string;
  fullname: string;
  phoneNumber: string;
  secondaryPhoneNumber?: string;
  username: string;
  role: string;
  isVerified: boolean;
}

// Type for creating a new client
export interface ClientCreate {
  fullname: string;
  phoneNumber: string;
  email: string;
  username: string;
  secondaryPhoneNumber?: string;
  address: string;
  caste: string;
  birthday: string;
  anniversary: string;
}

export interface EmployeeCreate {
  fullname: string;
  phoneNumber: string;
  email?: string;
  username: string;
  secondaryPhoneNumber?: string;
  address?: string;
  caste?: string;
  caterorId?: string;
  password?: string;
  isCounter?: boolean;
}

export interface GstBillData {
  bills: {
    amountPercentage: number;
    isGST: boolean;
    SGST: number;
    CGST: number;
    GST: number;
  }[];
}

export interface EmployeeSetting {
  employeeId?: string;
  eventPage?: string;
  clientPage?: string;
  packagePage?: string;
  reportsPage?: string;
  dishPage?: string;
  settingPage?: string;
  maharajPage?: string;
  utensilPage?: string;
  disposalPage?: string;
  addonServicePage?: string;
  foodVendorPage?: string;
  incomeExpenditurePage?: string;
  notificationDishPage?: string;
  expenseMasterPage?: string;
  vendorPage?: string;
  employeeSettingPage?: string;
  createPackagePage?: string;
  displayPackagePage?: string;
  rawMaterialCategoryPage?: string;
  rawMaterialPage?: string;
  rawMaterialProcessPage?: string;
  dishCategoryPage?: string;
  createDishPage?: string;
  allDishesPage?: string;
  paymentDetailsPage?: string;
  termsConditionsPage?: string;
  vendorRolePage?: string;
  websiteContentPage?: string;
  imageUploadPage?: string;
  utensilCategoryPage?: string;
  createUtensilsPage?: string;
  utensilsInventoryPage?: string;
  disposalCategoryPage?: string;
  createDisposalPage?: string;
  disposalInventoryPage?: string;
  createEmployeePage?: string;
  vehiclepage?: string;
  cutlerypage?: string;
  crmprocesspage?: string;
  crmdashboardpage?: string;
  dresscodepage?: string;
  subEventPage?: string;
  eventRateListPage?: string;
  quotation?: string;
  rawmaterialCalculator?: string;
  rawMaterialOrder?: string;
  dishProcess?: string;
  eventDisposals?: string;
  eventUtensils?: string;
  afterEvent?: string;
  bill?: string;
  headerIncomeExpense?: string;
  peopleCheck?: string;
  westageReport?: string;
  rawMaterialReturn?: string;
  utensilChecking?: string;
  afterEventDisposal?: string;
  counterpage?: string;
  utensilpeoplepage?: string;
  disposalpeoplepage?: string;
  cutlerycategorypage?: string;
  mastercutlerypage?: string;
  rawmaterialvendorpage?: string;
  displayvendorpage?: string;
  disposalvendorpage?: string;
  dishCountandRMOrder?: string;
  storeInventory?: string;
  inwordStore?: string;
  outwordStore?: string;
  inwordHistory?: string;
  outwordHistory?: string;
  pendingBillReport?: string;
  storeReport?: string;
  wastageReport?: string;
  disposalReport?: string;
  utensilsReport?: string;
  fuelMaster?: string;
  banquetpage?: string;
}
// Type for updating an existing client
export interface ClientUpdate {
  fullname?: string;
  phoneNumber?: string;
  secondaryPhoneNumber?: string;
  email: string;
  address?: string;
  caste?: string;
  birthday?: string;
  anniversary?: string;
}

// Type for a client object
export interface Client {
  id: string;
  userId: string;
  isVegetarian: boolean;
  isJain: boolean;
  address: string;
  caste: string;
  caterorId: string;
  user: User;
}

export interface subEventCost {
  quotationGST: number;
  quotationCGST: number;
  quotationSGST: number;
  subeventCost: {
    cost: number;
    perPlate: number;
    id: number;
  }[];
}
// Type for the response data when retrieving clients
export interface ClientsResponse {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
}

// src/types/disposal.ts

export interface DisposalCategory {
  id?: string;
  name: string;
  languageId: string;
}

export interface Disposal {
  id?: string;
  name: string;
  categoryId: string;
  languageId: string;
}

// You can add more types as needed

// src/types/maharaj.ts
export interface Maharaj {
  id?: string;
  email: string;
  fullname: string;
  phoneNumber: string;
  secondaryPhoneNumber?: string;
  username: string;
  caterorId: string;
  experience: number;
  isAvailable: boolean;
  specialization: string;
}

export interface CaterorProfile {
  id: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  address: string;
  state: string;
  city: string;
  username: string;
  password: string;
  imageFile: File;
}

export interface MaharajRegister {
  email: string;
  fullname: string;
  phoneNumber: string;
  secondaryPhoneNumber?: string;
  username: string;
  caterorId: string;
  experience: number;
  isAvailable: boolean;
  specialization: string;
}

export interface MaharajUpdate {
  email?: string;
  fullname?: string;
  phoneNumber?: string;
  secondaryPhoneNumber?: string;
  username?: string;
  caterorId?: string;
  experience?: number;
  isAvailable?: boolean;
  specialization?: string[];
}

// src/types/staff.ts
export interface Staff {
  id?: string;
  username: string;
  email: string;
  fullname: string;
  phoneNumber: string;
  secondaryPhoneNumber?: string;
  jobTitle: string;
  address: string;
  isAvailable: boolean;
  caterorId: string;
  loginEnabled: boolean;
}

export interface StaffRegister {
  username: string;
  email: string;
  fullname: string;
  password: string;
  phoneNumber: string;
  secondaryPhoneNumber?: string;
  jobTitle: string;
  address: string;
  isAvailable?: boolean;
  caterorId: string;
  loginEnabled?: boolean;
}

export interface StaffUpdate {
  username?: string;
  email?: string;
  fullname?: string;
  phoneNumber?: string;
  secondaryPhoneNumber?: string;
  jobTitle?: string;
  address?: string;
  isAvailable?: boolean;
  caterorId?: string;
  loginEnabled?: boolean;
}

export interface ProcessCreate {
  // languageId: string;
  caterorId: string;
  name: string;
}
export interface TermAndCondition {
  // languageId: string;
  caterorId: string;
  terms: string;
}

export interface PaymentDetailsC {
  caterorId: string; // Add this field
  BankName: string; // Note uppercase B
  AccountNo: string; // Note uppercase A
  AccountHolderName: string;
  IFSC: string;
  upi: string;
  gstin: string;
}
export interface ProcessUpdate {
  name?: string;
}

export interface VendorRegister {
  fullname: string;
  phoneNumber: string;
  category: string;
}

export interface VendorUpdate {
  category: string;
}

// types/utensils.ts

export interface UtensilCategory {
  id: string;
  name: string;
  languageId: string;
}

export interface Utensil {
  data: any;
  id: string;
  name: string;
  categoryId: string;
  languageId: string;
}

export interface UtensilCategoryCreate {
  name: string;
  languageId: string | null;
}

export interface DisposalCategoryCreate {
  name: string;
  languageId: string | null;
}

export interface CRMCreate {
  name: string;
  description?: string;
}

export interface CRMFinilizedCancel {
  eventId: string;
  status: string;
  tentativeAmount?: string;
  cancelReason?: string;
}
export interface EventCRMCreate {
  processId: string;
  note: string;
  followupDate: string;
  imageFile: string;
}

export interface CRMUpdate {
  id: string;
  data: {
    name?: string;
    description?: string;
  };
}

export interface UtensilCategoryUpdate {
  name?: string;
  languageId?: string;
}

export interface UtensilCreate {
  name: string;
  categoryId: string;
  languageId: string;
  inventory: number;
}

export interface UtensilUpdate {
  name?: string;
  categoryId?: string;
  languageId?: string;
}

export interface GetUtensilsParams {
  search?: string;
  page?: number;
  limit?: number;
  languageId?: string;
}

export interface GetUtensilCategoriesParams {
  page?: number;
  limit?: number;
}

export interface Process {
  languageId: string;
  name: string;
  id: string;
}

export interface GetProcessParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  languageId?: string;
}
