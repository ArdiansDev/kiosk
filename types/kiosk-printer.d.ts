export type PrintTicketParams = {
  ticketNumber: string;
  nama: string;
  whatsapp: string;
  keluhan: string;
  badge: string;
  dateText: string;
  timeText: string;
};

export type PrintTicketResult = {
  success: boolean;
  error?: string;
};

declare global {
  interface Window {
    kioskPrinter?: {
      isElectron: boolean;
      printTicket: (params: PrintTicketParams) => Promise<PrintTicketResult>;
    };
  }
}

export {};
