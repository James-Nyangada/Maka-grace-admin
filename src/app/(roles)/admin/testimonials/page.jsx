"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"

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
  IconTrash,
  IconCheck,
  IconX,
  IconStar
} from "@tabler/icons-react"

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState(null)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const data = await api.testimonials.getAdmin()
      setTestimonials(data || [])
    } catch (error) {
      toast.error(error.message || "Failed to fetch testimonials")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleApprove = async (id, currentStatus) => {
    try {
      const loadingToast = toast.loading(`${currentStatus ? 'Rejecting' : 'Approving'} testimonial...`)
      await api.testimonials.toggleApprove(id)
      toast.dismiss(loadingToast)
      toast.success(`Testimonial successfully ${currentStatus ? 'rejected' : 'approved'}`)
      fetchTestimonials()
    } catch (error) {
      toast.error(error.message || "Failed to toggle testimonial status")
    }
  }

  const handleToggleFeature = async (id, isApproved, currentStatus) => {
    if (!isApproved && !currentStatus) {
      toast.error("You can only feature approved testimonials.")
      return
    }

    try {
      const loadingToast = toast.loading(`${currentStatus ? 'Unfeaturing' : 'Featuring'} testimonial...`)
      await api.testimonials.toggleFeature(id)
      toast.dismiss(loadingToast)
      toast.success(`Testimonial successfully ${currentStatus ? 'unfeatured' : 'featured'}`)
      fetchTestimonials()
    } catch (error) {
      toast.error(error.message || "Failed to toggle feature status")
    }
  }

  const confirmDelete = (testimonial) => {
    setTestimonialToDelete(testimonial)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!testimonialToDelete) return

    try {
      const loadingToast = toast.loading("Deleting testimonial...")
      await api.testimonials.delete(testimonialToDelete._id)
      toast.dismiss(loadingToast)
      toast.success("Testimonial deleted successfully")
      setDeleteDialogOpen(false)
      setTestimonialToDelete(null)
      fetchTestimonials()
    } catch (error) {
      toast.error(error.message || "Failed to delete testimonial")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground text-sm">
            Manage customer reviews and testimonials for your website.
          </p>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading testimonials...
                </TableCell>
              </TableRow>
            ) : testimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No testimonials found.
                </TableCell>
              </TableRow>
            ) : (
              testimonials.map((testimonial) => (
                <TableRow key={testimonial._id} className={!testimonial.isApproved ? "bg-muted/50" : ""}>
                  <TableCell className="font-medium">
                    <div>{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <IconStar className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>{testimonial.rating}/5</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={testimonial.review}>
                    {testimonial.review}
                  </TableCell>
                  <TableCell className="capitalize">{testimonial.platform}</TableCell>
                  <TableCell>
                    <Badge variant={testimonial.isApproved ? "default" : "secondary"}>
                      {testimonial.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={testimonial.isFeatured ? "default" : "outline"} className={testimonial.isFeatured ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}>
                      {testimonial.isFeatured ? "Featured" : "No"}
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
                        <DropdownMenuItem onClick={() => handleToggleApprove(testimonial._id, testimonial.isApproved)}>
                          {testimonial.isApproved ? (
                            <>
                              <IconX className="mr-2 h-4 w-4" />
                              Reject
                            </>
                          ) : (
                            <>
                              <IconCheck className="mr-2 h-4 w-4" />
                              Approve
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleFeature(testimonial._id, testimonial.isApproved, testimonial.isFeatured)}
                          disabled={!testimonial.isApproved && !testimonial.isFeatured}
                        >
                          <IconStar className="mr-2 h-4 w-4" />
                          {testimonial.isFeatured ? 'Unfeature' : 'Feature'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => confirmDelete(testimonial)}
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
              This will permanently delete the testimonial from {testimonialToDelete?.name}.
              This action cannot be undone.
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
