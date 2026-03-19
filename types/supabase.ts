export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "in_progress"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type DeliveryStatus = "pending" | "dispatched" | "delivered" | "failed";
export type InvoiceStatus = "unpaid" | "partial" | "paid";
export type PaymentMethod = "cash" | "transfer" | "pos" | "card" | "other";
export type GeneratedDocumentType = "invoice" | "receipt";
export type GeneratedDocumentUploadStatus =
  | "uploaded"
  | "local_only"
  | "failed";
export type DocumentGenerationGrant = "free_quota" | "subscription";

export type Database = {
  public: {
    Tables: {
      business_profiles: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          business_category: string;
          logo_url: string | null;
          phone: string | null;
          default_currency: string;
          invoice_prefix: string;
          business_address: string | null;
          bank_details: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          business_category: string;
          logo_url?: string | null;
          phone?: string | null;
          default_currency?: string;
          invoice_prefix?: string;
          business_address?: string | null;
          bank_details?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          business_category?: string;
          logo_url?: string | null;
          phone?: string | null;
          default_currency?: string;
          invoice_prefix?: string;
          business_address?: string | null;
          bank_details?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          user_id: string;
          business_profile_id: string;
          full_name: string;
          phone: string;
          email: string | null;
          address: string | null;
          landmark: string | null;
          notes: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_profile_id: string;
          full_name: string;
          phone: string;
          email?: string | null;
          address?: string | null;
          landmark?: string | null;
          notes?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_profile_id?: string;
          full_name?: string;
          phone?: string;
          email?: string | null;
          address?: string | null;
          landmark?: string | null;
          notes?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          business_profile_id: string;
          name: string;
          sku: string | null;
          price: number;
          category: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_profile_id: string;
          name: string;
          sku?: string | null;
          price: number;
          category?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_profile_id?: string;
          name?: string;
          sku?: string | null;
          price?: number;
          category?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          business_profile_id: string;
          customer_id: string | null;
          order_number: string;
          status: OrderStatus;
          delivery_status: DeliveryStatus;
          due_at: string | null;
          discount: number;
          delivery_fee: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_profile_id: string;
          customer_id?: string | null;
          order_number: string;
          status: OrderStatus;
          delivery_status?: DeliveryStatus;
          due_at?: string | null;
          discount?: number;
          delivery_fee?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_profile_id?: string;
          customer_id?: string | null;
          order_number?: string;
          status?: OrderStatus;
          delivery_status?: DeliveryStatus;
          due_at?: string | null;
          discount?: number;
          delivery_fee?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          user_id: string;
          order_id: string;
          product_id: string | null;
          name: string;
          quantity: number;
          unit_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_id: string;
          product_id?: string | null;
          name: string;
          quantity: number;
          unit_price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_id?: string;
          product_id?: string | null;
          name?: string;
          quantity?: number;
          unit_price?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          order_id: string;
          invoice_number: string;
          status: InvoiceStatus;
          issued_at: string;
          due_at: string | null;
          share_channel: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_id: string;
          invoice_number: string;
          status?: InvoiceStatus;
          issued_at?: string;
          due_at?: string | null;
          share_channel?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_id?: string;
          invoice_number?: string;
          status?: InvoiceStatus;
          issued_at?: string;
          due_at?: string | null;
          share_channel?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          business_profile_id: string;
          order_id: string;
          invoice_id: string | null;
          amount: number;
          method: PaymentMethod;
          reference: string | null;
          note: string | null;
          recorded_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_profile_id: string;
          order_id: string;
          invoice_id?: string | null;
          amount: number;
          method: PaymentMethod;
          reference?: string | null;
          note?: string | null;
          recorded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_profile_id?: string;
          order_id?: string;
          invoice_id?: string | null;
          amount?: number;
          method?: PaymentMethod;
          reference?: string | null;
          note?: string | null;
          recorded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      generated_documents: {
        Row: {
          id: string;
          user_id: string;
          business_profile_id: string;
          order_id: string | null;
          invoice_id: string | null;
          payment_id: string | null;
          type: GeneratedDocumentType;
          document_number: string;
          file_name: string;
          mime_type: string;
          storage_path: string | null;
          upload_status: GeneratedDocumentUploadStatus;
          snapshot: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_profile_id: string;
          order_id?: string | null;
          invoice_id?: string | null;
          payment_id?: string | null;
          type: GeneratedDocumentType;
          document_number: string;
          file_name: string;
          mime_type?: string;
          storage_path?: string | null;
          upload_status?: GeneratedDocumentUploadStatus;
          snapshot?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_profile_id?: string;
          order_id?: string | null;
          invoice_id?: string | null;
          payment_id?: string | null;
          type?: GeneratedDocumentType;
          document_number?: string;
          file_name?: string;
          mime_type?: string;
          storage_path?: string | null;
          upload_status?: GeneratedDocumentUploadStatus;
          snapshot?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      document_generation_events: {
        Row: {
          id: string;
          user_id: string;
          business_profile_id: string;
          document_id: string | null;
          document_type: GeneratedDocumentType;
          granted_by: DocumentGenerationGrant;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_profile_id: string;
          document_id?: string | null;
          document_type: GeneratedDocumentType;
          granted_by: DocumentGenerationGrant;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_profile_id?: string;
          document_id?: string | null;
          document_type?: GeneratedDocumentType;
          granted_by?: DocumentGenerationGrant;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type BusinessProfileRow =
  Database["public"]["Tables"]["business_profiles"]["Row"];
export type BusinessProfileInsert =
  Database["public"]["Tables"]["business_profiles"]["Insert"];
export type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
export type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
export type GeneratedDocumentRow =
  Database["public"]["Tables"]["generated_documents"]["Row"];
export type GeneratedDocumentInsert =
  Database["public"]["Tables"]["generated_documents"]["Insert"];
export type DocumentGenerationEventRow =
  Database["public"]["Tables"]["document_generation_events"]["Row"];
