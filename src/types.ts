export type CreatorStatus = 'Selected' | 'Contacted' | 'Followed Up Contact' | 'Negotiating' | 'Active' | 'Completed' | 'Rejected';

export type Platform = 'TikTok' | 'Instagram' | 'YouTube';

export const PLATFORMS: Platform[] = ['Instagram', 'TikTok', 'YouTube'];

export interface PlatformProfile {
  platform: Platform;
  handle: string;
  followers: number;
  avgViews: number;
}

export interface Creator {
  id: string;
  name: string;
  platformProfiles: PlatformProfile[];
  status: CreatorStatus;
  moneySpent: number;
  videosPosted: number;
  totalViewsGenerated: number;
  notes: string;
  avatarUrl?: string;
}

export interface PaymentLog {
  id: string;
  creatorId: string;
  creatorName: string;
  amount: number;
  paymentDate: string;
  videoUrl?: string;
  notes: string;
}
