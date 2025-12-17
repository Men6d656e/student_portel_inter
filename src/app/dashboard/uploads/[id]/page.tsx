
export default async function UploadDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Upload Result Details</h1>
            <p className="text-muted-foreground">Details for Upload ID: {id}</p>
            {/* Future Implementation: Show table of student marks in this batch */}
        </div>
    )
}
