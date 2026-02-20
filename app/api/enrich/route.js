import { performFullEnrichment } from '@/lib/gemini';
import { mockCompanies } from '@/lib/mockData';

export async function POST(request) {
  try {
    const body = await request.json();
    const { companyId, website, name, description, industry, founded, employees } = body;

    // Find company from mock data or use provided data
    let company = null;
    
    if (companyId) {
      company = mockCompanies.find(c => c.id === parseInt(companyId));
    }
    
    if (!company) {
      // Use provided data
      company = {
        name: name || 'Unknown Company',
        website: website || '',
        description: description || '',
        industry: industry || '',
        founded: founded || '',
        employees: employees || '',
      };
    }

    if (!company.website && !website) {
      return Response.json(
        { success: false, error: 'Website URL is required for enrichment' },
        { status: 400 }
      );
    }

    // Use provided website if company website is not set
    if (website && !company.website) {
      company.website = website;
    }

    console.log(`[API] Enriching company: ${company.name}`);
    
    // Perform enrichment with Gemini AI
    const enrichmentData = await performFullEnrichment(company);

    return Response.json({
      success: true,
      data: enrichmentData,
      company: {
        id: companyId || null,
        name: company.name,
        website: company.website,
      },
    });
  } catch (error) {
    console.error('[API] Enrichment error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
