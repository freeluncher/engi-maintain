export type AssetStatus = 'Operational' | 'UnderMaintenance' | 'Breakdown' | 'Retired';

export interface Asset {
  id: string;
  name: string;
  category?: string;
  location?: string;
  brand?: string;
  serialNumber?: string;
  status: AssetStatus;
}

export interface AssetsApiResponse {
  data: Asset[];
}