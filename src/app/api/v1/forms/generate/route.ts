
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import clientPromise from '@/lib/mongodb';
import { randomBytes } from 'crypto';

const generateFormSchema = z.object({
  partner_id: z.number().int().positive(),
  region_code: z.enum(['MLD', 'KSI', 'BGM', 'NRK']), // Example region codes
  form_type: z.enum(['GEN', 'BZ', 'HS']), // General, Business, Hustle
});

/**
 * @swagger
 * /api/v1/forms/generate:
 *   post:
 *     summary: Generate a new unique form number
 *     description: Creates a new, unique form number based on partner, region, and form type. It ensures the number is unique in the database.
 *     tags:
 *       - Forms
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               partner_id:
 *                 type: integer
 *                 description: The ID of the partner requesting the form.
 *                 example: 25
 *               region_code:
 *                 type: string
 *                 description: A code representing the partner's region.
 *                 enum: [MLD, KSI, BGM, NRK]
 *                 example: MLD
 *               form_type:
 *                 type: string
 *                 description: The type of form being generated.
 *                 enum: [GEN, BZ, HS]
 *                 example: GEN
 *     responses:
 *       200:
 *         description: Successfully generated a unique form number.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 formNumber:
 *                   type: string
 *                   example: "P-25-MLD-GEN-A1B2C3D4"
 *       400:
 *         description: Bad Request. Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = generateFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const { partner_id, region_code, form_type } = validation.data;
    
    const client = await clientPromise;
    const db = client.db("oriango");
    const loansCollection = db.collection('loans');
    
    let formNumber: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
        const uniquePart = randomBytes(4).toString('hex').toUpperCase();
        formNumber = `P-${partner_id}-${region_code}-${form_type}-${uniquePart}`;
        
        const existingLoan = await loansCollection.findOne({ formNumber });
        if (!existingLoan) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        return NextResponse.json({ error: 'Failed to generate a unique form number after multiple attempts.' }, { status: 500 });
    }

    // @ts-ignore
    return NextResponse.json({ formNumber }, { status: 200 });

  } catch (error) {
    console.error("Form generation error:", error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
