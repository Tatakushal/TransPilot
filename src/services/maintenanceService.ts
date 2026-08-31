import { getData, postData, putData, deleteData } from './api';

export type MaintenanceRecord = {
  id?: number;
  vehicle_registration: string;
  service_date: string;
  service_type: string;
  cost: number;
  odometer: number;
  workshop: string;
  status: string;
  notes?: string;
};

export const maintenanceService = {
  list: () => getData('maintenance') as Promise<MaintenanceRecord[]>,
  get: (id: number) => getData(`maintenance/${id}`) as Promise<MaintenanceRecord>,
  create: (data: MaintenanceRecord) => postData('maintenance', data) as Promise<MaintenanceRecord>,
  update: (id: number, data: MaintenanceRecord) => putData(`maintenance/${id}`, data) as Promise<MaintenanceRecord>,
  remove: (id: number) => deleteData(`maintenance/${id}`),
};
