export interface PopularDomain {
  id: number;
  domain: string;
  searchCount: number;
  generatedCount: number;
  lastUpdated: Date;
}

export interface PopularDomainResponse {
  domain: string;
  popularity: number;
  searchCount: number;
  generatedCount: number;
}