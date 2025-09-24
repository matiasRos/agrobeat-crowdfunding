import { NextRequest, NextResponse } from 'next/server';
import { CampaignService } from '@/app/lib/services/campaigns';

/**
 * GET /api/campaigns/[id]
 * Obtiene una campaña específica por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de campaña inválido'
        },
        { status: 400 }
      );
    }

    const campaign = await CampaignService.getCampaignById(id);
    
    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campaña no encontrada'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: campaign
    });
    
  } catch (error) {
    console.error('Error fetching campaign:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener la campaña'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/campaigns/[id]
 * Actualiza una campaña específica
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de campaña inválido'
        },
        { status: 400 }
      );
    }

    const campaign = await CampaignService.updateCampaign(id, body);
    
    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campaña no encontrada'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: campaign
    });
    
  } catch (error) {
    console.error('Error updating campaign:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar la campaña'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Desactiva una campaña específica
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de campaña inválido'
        },
        { status: 400 }
      );
    }

    const success = await CampaignService.deleteCampaign(id);
    
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campaña no encontrada'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Campaña desactivada correctamente'
    });
    
  } catch (error) {
    console.error('Error deactivating campaign:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al desactivar la campaña'
      },
      { status: 500 }
    );
  }
}
