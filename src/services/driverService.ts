import { deleteData, getData, postData, putData } from "@/services/api";

export type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";
export interface Driver { name:string; license:string; licenseCategory:string; licenseExpiryDate:string; contactNumber:string; safety:number; status:DriverStatus; }
interface ApiDriver {name:string;license_number:string;license_category:string;license_expiry_date:string;contact_number:string;safety_score:number;status:DriverStatus}
const map=(d:ApiDriver):Driver=>({name:d.name,license:d.license_number,licenseCategory:d.license_category,licenseExpiryDate:d.license_expiry_date,contactNumber:d.contact_number,safety:d.safety_score,status:d.status});
export async function getDrivers(): Promise<Driver[]> { const r=await getData("drivers") as ApiDriver[]; return r.map(map); }
export async function addDriver(d:Driver){return postData("drivers",{name:d.name.trim(),license_number:d.license.trim().toUpperCase(),license_category:d.licenseCategory.trim(),license_expiry_date:d.licenseExpiryDate,contact_number:d.contactNumber.trim(),safety_score:Number(d.safety),status:d.status});}
export async function updateDriver(d:Driver){return putData(`drivers/${encodeURIComponent(d.license)}`,{name:d.name.trim(),license_category:d.licenseCategory.trim(),license_expiry_date:d.licenseExpiryDate,contact_number:d.contactNumber.trim(),safety_score:Number(d.safety),status:d.status});}
export async function deleteDriver(license:string){return deleteData(`drivers/${encodeURIComponent(license)}`);}
