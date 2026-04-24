export type Status = 'New' | 'Waiting' | 'In Progress' | 'Need Review' | 'Done';
export type Priority = 'Low' | 'Medium' | 'High';
export type Category = 
  | 'Produksi'
  | 'RMC'
  | 'Finance'
  | 'Inventory'
  | 'Project'
  | 'Procurement'
  | 'Marketing/Sales'
  | 'Other';

export type Role = 'User' | 'Developer';

export interface Comment {
  id: string;
  text: string;
  sender: Role;
  createdAt: number;
  photoUrls?: string[];
  authorId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: Status;
  priority: Priority;
  createdAt: number;
  ownerId: string;
  photoUrls?: string[];
  comments: Comment[];
  viewedBy?: string[];
}
