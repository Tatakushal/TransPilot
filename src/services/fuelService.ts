import { getData, postData, putData, deleteData } from './api';

export type FuelRecord = {
  id?: number;
  vehicle_registration: string;
  fuel_date: string;
  liters: number;
  cost: number;
  odometer: number;
  station: string;
  notes?: string;
};

export const fuelService = {
  list: () => getData('fuel') as Promise<FuelRecord[]>,
  get: (id: number) => getData(`fuel/${id}`) as Promise<FuelRecord>,
  create: (data: FuelRecord) => postData('fuel', data) as Promise<FuelRecord>,
  update: (id: number, data: FuelRecord) => putData(`fuel/${id}`, data) as Promise<FuelRecord>,
  remove: (id: number) => deleteData(`fuel/${id}`),
};
