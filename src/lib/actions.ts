'use server';

import { standardizeAssetNote as standardizeAssetNoteFlow } from '@/ai/flows/asset-note-standardization';
import type { AssetNoteStandardizationInput, AssetNoteStandardizationOutput } from '@/ai/flows/asset-note-standardization';

export async function standardizeAssetNote(
  input: AssetNoteStandardizationInput
): Promise<AssetNoteStandardizationOutput> {
  return standardizeAssetNoteFlow(input);
}
