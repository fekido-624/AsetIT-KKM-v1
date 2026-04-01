'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { standardizeAssetNote } from '@/lib/actions';
import type { AssetNoteStandardizationOutput } from '@/ai/flows/asset-note-standardization';
import { Loader2, Wand2, Lightbulb, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface AssetNoteAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  note: string;
  onNoteUpdate: (newNote: string) => void;
}

export function AssetNoteAssistant({ isOpen, onClose, note, onNoteUpdate }: AssetNoteAssistantProps) {
  const [currentNote, setCurrentNote] = useState(note);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AssetNoteStandardizationOutput | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!currentNote.trim()) {
      toast({
        variant: 'destructive',
        title: 'Note is empty',
        description: 'Please enter a note to analyze.',
      });
      return;
    }
    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await standardizeAssetNote(currentNote);
      setAnalysis(result);
      toast({
        title: 'Analysis Complete',
        description: 'AI assistant has provided suggestions.',
      });
    } catch (error) {
      console.error('Failed to analyze note:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not connect to the AI assistant.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUseSuggestion = (suggestedNote: string) => {
    setCurrentNote(suggestedNote);
    onNoteUpdate(suggestedNote);
    toast({
        title: "Suggestion Applied",
        description: "The standardized note has been applied to the text area."
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Wand2 className="text-primary" />
            Asset Note Assistant
          </DialogTitle>
          <DialogDescription>
            Use AI to standardize notes, identify issues, and get suggestions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-grow p-1">
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">Original Note</h3>
            <Textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Enter asset note here..."
              className="flex-grow min-h-[200px]"
            />
             <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Wand2 className="mr-2 h-4 w-4" /> Analyze Note</>
              )}
            </Button>
          </div>
          <div className="flex flex-col gap-4">
             <h3 className="font-semibold">AI Analysis</h3>
             <div className="border rounded-lg p-4 bg-muted/50 flex-grow min-h-[200px] overflow-y-auto">
                {!analysis && !isLoading && (
                    <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                        Click "Analyze Note" to see AI suggestions.
                    </div>
                )}
                {isLoading && (
                     <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                {analysis && (
                    <div className="space-y-4">
                        <Card>
                             <CardHeader className='p-4'>
                                <CardTitle className="text-md flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary"/> Standardized Note
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='p-4 pt-0'>
                                <p className="text-sm">{analysis.standardizedNote}</p>
                                <Button size="sm" variant="outline" className="mt-2" onClick={() => handleUseSuggestion(analysis.standardizedNote)}>
                                    Use this version
                                </Button>
                            </CardContent>
                        </Card>
                        {analysis.issuesIdentified.length > 0 && (
                             <Card>
                                <CardHeader className='p-4'>
                                    <CardTitle className="text-md flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-destructive"/> Issues Identified
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='p-4 pt-0'>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        {analysis.issuesIdentified.map((issue, i) => <li key={i}>{issue}</li>)}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                        {analysis.suggestions.length > 0 && (
                            <Card>
                                <CardHeader className='p-4'>
                                    <CardTitle className="text-md flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-yellow-500"/> Suggestions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='p-4 pt-0'>
                                     <ul className="list-disc pl-5 space-y-1 text-sm">
                                        {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
             </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
