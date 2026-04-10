export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      donations: {
        Row: {
          id:               string;
          title:            string;
          description:      string | null;
          quantity:         string;
          category:         'FOOD' | 'CLOTHES' | 'BOOKS';
          item_type:        string;
          expires_at:       string | null;
          status:           'AVAILABLE' | 'CLAIMED' | 'COLLECTED';
          address:          string;
          city:             string;
          donor_name:       string;
          donor_type:       'Individual' | 'Business' | 'NGO' | 'Institution';
          phone:            string;
          donor_telegram:   string | null;
          photo_url:        string | null;
          created_at:       string;
          updated_at:       string;
        };
        Insert: Omit<Database['public']['Tables']['donations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['donations']['Insert']>;
      };
      claims: {
        Row: {
          id:                   string;
          donation_id:          string;
          receiver_name:        string;
          receiver_phone:       string;
          receiver_telegram:    string;
          otp:                  string;
          donor_otp:            string;
          receiver_confirmed:   boolean;
          donor_confirmed:      boolean;
          status:               'PENDING' | 'VERIFIED' | 'EXPIRED';
          expires_at:           string;
          created_at:           string;
        };
        Insert: Omit<Database['public']['Tables']['claims']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['claims']['Insert']>;
      };
      ngo_registrations: {
        Row: {
          id:               string;
          org_name:         string;
          reg_number:       string;
          year_established: number;
          focus_area:       string;
          operating_area:   string;
          address:          string;
          website:          string | null;
          receiver_name:    string;
          designation:      string;
          whatsapp:         string;
          alternate_phone:  string | null;
          email:            string;
          id_type:          string;
          id_number:        string;
          status:           'PENDING' | 'APPROVED' | 'REJECTED';
          created_at:       string;
        };
        Insert: Omit<Database['public']['Tables']['ngo_registrations']['Row'], 'id' | 'created_at' | 'status'>;
        Update: Partial<Database['public']['Tables']['ngo_registrations']['Insert']>;
      };
    };
  };
};

export type DonationRow        = Database['public']['Tables']['donations']['Row'];
export type ClaimRow           = Database['public']['Tables']['claims']['Row'];
export type NGORegistrationRow = Database['public']['Tables']['ngo_registrations']['Row'];
