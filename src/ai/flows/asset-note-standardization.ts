'use server';
/**
 * @fileOverview An AI assistant for standardizing asset notes and identifying potential issues.
 *
 * - standardizeAssetNote - A function that processes an asset note to standardize its format and suggest improvements.
 * - AssetNoteStandardizationInput - The input type for the standardizeAssetNote function.
 * - AssetNoteStandardizationOutput - The return type for the standardizeAssetNote function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AssetNoteStandardizationInputSchema = z
  .string()
  .describe('The asset note (Catatan) to be analyzed and standardized.');
export type AssetNoteStandardizationInput = z.infer<typeof AssetNoteStandardizationInputSchema>;

const AssetNoteStandardizationOutputSchema = z.object({
  standardizedNote: z
    .string()
    .describe('The suggested standardized format for the asset note.'),
  issuesIdentified: z
    .array(z.string())
    .describe('A list of potential issues or inconsistencies identified in the original note.'),
  suggestions: z
    .array(z.string())
    .describe('Suggestions for follow-up actions or general improvements to the asset note.'),
});
export type AssetNoteStandardizationOutput = z.infer<typeof AssetNoteStandardizationOutputSchema>;

export async function standardizeAssetNote(
  input: AssetNoteStandardizationInput
): Promise<AssetNoteStandardizationOutput> {
  return assetNoteStandardizationFlow(input);
}

const standardizeAssetNotePrompt = ai.definePrompt({
  name: 'standardizeAssetNotePrompt',
  input: { schema: AssetNoteStandardizationInputSchema },
  output: { schema: AssetNoteStandardizationOutputSchema },
  prompt: `You are an AI assistant specialized in KKM asset management.
Your task is to analyze an asset note (Catatan), standardize its format, and identify any potential issues or suggest follow-up actions.

Instructions:
1. Rephrase the given asset note into a clear, concise, and standardized format. Use a consistent structure, for example: "[Date/Time] - [Asset ID/Type] - [Status] - [Description of Observation/Action]."
2. Identify any potential issues, ambiguities, or missing information in the original note. For example, if a serial number is expected but missing, or if the language is unclear.
3. Provide concrete suggestions for follow-up actions or general improvements to make the note more useful for field reporting.

Asset Note to Analyze: "{{{.}}}"`, // Using {{{.}}} to refer to the entire string input
});

const assetNoteStandardizationFlow = ai.defineFlow(
  {
    name: 'assetNoteStandardizationFlow',
    inputSchema: AssetNoteStandardizationInputSchema,
    outputSchema: AssetNoteStandardizationOutputSchema,
  },
  async (input) => {
    const { output } = await standardizeAssetNotePrompt(input);
    if (!output) {
      throw new Error('Failed to standardize asset note.');
    }
    return output;
  }
);
