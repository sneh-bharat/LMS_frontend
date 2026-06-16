export interface Appointment {
  id: number;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  consultingType: string;
  department: string;
  selectedTest: string;
  slot: string;
  date: string;
  email: string;
  whatsapp: string;
  permanentAddress: string;
  localAddress: string;
  pincode: string;
  city: string;
  country: string;
  contactNumber: string;
  doctor?: string;
}

export interface FormState {
  consultingType: string;
  department: string;
  doctor: string;
  slot: string;
  date: string;
  patientName: string;
  age: string;
  gender: string;
  phone: string;
  permanentAddress: string;
  localAddress: string;
  pincode: string;
  city: string;
  country: string;
  email: string;
  whatsapp: string;
  contactNumber: string;
  selectedTest: string;
}

export interface TestInfo {
  name: string;
  fee: number;
}
