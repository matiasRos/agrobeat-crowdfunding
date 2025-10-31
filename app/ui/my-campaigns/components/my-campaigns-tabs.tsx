"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MyCampaignCard } from "./my-campaign-card";

interface Investment {
  campaign: any;
  id: number;
  amount: string;
  plantCount: number;
  isPaid: boolean;
  createdAt: Date;
}

interface InvestmentGroup {
  month: string;
  investments: Investment[];
}

interface MyCampaignsTabsProps {
  investmentsByMonth: InvestmentGroup[];
}

export function MyCampaignsTabs({ investmentsByMonth }: MyCampaignsTabsProps) {
  if (investmentsByMonth.length === 0) {
    return null;
  }

  // El primer mes es el más reciente (ya ordenado descendente en el Server Component)
  const mostRecentMonth = investmentsByMonth[0].month;

  // Estado para el filtro seleccionado
  const [selectedFilter, setSelectedFilter] = useState(mostRecentMonth);

  // Obtener todas las inversiones para el filtro "Todas"
  const allInvestments = investmentsByMonth.flatMap(group => group.investments);

  // Obtener inversiones a mostrar según el filtro
  const displayedInvestments = selectedFilter === "todas" 
    ? allInvestments 
    : investmentsByMonth.find(group => group.month === selectedFilter)?.investments || [];

  return (
    <div className="space-y-6">
      {/* Chips de filtros */}
      <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-md pb-4 pt-2 flex gap-2 overflow-x-auto border-b">
        <Badge
          variant={selectedFilter === "todas" ? "default" : "outline"}
          className={`cursor-pointer whitespace-nowrap px-4 py-2 text-sm rounded-full ${selectedFilter !== "todas" ? "bg-white" : ""}`}
          onClick={() => setSelectedFilter("todas")}
        >
          Todas ({allInvestments.length})
        </Badge>
        {investmentsByMonth.map(({ month, investments }) => (
          <Badge
            key={month}
            variant={selectedFilter === month ? "default" : "outline"}
            className={`cursor-pointer whitespace-nowrap px-4 py-2 text-sm capitalize rounded-full ${selectedFilter !== month ? "bg-white" : ""}`}
            onClick={() => setSelectedFilter(month)}
          >
            {month} ({investments.length})
          </Badge>
        ))}
      </div>

      {/* Grid de inversiones filtradas */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {displayedInvestments.map((investment) => (
          <MyCampaignCard
            key={investment.campaign.id}
            campaign={investment.campaign}
            userInvestment={{
              id: investment.id,
              amount: investment.amount,
              plantCount: investment.plantCount,
              isPaid: investment.isPaid,
              createdAt: investment.createdAt,
            }}
          />
        ))}
      </div>
    </div>
  );
}

