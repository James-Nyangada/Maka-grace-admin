"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/dashboard-layout"

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
import { Input } from "@/components/ui/input"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  IconDotsVertical,
  IconTrash,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconPlus
} from "@tabler/icons-react"

export default function GalleryPage() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [imageToDelete, setImageToDelete] = useState(null)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addFile, setAddFile] = useState(null)
  const [addCaption, setAddCaption] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [imageToEdit, setImageToEdit] = useState(null)
  const [editCaption, setEditCaption] = useState("")

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const data = await api.gallery.getAll()
      setImages(data || [])
    } catch (error) {
      toast.error(error.message || "Failed to fetch gallery images")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVisibility = async (id) => {
    try {
      const loadingToast = toast.loading("Toggling visibility...")
      await api.gallery.toggleVisibility(id)
      toast.dismiss(loadingToast)
      toast.success("Visibility toggled successfully")
      fetchImages()
    } catch (error) {
      toast.error(error.message || "Failed to toggle visibility")
    }
  }

  const confirmDelete = (image) => {
    setImageToDelete(image)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!imageToDelete) return

    try {
      const loadingToast = toast.loading("Deleting image...")
      await api.gallery.delete(imageToDelete._id)
      toast.dismiss(loadingToast)
      toast.success("Image deleted successfully")
      setDeleteDialogOpen(false)
      setImageToDelete(null)
      fetchImages()
    } catch (error) {
      toast.error(error.message || "Failed to delete image")
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!addFile || !addCaption.trim()) {
      toast.error("Please select an image and enter a caption.")
      return
    }

    try {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append("images", addFile)
      formData.append("caption", addCaption)

      await api.gallery.upload(formData)
      toast.success("Image added successfully")
      setAddDialogOpen(false)
      setAddFile(null)
      setAddCaption("")
      fetchImages()
    } catch (error) {
      toast.error(error.message || "Failed to add image")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (image) => {
    setImageToEdit(image)
    setEditCaption(image.caption)
    setEditDialogOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editCaption.trim()) {
      toast.error("Caption cannot be empty.")
      return
    }

    try {
      setIsSubmitting(true)
      await api.gallery.update(imageToEdit._id, { caption: editCaption })
      toast.success("Image updated successfully")
      setEditDialogOpen(false)
      setImageToEdit(null)
      setEditCaption("")
      fetchImages()
    } catch (error) {
      toast.error(error.message || "Failed to update image")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-row items-center justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
            <p className="text-muted-foreground">Manage your website's gallery images.</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Image
          </Button>
        </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Caption</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Added Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading gallery...
                </TableCell>
              </TableRow>
            ) : images.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No images found. Add one to get started!
                </TableCell>
              </TableRow>
            ) : (
              images.map((image) => (
                <TableRow key={image._id} className={!image.isVisible ? "bg-muted/50" : ""}>
                  <TableCell>
                    <div className="h-16 w-16 overflow-hidden rounded-md border bg-muted">
                      <img
                        src={image.imageUrl}
                        alt={image.caption}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate" title={image.caption}>
                    {image.caption}
                  </TableCell>
                  <TableCell>
                    <Badge variant={image.isVisible ? "default" : "secondary"}>
                      {image.isVisible ? "Visible" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(image.createdAt).toLocaleDateString()}
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
                        <DropdownMenuItem onClick={() => openEditDialog(image)}>
                          <IconEdit className="mr-2 h-4 w-4" />
                          Edit Text
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleVisibility(image._id)}>
                          {image.isVisible ? (
                            <>
                              <IconEyeOff className="mr-2 h-4 w-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <IconEye className="mr-2 h-4 w-4" />
                              Show
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => confirmDelete(image)}
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

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Gallery Image</DialogTitle>
            <DialogDescription>
              Upload an image and provide a small information text (caption).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image File</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setAddFile(e.target.files[0])}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Caption</label>
              <Input
                placeholder="Enter caption..."
                value={addCaption}
                onChange={(e) => setAddCaption(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Uploading..." : "Add Image"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Gallery Image</DialogTitle>
            <DialogDescription>
              Update the information text for this image.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Caption</label>
              <Input
                placeholder="Enter caption..."
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this gallery image.
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
    </DashboardLayout>
  )
}
