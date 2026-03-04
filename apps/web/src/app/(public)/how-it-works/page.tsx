export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-muted/20 pb-24">
        <div className="bg-primary text-primary-foreground py-16 px-4">
            <div className="container mx-auto text-center max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">How LegalHub Works</h1>
                <p className="text-xl opacity-90">Connecting you with justice, simply and securely.</p>
            </div>
        </div>

        <div className="container mx-auto px-4 max-w-4xl mt-16 space-y-16">
            
            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-5xl font-bold">1</div>
                </div>
                <div className="flex-[2] text-center md:text-left">
                    <h2 className="text-3xl font-bold mb-4">Find The Right Expert</h2>
                    <p className="text-lg text-muted-foreground">Use our powerful search to filter through thousands of verified advocates based on their specialization, location, experience, and consultation fees.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <div className="flex-1 flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-5xl font-bold">2</div>
                </div>
                <div className="flex-[2] text-center md:text-left">
                    <h2 className="text-3xl font-bold mb-4">Book a Consultation</h2>
                    <p className="text-lg text-muted-foreground">View a lawyer&apos;s specific availability and book a time slot that works for you. Securely pay the consultation fee or book a free initial 15-minute intro call if offered.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-5xl font-bold">3</div>
                </div>
                <div className="flex-[2] text-center md:text-left">
                    <h2 className="text-3xl font-bold mb-4">Connect and Resolve</h2>
                    <p className="text-lg text-muted-foreground">Join the secure video call directly through LegalHub. Upload documents securely, chat with your lawyer, and transition consultations into full case management all in one place.</p>
                </div>
            </div>

        </div>
    </div>
  )
}
