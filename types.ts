export enum PropertyType {
  APARTMENT = 'Apartamento',
  HOUSE = 'Casa',
}

export enum AnalysisStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PropertyInput {
  id?: string;
  userInfo: UserInfo;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  sizeM2: number;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  propertyType: PropertyType;
  ageYears: number;
  condition: string; 
}

export interface FinancialMetrics {
  roi: number; // Percentage
  capRate: number; // Percentage
  monthlyCashflow: number;
  estimatedRenovationCost: number;
  suggestedOfferPrice: number;
  appreciationForecast: number; // Percentage
}

export interface MarketDataPoint {
  label: string;
  value: number;
}

export interface MarketAnalysis {
  priceEvolution: MarketDataPoint[]; // e.g., Year vs Price/m2
  similarListings: MarketDataPoint[]; // e.g., "Same Zone", "Similar Price", "Similar Size" counts
}

export interface AnalysisReport {
  id: string;
  propertyId: string;
  htmlContent: string; // Changed from markdown to HTML
  metrics: FinancialMetrics;
  marketData: MarketAnalysis; // New field for charts
  viabilityScore: number; // 0-100
  recommendation: 'BUY' | 'HOLD' | 'PASS';
  createdAt: string;
}

export interface PropertyRecord extends PropertyInput {
  id: string;
  userId: string;
  createdAt: string;
  report?: AnalysisReport;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}
