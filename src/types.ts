export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
  password?: string;
  isEmailVerified?: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: string;
  passwordResetCode?: string;
  passwordResetExpires?: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  startDate: string;
  deadline: string;
  status: "Planning" | "In Progress" | "Review" | "Completed";
  progress: number;
  notes: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  status: "Todo" | "In Progress" | "Review" | "Done";
  estimatedDuration: number;
  notes: string;
  checklist: ChecklistItem[];
  createdAt: string;
}

export interface WorkLog {
  id: string;
  userId: string;
  text: string;
  date: string;
  createdAt: string;
}

export interface Report {
  id: string;
  title: string;
  date: string;
  content: string;
  createdAt: string;
}

export interface PortfolioFile {
  name: string;
  url: string;
  type: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  files?: PortfolioFile[];
  date: string;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  projectId: string;
  taskId: string;
  uploadedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  category?: string;
  createdAt: string;
}
