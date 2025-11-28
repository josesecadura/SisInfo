import { Skeleton } from "@/components/ui/skeleton"

interface CommentSkeletonProps {
    showPoster?: boolean
}

export function CommentSkeleton({ showPoster = true }: CommentSkeletonProps) {
    return (
        <div className="flex gap-4 p-4 rounded-xl border-2 border-primary/30 bg-card">
            {showPoster && (
                <Skeleton className="w-20 md:w-24 h-28 md:h-36 shrink-0 rounded-lg" />
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="w-12 h-8 rounded-full" />
                </div>
            </div>
        </div>
    )
}