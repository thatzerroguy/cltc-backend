export interface SuperAdmin {
  id: string;
  username: string;
  role: string;
  access_token: string;
  refresh_token: string;
  name?: string;
  email?: string;
  department?: string;
  position?: string;
}

export interface Admin {
  id: string;
  username: string;
  role: string;
  access_token: string;
  refresh_token: string;
}

export interface Profile extends Admin {
  name: string;
  email: string;
  department: string;
  position: string;
}
