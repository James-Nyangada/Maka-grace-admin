"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconBan,
  IconCheck,
  IconPlus,
} from "@tabler/icons-react"

export default function PackagesPage() {
  const router = useRouter()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState(null)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const data = await api.packages.getAdminAll({ limit: 100 })
      setPackages(data.packages || [])
    } catch (error) {
      toast.error(error.message || "Failed to fetch packages")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const loadingToast = toast.loading(`${currentStatus ? 'Suspending' : 'Activating'} package...`)
      await api.packages.toggleActive(id)
      toast.dismiss(loadingToast)
      toast.success(`Package successfully ${currentStatus ? 'suspended' : 'activated'}`)
      fetchPackages()
    } catch (error) {
      toast.error(error.message || "Failed to toggle package status")
    }
  }

  const confirmDelete = (pkg) => {
    setPackageToDelete(pkg)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!packageToDelete) return

    try {
      const loadingToast = toast.loading("Deleting package...")
      await api.packages.delete(packageToDelete._id)
      toast.dismiss(loadingToast)
      toast.success("Package deleted successfully")
      setDeleteDialogOpen(false)
      setPackageToDelete(null)
      fetchPackages()
    } catch (error) {
      toast.error(error.message || "Failed to delete package")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Packages</h1>
          <p className="text-muted-foreground text-sm">
            Manage your travel packages and their visibility.
          </p>
        </div>
        <Button onClick={() => router.push("/admin/packages/new")}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Package
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading packages...
                </TableCell>
              </TableRow>
            ) : packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No packages found.
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => (
                <TableRow key={pkg._id} className={!pkg.isActive ? "bg-muted/50" : ""}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.category}</TableCell>
                  <TableCell>{pkg.destination}</TableCell>
                  <TableCell>{pkg.currency} {pkg.priceFrom}</TableCell>
                  <TableCell>
                    <Badge variant={pkg.isDraft ? "warning" : (pkg.isActive ? "default" : "secondary")}>
                      {pkg.isDraft ? "Draft" : (pkg.isActive ? "Active" : "Suspended")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <IconDotsVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/packages/${pkg._id}`)}>
                          <IconEdit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(pkg._id, pkg.isActive)}>
                          {pkg.isActive ? (
                            <>
                              <IconBan className="mr-2 h-4 w-4" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <IconCheck className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => confirmDelete(pkg)}
                        >
                          <IconTrash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the package "{packageToDelete?.name}" from your active list.
              Booking history associated with this package will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
