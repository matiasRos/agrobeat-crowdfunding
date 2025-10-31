"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { CampaignResponse } from "@/app/types/campaign";
import { getCurrentCampaignStage, formatCurrency } from "@/lib/utils";
import { PaymentStatusBadge } from "@/app/ui/shared/components";
import Image from "next/image";
import Link from "next/link";

interface MyCampaignCardProps {
  campaign: CampaignResponse;
  userInvestment: {
    id: number;
    amount: string;
    plantCount: number;
    isPaid: boolean;
    createdAt: Date;
  };
}

export function MyCampaignCard({ campaign, userInvestment }: MyCampaignCardProps) {
  const stageInfo = getCurrentCampaignStage(campaign);
  const StageIcon = stageInfo.icon;

  // Animaciones para Framer Motion
  const cardAnimation = {
    hover: {
      scale: 1.02,
      transition: { duration: 0.3 },
    },
  };

  const imageAnimation = {
    hover: {
      scale: 1.15,
      rotate: 5,
      transition: { duration: 0.4 },
    },
  };

  const arrowAnimation = {
    hover: {
      x: 5,
      transition: { duration: 0.3 },
    },
  };

  return (
    <Link href={`/dashboard/my-campaigns/${campaign.id}`}>
      <motion.div
        className="relative flex flex-col justify-between w-full p-6 overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 ease-in-out group hover:shadow-lg bg-card text-card-foreground border"
        variants={cardAnimation}
        whileHover="hover"
      >
        <div className="relative flex flex-col h-full space-y-4">
          {/* Header con título y badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold tracking-tight line-clamp-1">
                {userInvestment.plantCount} plantas de {campaign.crop}
              </h3>
            </div>
            <PaymentStatusBadge isPaid={userInvestment.isPaid} />
          </div>

          {/* Información condensada */}
          <div className="space-y-3">
            {/* Etapa y Ubicación en una línea */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <StageIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="font-medium">{stageInfo.stage}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{campaign.location}</span>
              </div>
            </div>

            {/* Inversión sin container */}
            <div className="pt-1">
              <p className="text-xs text-muted-foreground font-medium">Mi Inversión</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(parseFloat(userInvestment.amount))}
              </p>
            </div>
          </div>

          {/* Link de acción */}
          <div className="mt-auto pt-2">
            <div className="flex items-center text-sm font-semibold group-hover:underline">
              VER SEGUIMIENTO
              <motion.div variants={arrowAnimation}>
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Imagen/Icono animado en la esquina */}
        <motion.div
          className="absolute -right-6 -bottom-6 w-32 h-32 opacity-100 pointer-events-none"
          variants={imageAnimation}
        >
          <Image
            src={campaign.iconUrl || campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-full object-contain"
            width={128}
            height={128}
          />
        </motion.div>
      </motion.div>
    </Link>
  );
}
