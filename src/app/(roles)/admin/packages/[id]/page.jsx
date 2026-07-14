"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

export default function EditPackagePage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === "new"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-sm font-medium hover:underline">
          &larr; Back to Packages
        </button>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isNew ? "Create New Package" : `Edit Package: ${params.id}`}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isNew ? "Fill in the details to create a new travel package." : "Modify the existing details of this package."}
        </p>
      </div>
      <div className="rounded-md border bg-card p-6 mt-4 flex items-center justify-center min-h-[400px] text-muted-foreground">
        Form implementation goes here...
      </div>
    </div>
  )
}
