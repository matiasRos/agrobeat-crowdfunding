import { CampaignService } from '@/app/lib/services/campaigns';
import { InvestorsTable } from './investors-table';

export async function InvestorsData() {
  const investors = await CampaignService.getAllInvestors();
  
  return <InvestorsTable investors={investors} />;
}
