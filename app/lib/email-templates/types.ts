// Tipos para los datos de los templates de email

export interface InvestmentConfirmationData {
  userName: string;
  campaignTitle: string;
  plantCount: number;
  formattedAmount: string;
  dashboardUrl: string;
}

export interface AdminNotificationData {
  userName: string;
  userEmail: string;
  campaignTitle: string;
  plantCount: number;
  formattedAmount: string;
}

export interface ReservationConfirmationData {
  userName: string;
  campaignTitle: string;
  plantCount: number;
  formattedAmount: string;
  whatsappLink: string;
  whatsappNumber: string;
}

export interface WelcomeEmailData {
  userName: string;
  dashboardUrl: string;
}

export interface PaymentConfirmationData {
  userName: string;
  campaignTitle: string;
  plantCount: number;
  formattedAmount: string;
  dashboardUrl: string;
}

// Tipo base para todos los templates
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}
