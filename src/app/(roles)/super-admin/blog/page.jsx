"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Trash2, Plus, FileText, Calendar, Eye } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

export default function BlogPostsPage() {
  const [posts, setPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const API = process.env.NEXT_PUBLIC_API_URL || ""

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (API) {
          const token = typeof window !== 'undefined' ? localStorage.getItem('mg_admin_token') : null;
          const res = await axios.get(`${API}/api/blogs/admin/all`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const fetchedPosts = (res.data.blogs || []).map(post => ({
            ...post,
            status: post.isPublished ? "Published" : "Draft"
          }))
          setPosts(fetchedPosts)
        } else {
          // Mock data
          setPosts([
            {
              _id: "BLG001",
              title: "Top 10 Safari Destinations in 2024",
              author: "Admin",
              status: "Published",
              createdAt: "2024-03-10",
              views: 1250,
            },
            {
              _id: "BLG002",
              title: "What to pack for a beach holiday",
              author: "Admin",
              status: "Draft",
              createdAt: "2024-04-05",
              views: 0,
            }
          ])
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error)
      }
    }
    fetchPosts()
  }, [])

  const deletePost = async (postId) => {
    try {
      if (API) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('mg_admin_token') : null;
        await axios.delete(`${API}/api/blogs/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setPosts(posts.filter((p) => p._id !== postId))
      toast.success("Blog post deleted")
    } catch (err) {
      console.error("Error deleting post:", err)
      toast.error("Failed to delete post")
    }
  }

  const filteredPosts = posts.filter((post) =>
    (post.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blog Posts</h1>
            <p className="text-muted-foreground">Manage your travel blog articles</p>
          </div>
          <Button onClick={() => router.push("/super-admin/blog/add")} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Write New Post
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><FileText className="h-4 w-4 text-primary" /><div><p className="text-sm font-medium">Total Posts</p><p className="text-2xl font-bold text-primary">{posts.length}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><Eye className="h-4 w-4 text-green-600" /><div><p className="text-sm font-medium">Published</p><p className="text-2xl font-bold text-green-600">{posts.filter(p => p.status === "Published").length}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><FileText className="h-4 w-4 text-orange-600" /><div><p className="text-sm font-medium">Drafts</p><p className="text-2xl font-bold text-orange-600">{posts.filter(p => p.status === "Draft").length}</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Articles</CardTitle>
            <CardDescription>View, edit, or delete blog posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post._id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell><div className="flex items-center"><Calendar className="h-3 w-3 mr-1 text-muted-foreground" />{post.createdAt}</div></TableCell>
                      <TableCell><div className="flex items-center"><Eye className="h-3 w-3 mr-1 text-muted-foreground" />{post.views || 0}</div></TableCell>
                      <TableCell>
                        <Badge variant={post.status === "Published" ? "default" : "secondary"}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/super-admin/blog/edit/${post._id}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{post.title}"? This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePost(post._id)} className="bg-destructive text-destructive-foreground">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredPosts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No posts found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
