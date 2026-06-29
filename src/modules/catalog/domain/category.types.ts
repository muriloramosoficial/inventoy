export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  deleted_at?: string | null;
}
