import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function RegisterPicker() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Join LegalHub</CardTitle>
          <CardDescription className="text-lg">Are you looking for legal help, or offering it?</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row justify-center mt-4">
          <Link href="/register/client" className="flex-1">
            <Button size="lg" className="w-full h-32 flex flex-col items-center justify-center gap-2 text-lg">
              <span>👤</span>
              I am a Client
              <span className="text-sm font-normal text-muted-foreground opacity-80">Looking for a lawyer</span>
            </Button>
          </Link>
          <Link href="/register/lawyer" className="flex-1">
            <Button size="lg" variant="outline" className="w-full h-32 flex flex-col items-center justify-center gap-2 text-lg border-2">
              <span>⚖️</span>
              I am a Lawyer
              <span className="text-sm font-normal text-muted-foreground opacity-80">Offering legal services</span>
            </Button>
          </Link>
        </CardContent>
        <div className="text-center mt-6 mb-4">
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
