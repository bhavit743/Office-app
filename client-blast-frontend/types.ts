export interface Client {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    city?: string;
  }
  
  export interface Group {
    id: number;
    name: string;
    description: string;
    members: Client[];
  }