import { CampaignService } from '@/app/lib/services/campaigns';
import { CampaignsAdminTable } from './campaigns-admin-table';

interface CampaignsAdminDataProps {
  page?: number;
  pageSize?: number;
}

export async function CampaignsAdminData({ page = 1, pageSize = 10 }: CampaignsAdminDataProps) {
  const data = await CampaignService.getAllCampaignsAdmin({ page, pageSize });
  
  return (
    <CampaignsAdminTable 
      campaigns={data.campaigns}
      currentPage={data.currentPage}
      totalPages={data.totalPages}
      totalCount={data.totalCount}
    />
  );
}

