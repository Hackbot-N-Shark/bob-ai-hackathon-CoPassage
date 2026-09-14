export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "city_staff" | "super_admin";
export type EscalationStatus = "open" | "in_progress" | "resolved" | "closed";
export type EscalationPriority = "low" | "medium" | "high" | "critical";
export type SOSAlertStatus = "active" | "resolved" | "false_alarm";
export type RideOfferStatus = "active" | "full" | "completed" | "cancelled";
export type RideRequestStatus = "pending" | "accepted" | "rejected" | "cancelled";
export type MatchStatus = "pending" | "active" | "completed" | "cancelled";
export type BroadcastStatus = "active" | "matched" | "cancelled";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          role: UserRole;
          assigned_city: string | null;
          is_driver_verified: boolean;
          force_password_change: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          assigned_city?: string | null;
          is_driver_verified?: boolean;
          force_password_change?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          assigned_city?: string | null;
          is_driver_verified?: boolean;
          force_password_change?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      escalations: {
        Row: {
          id: string;
          ticket_ref: string;
          city: string;
          reported_by: string | null;
          assigned_to: string | null;
          status: EscalationStatus;
          priority: EscalationPriority;
          subject: string;
          description: string | null;
          resolution_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_ref: string;
          city: string;
          reported_by?: string | null;
          assigned_to?: string | null;
          status?: EscalationStatus;
          priority?: EscalationPriority;
          subject: string;
          description?: string | null;
          resolution_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_ref?: string;
          city?: string;
          reported_by?: string | null;
          assigned_to?: string | null;
          status?: EscalationStatus;
          priority?: EscalationPriority;
          subject?: string;
          description?: string | null;
          resolution_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "escalations_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "escalations_reported_by_fkey";
            columns: ["reported_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      sos_alerts: {
        Row: {
          id: string;
          user_id: string;
          city: string;
          location_lat: number | null;
          location_lng: number | null;
          status: string;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          city: string;
          location_lat?: number | null;
          location_lng?: number | null;
          status?: string;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          city?: string;
          location_lat?: number | null;
          location_lng?: number | null;
          status?: string;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sos_alerts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sos_alerts_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      vehicles: {
        Row: {
          id: string;
          owner_id: string;
          make: string;
          model: string;
          year: number;
          color: string;
          license_plate: string;
          capacity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          make: string;
          model: string;
          year: number;
          color: string;
          license_plate: string;
          capacity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          make?: string;
          model?: string;
          year?: number;
          color?: string;
          license_plate?: string;
          capacity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vehicles_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      ride_offers: {
        Row: {
          id: string;
          driver_id: string;
          vehicle_id: string;
          city: string;
          origin: string;
          origin_lat: number | null;
          origin_lng: number | null;
          destination: string;
          dest_lat: number | null;
          dest_lng: number | null;
          departure_time: string;
          total_seats: number;
          available_seats: number;
          price_per_seat: number;
          status: RideOfferStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          vehicle_id: string;
          city: string;
          origin: string;
          origin_lat?: number | null;
          origin_lng?: number | null;
          destination: string;
          dest_lat?: number | null;
          dest_lng?: number | null;
          departure_time: string;
          total_seats: number;
          available_seats: number;
          price_per_seat: number;
          status?: RideOfferStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          driver_id?: string;
          vehicle_id?: string;
          city?: string;
          origin?: string;
          origin_lat?: number | null;
          origin_lng?: number | null;
          destination?: string;
          dest_lat?: number | null;
          dest_lng?: number | null;
          departure_time?: string;
          total_seats?: number;
          available_seats?: number;
          price_per_seat?: number;
          status?: RideOfferStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ride_offers_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ride_offers_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          }
        ];
      };
      ride_requests: {
        Row: {
          id: string;
          offer_id: string;
          rider_id: string;
          seats_requested: number;
          status: RideRequestStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          rider_id: string;
          seats_requested?: number;
          status?: RideRequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          offer_id?: string;
          rider_id?: string;
          seats_requested?: number;
          status?: RideRequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ride_requests_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "ride_offers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ride_requests_rider_id_fkey";
            columns: ["rider_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      matches: {
        Row: {
          id: string;
          match_ref: string;
          city: string;
          driver_id: string | null;
          rider_id: string | null;
          offer_id: string | null;
          request_id: string | null;
          status: MatchStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_ref: string;
          city: string;
          driver_id?: string | null;
          rider_id?: string | null;
          offer_id?: string | null;
          request_id?: string | null;
          status?: MatchStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_ref?: string;
          city?: string;
          driver_id?: string | null;
          rider_id?: string | null;
          offer_id?: string | null;
          request_id?: string | null;
          status?: MatchStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_rider_id_fkey";
            columns: ["rider_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "ride_offers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "ride_requests";
            referencedColumns: ["id"];
          }
        ];
      };
      ride_broadcasts: {
        Row: {
          id: string;
          passenger_id: string;
          city: string;
          origin: string;
          origin_lat: number | null;
          origin_lng: number | null;
          destination: string;
          dest_lat: number | null;
          dest_lng: number | null;
          departure_time: string;
          seats_needed: number;
          status: BroadcastStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          passenger_id: string;
          city: string;
          origin: string;
          origin_lat?: number | null;
          origin_lng?: number | null;
          destination: string;
          dest_lat?: number | null;
          dest_lng?: number | null;
          departure_time: string;
          seats_needed?: number;
          status?: BroadcastStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          passenger_id?: string;
          city?: string;
          origin?: string;
          origin_lat?: number | null;
          origin_lng?: number | null;
          destination?: string;
          dest_lat?: number | null;
          dest_lng?: number | null;
          departure_time?: string;
          seats_needed?: number;
          status?: BroadcastStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ride_broadcasts_passenger_id_fkey";
            columns: ["passenger_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          id: string;
          transaction_ref: string;
          match_id: string | null;
          amount: number;
          currency: string;
          status: PaymentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          transaction_ref: string;
          match_id?: string | null;
          amount: number;
          currency?: string;
          status?: PaymentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          transaction_ref?: string;
          match_id?: string | null;
          amount?: number;
          currency?: string;
          status?: PaymentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      escalation_status: EscalationStatus;
      escalation_priority: EscalationPriority;
      sos_alert_status: SOSAlertStatus;
    };
  };
}
