"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Search, Filter, Edit, Trash2, Plus, MapPin, DollarSign, Calendar, Users, Star, Package } from "lucide-react"

export default function ManagePackagesPage() {
  const [packages, setPackages] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()

  const API = process.env.NEXT_PUBLIC_API_URL;
  
  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const res = await axios.get(`${API}/api/packages`)
      setPackages(res.data.packages || [])
    } catch (err) {
      console.error("Error fetching packages:", err)
    }
  }

  const updatePackageStatus = async (packageId, newStatus) => {
    try {
      const res = await axios.put(`${API}/api/packages/${packageId}`, { status: newStatus })
      setPackages(packages.map((pkg) => (pkg._id === packageId ? res.data : pkg)))
    } catch (err) {
      console.error("Error updating status:", err)
    }
  }

  const deletePackage = async (packageId) => {
    try {
      await axios.delete(`${API}/api/packages/${packageId}`)
      setPackages(packages.filter((pkg) => pkg._id !== packageId))
    } catch (err) {
      console.error("Error deleting package:", err)
    }
  }

  const handleEditPackage = (pkg) => {
    router.push(`/super-admin/packages/edit/${pkg._id}`)
  }

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      (pkg.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg._id || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || (statusFilter === "draft" ? pkg.isDraft : (!pkg.isDraft && pkg.status === statusFilter))
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (pkg) => {
    if (pkg.isDraft) return "warning"
    switch (pkg.status) {
      case "active":
        return "default"
      case "on-offer":
        return "secondary"
      case "inactive":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusText = (pkg) => {
    if (pkg.isDraft) return "Draft"
    switch (pkg.status) {
      case "on-offer":
        return "On Offer"
      case "active":
        return "Active"
      case "inactive":
        return "Inactive"
      default:
        return pkg.status
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Packages</h1>
            <p className="text-muted-foreground">View, edit, and manage all your travel packages</p>
          </div>
          <Button
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            onClick={() => router.push("/super-admin/packages/add")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Package
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><Package className="h-4 w-4 text-primary" /><div><p className="text-sm font-medium">Total Packages</p><p className="text-2xl font-bold text-primary">{packages.length}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><Package className="h-4 w-4 text-green-600" /><div><p className="text-sm font-medium">Active Packages</p><p className="text-2xl font-bold text-green-600">{packages.filter((p) => p.status === "active").length}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><Star className="h-4 w-4 text-yellow-600" /><div><p className="text-sm font-medium">On Offer</p><p className="text-2xl font-bold text-yellow-600">{packages.filter((p) => p.status === "on-offer").length}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><Users className="h-4 w-4 text-primary" /><div><p className="text-sm font-medium">Total Bookings</p><p className="text-2xl font-bold text-primary">{packages.reduce((sum, p) => sum + (p.bookings || 0), 0)}</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Packages</CardTitle>
            <CardDescription>Manage your travel packages and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by package name, location, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="on-offer">On Offer</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Package</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackages.map((pkg) => (
                    <TableRow key={pkg._id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-medium">{pkg.name}</p>
                          <p className="text-sm text-muted-foreground">{pkg._id}</p>
                        </div>
                      </TableCell>
                      <TableCell><div className="flex items-center"><MapPin className="h-3 w-3 mr-1 text-muted-foreground" />{pkg.location}</div></TableCell>
                      <TableCell><div className="flex items-center"><Calendar className="h-3 w-3 mr-1 text-muted-foreground" />{pkg.duration}</div></TableCell>
                      <TableCell><div className="flex items-center font-medium"><DollarSign className="h-3 w-3 mr-1" />{pkg.price}</div></TableCell>
                      <TableCell><div className="flex items-center"><Users className="h-3 w-3 mr-1 text-muted-foreground" />{pkg.bookings || 0}</div></TableCell>
                      <TableCell><div className="flex items-center"><Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />{pkg.rating || 0}</div></TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Badge variant={getStatusColor(pkg)}>{getStatusText(pkg)}</Badge>
                          {!pkg.isDraft && (
                            <Select value={pkg.status} onValueChange={(value) => updatePackageStatus(pkg._id, value)}>
                              <SelectTrigger className="w-24 h-6 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="on-offer">On Offer</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditPackage(pkg)}>
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
                                <AlertDialogTitle>Delete Package</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{pkg.name}"? This action cannot be undone and will affect all existing bookings.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePackage(pkg._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete Package
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
            {filteredPackages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No packages found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
