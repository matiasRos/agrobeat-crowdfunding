import { NextRequest, NextResponse } from 'next/server';
import { CampaignService } from '@/app/lib/services/campaigns';
import { CampaignInput } from '@/app/types/campaign';

/**
 * GET /api/campaigns
 * Obtiene todas las campañas activas
 */
export async function GET() {
  try {
    const campaigns = await CampaignService.getAllCampaigns();
    
    return NextResponse.json({
      success: true,
      data: campaigns,
      count: campaigns.length
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener las campañas'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/campaigns
 * Crea una nueva campaña
 */
export async function POST(request: NextRequest) {
  try {
    const body: CampaignInput = await request.json();
    
    // Validaciones básicas
    if (!body.title || !body.description || !body.crop) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan campos requeridos'
        },
        { status: 400 }
      );
    }

    // Transformar los datos para la base de datos
    const campaignData = {
      title: body.title,
      description: body.description,
      crop: body.crop,
      location: body.location,
      targetAmount: body.targetAmount.toString(),
      closingDate: new Date(body.closingDate),
      expectedReturn: body.expectedReturn.toString(),
      riskLevel: body.riskLevel,
      imageUrl: body.imageUrl,
      costPerPlant: body.costPerPlant.toString(),
      plantsPerM2: body.plantsPerM2,
      minPlants: body.minPlants,
      maxPlants: body.maxPlants,
      isActive: true
    };

    const producerData = {
      name: body.producerName,
      experience: body.producerExperience,
      email: body.producerEmail || null,
      phone: body.producerPhone || null,
      location: body.producerLocation || body.location
    };

    const campaign = await CampaignService.createCampaign(campaignData, producerData);
    
    return NextResponse.json({
      success: true,
      data: campaign
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating campaign:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear la campaña'
      },
      { status: 500 }
    );
  }
}
