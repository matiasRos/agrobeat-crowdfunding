import { CampaignService } from '@/app/lib/services/campaigns';
import { InvestorsTable } from './investors-table';

interface InvestorsDataProps {
  page?: number;
  pageSize?: number;
}

export async function InvestorsData({ page = 1, pageSize = 10 }: InvestorsDataProps) {
  const data = await CampaignService.getAllInvestors({ page, pageSize });
  
  return (
    <InvestorsTable 
      investors={data.investors}
      currentPage={data.currentPage}
      totalPages={data.totalPages}
      totalCount={data.totalCount}
    />
  );
}
