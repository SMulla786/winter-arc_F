export type CaterorRegister = {
  username: string;
  email: string;
  fullname: string;
  password: string;
  phoneNumber: string;
  secondaryPhoneNumber?: string;
  address: string;
  plan: string;
  extraUsers: number;
  amount: number;
  renewalAmount?: number;
  languageId: string;
};

// types/language.ts

export interface Language {
  id: string;
  code: string;
  name: string;
}

export interface LanguageCreate {
  code: string;
  name: string;
}

export interface LanguageUpdate {
  code?: string;
  name?: string;
}

// For search and pagination parameters
export interface GetLanguagesParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

// types/utensils.ts

export interface UtensilCategory {
  id: string;
  name: string;
  languageId: string;
}

export interface Utensil {
  id: string;
  name: string;
  categoryId: string;
  languageId: string;
}

export interface UtensilCategoryCreate {
  name: string;
  languageId: string;
}

export interface DisposalCategoryCreate {
  name: string;
  languageId: string;
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

// types/Disposal.ts

export interface DisposalCategory {
  id: string;
  name: string;
  languageId: string;
}

export interface Disposal {
  id: string;
  name: string;
  categoryId: string;
  languageId: string;
}

export interface DisposalCategoryCreate {
  name: string;
  languageId: string;
}

export interface DisposalCategoryUpdate {
  name?: string;
  languageId?: string;
}

export interface DisposalCreate {
  name: string;
  categoryId: string;
  languageId: string;
}

export interface DisposalUpdate {
  name?: string;
  categoryId?: string;
  languageId?: string;
}

export interface GetDisposalParams {
  search?: string;
  page?: number;
  limit?: number;
  languageId?: string;
}

export interface GetDisposalCategoriesParams {
  page?: number;
  limit?: number;
}

// types/Process.ts

export interface Process {
  languageId: string;
  name: string;
  id: string;
}

export interface ProcessCreate {
  languageId: string;
  name: string;
  // process: string;
}

export interface ProcessUpdate {
  code?: string;
  name?: string;
}

// For search and pagination parameters
export interface GetProcessParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  languageId?: string;
}

export interface GetDishCategoriesParams {
  languageId?: string;
}
