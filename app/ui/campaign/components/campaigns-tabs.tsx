"use client";

import { useState } from "react";
import { CampaignResponse } from "@/app/types/campaign";
import { Badge } from "@/components/ui/badge";
import { CampaignCard } from "./campaign-card";

interface CampaignGroup {
  month: string;
  campaigns: CampaignResponse[];
}

interface CampaignsTabsProps {
  campaignsByMonth: CampaignGroup[];
}

export function CampaignsTabs({ campaignsByMonth }: CampaignsTabsProps) {
  if (campaignsByMonth.length === 0) {
    return null;
  }

  // El primer mes es el más reciente (ya ordenado descendente en el Server Component)
  const mostRecentMonth = campaignsByMonth[0].month;

  // Estado para el filtro seleccionado
  const [selectedFilter, setSelectedFilter] = useState(mostRecentMonth);

  // Obtener todas las campañas para el filtro "Todas"
  const allCampaigns = campaignsByMonth.flatMap(group => group.campaigns);

  // Obtener campañas a mostrar según el filtro
  const displayedCampaigns = selectedFilter === "todas" 
    ? allCampaigns 
    : campaignsByMonth.find(group => group.month === selectedFilter)?.campaigns || [];

  return (
    <div className="space-y-6">
      {/* Chips de filtros */}
      <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-md pb-4 pt-2 flex gap-2 overflow-x-auto border-b">
        <Badge
          variant={selectedFilter === "todas" ? "default" : "outline"}
          className={`cursor-pointer whitespace-nowrap px-4 py-2 text-sm rounded-full ${selectedFilter !== "todas" ? "bg-white" : ""}`}
          onClick={() => setSelectedFilter("todas")}
        >
          Todas ({allCampaigns.length})
        </Badge> 
        {campaignsByMonth.map(({ month, campaigns }) => (
          <Badge
            key={month}
            variant={selectedFilter === month ? "default" : "outline"}
            className={`cursor-pointer whitespace-nowrap px-4 py-2 text-sm capitalize rounded-full ${selectedFilter !== month ? "bg-white" : ""}`}
            onClick={() => setSelectedFilter(month)}
          >
            {month} ({campaigns.length})
          </Badge>
        ))}
      </div>

      {/* Grid de campañas filtradas */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {displayedCampaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}

