'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <main className="flex h-full flex-col items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-lg text-center">
            <div className="flex justify-center mb-4">
                <AlertTriangle className="h-8 w-8" />
            </div>
            <AlertTitle className="text-2xl font-bold mb-2">Something went wrong!</AlertTitle>
            <AlertDescription className="mb-6">
                An unexpected error has occurred. Please try again.
            </AlertDescription>
            <Button
                onClick={
                // Attempt to recover by trying to re-render the segment
                () => reset()
                }
            >
                Try again
            </Button>
        </Alert>
    </main>
  )
}
