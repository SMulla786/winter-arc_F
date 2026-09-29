import apiClient from './apiClient';

export interface CalculatedHealthTargets {
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  waterTargetMl: number;
  waterTargetGlasses: number;
  stepTarget: number;
  dailyBudget: number;
}

export const fetchHealthTargets = async (): Promise<CalculatedHealthTargets> => {
  const response: any = await apiClient.get('/profile/targets');
  return response?.data?.targets || {
    calorieTarget: 2000,
    proteinTarget: 130,
    carbsTarget: 220,
    fatTarget: 65,
    waterTargetMl: 2500,
    waterTargetGlasses: 10,
    stepTarget: 10000,
    dailyBudget: 300,
  };
};
