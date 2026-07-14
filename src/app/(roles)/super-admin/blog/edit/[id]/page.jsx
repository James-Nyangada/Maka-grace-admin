"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Image as ImageIcon } from "lucide-react"
import dynamic from "next/dynamic"
import { toast } from "sonner"
import axios from "axios"

// Dynamically import react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })
import "react-quill-new/dist/quill.snow.css"

export default function EditBlogPostPage({ params }) {
  const router = useRouter()
  const { id } = use(params)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState("Draft")
  const [coverImage, setCoverImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const API = process.env.NEXT_PUBLIC_API_URL || ""

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (API) {
          const token = typeof window !== 'undefined' ? localStorage.getItem('mg_admin_token') : null;
          const res = await axios.get(`${API}/api/blogs/admin/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setTitle(res.data.title || "")
          setContent(res.data.content || "")
          setStatus(res.data.isPublished ? "Published" : "Draft")
        } else {
          // Mock data fallback
          if (id === "BLG001") {
            setTitle("Top 10 Safari Destinations in 2024")
            setContent("<p>Here are the best destinations...</p>")
            setStatus("Published")
          }
        }
      } catch (err) {
        console.error("Error fetching post:", err)
        toast.error("Failed to load post data")
      } finally {
        setFetching(false)
      }
    }
    fetchPost()
  }, [id, API])

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      formData.append("status", status)
      if (coverImage) {
        formData.append("coverImage", coverImage)
      }

      if (API) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('mg_admin_token') : null;
        await axios.put(`${API}/api/blogs/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      
      toast.success("Blog post updated successfully!")
      router.push("/super-admin/blog")
    } catch (err) {
      console.error("Error updating post:", err)
      toast.error("Failed to update post")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <DashboardLayout><p>Loading...</p></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Edit Post</h1>
          <p className="text-muted-foreground">Modify your existing blog article.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Post Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="title">Post Title</Label>
                  <Input 
                    id="title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition relative">
                  {coverImage ? (
                    <p className="text-sm">{coverImage.name}</p>
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <p className="text-sm">Click to upload new cover image (optional)</p>
                    </>
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageUpload} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <div className="bg-background rounded-md">
                  <ReactQuill 
                    theme="snow" 
                    value={content} 
                    onChange={setContent} 
                    className="mb-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/super-admin/blog")}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Update Post"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
