"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Eye, Calendar, MapPin, User, Phone, Mail, CreditCard, Download, Send } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isEditingBooking, setIsEditingBooking] = useState(false)
  const [editBookingData, setEditBookingData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  
  // Email state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.bookings.getAll()
        // Fallback to empty array if no data
        setBookings(res.bookings || [])
      } catch (error) {
        console.error("Error fetching bookings:", error)
        // Mock data fallback if no backend yet
        setBookings([
          {
            _id: "BK001",
            fullName: "James Bond",
            email: "james.bond@example.com",
            phone: "+254700000001",
            packageName: "Bali Adventure",
            destination: "Bali, Indonesia",
            travelDateFrom: "2024-05-10",
            totalAmount: 2500,
            depositAmount: 2500,
            paymentMethod: "Credit Card",
            status: "Completed",
            adults: 2,
            children: 0,
            createdAt: "2024-01-10",
            specialRequests: "Ocean view room please.",
          },
          {
            _id: "BK002",
            fullName: "Mary Jane",
            email: "mary.jane@example.com",
            phone: "+254700000002",
            packageName: "Tokyo Explorer",
            destination: "Tokyo, Japan",
            travelDateFrom: "2024-06-15",
            totalAmount: 3200,
            depositAmount: 1600,
            paymentMethod: "Bank Transfer",
            status: "Pending",
            adults: 1,
            children: 0,
            createdAt: "2024-02-15",
            specialRequests: "Vegetarian meals.",
          }
        ])
      }
    }
    fetchBookings()
  }, [])

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      if (API) {
        const res = await api.bookings.updateStatus(bookingId, newStatus)
        setBookings(bookings.map(b => (b._id === bookingId ? res : b)))
      } else {
        setBookings(bookings.map(b => (b._id === bookingId ? { ...b, status: newStatus } : b)))
      }
      toast.success(`Booking status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating booking status:", error)
      toast.error("Failed to update status")
    }
  }

  const handleEditClick = () => {
    setEditBookingData({ ...selectedBooking })
    setIsEditingBooking(true)
  }

  const handleSaveBooking = async () => {
    setIsSaving(true)
    try {
      if (API) {
        const res = await api.bookings.update(selectedBooking._id, editBookingData)
        setBookings(bookings.map(b => (b._id === selectedBooking._id ? res : b)))
        setSelectedBooking(res)
      } else {
        const updated = { ...selectedBooking, ...editBookingData }
        setBookings(bookings.map(b => (b._id === selectedBooking._id ? updated : b)))
        setSelectedBooking(updated)
      }
      toast.success("Booking updated successfully. Customer notified via email.")
      setIsEditingBooking(false)
    } catch (error) {
      console.error("Error updating booking:", error)
      toast.error("Failed to update booking")
    } finally {
      setIsSaving(false)
    }
  }

  const exportToCSV = () => {
    if (filteredBookings.length === 0) return

    const headers = ["Booking ID", "Customer Name", "Email", "Phone", "Package", "Destination", "Travel Date", "Total Amount", "Paid Amount", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredBookings.map(b => [
        b._id,
        `"${b.fullName || ''}"`,
        b.email || '',
        b.phone || '',
        `"${b.packageName || ''}"`,
        `"${b.destination || ''}"`,
        b.travelDateFrom ? new Date(b.travelDateFrom).toLocaleDateString() : '',
        b.totalAmount || 0,
        b.depositAmount || 0,
        b.status
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openEmailModal = (booking) => {
    setSelectedBooking(booking)
    setEmailSubject(`Update regarding your booking: ${booking.packageName || ''}`)
    setEmailBody(`Dear ${booking.fullName || ''},\n\n`)
    setIsEmailModalOpen(true)
  }

  const handleSendEmail = async () => {
    setSendingEmail(true)
    try {
      await api.bookings.sendEmail(selectedBooking._id, {
        subject: emailSubject,
        message: emailBody,
      })
      toast.success(`Email sent to ${selectedBooking.fullName}`)
      setIsEmailModalOpen(false)
    } catch (err) {
      console.error("Error sending email:", err)
      toast.error("Failed to send email. Check API configuration.")
    } finally {
      setSendingEmail(false)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const customerName = booking.fullName || ""
    const packageName = booking.packageName || ""
    const bookingId = booking._id || ""

    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookingId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || booking.status?.toLowerCase() === statusFilter?.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return "default"
      case "pending": return "secondary"
      case "completed": return "outline"
      case "cancelled": return "destructive"
      default: return "outline"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Booking Management</h1>
            <p className="text-muted-foreground">Manage and track all customer bookings</p>
          </div>
          <Button onClick={exportToCSV} className="bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><Calendar className="h-4 w-4 text-primary" /><div><p className="text-sm font-medium">Total Bookings</p><p className="text-2xl font-bold text-primary">{bookings.length}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><CreditCard className="h-4 w-4 text-green-600" /><div><p className="text-sm font-medium">Confirmed Bookings</p><p className="text-2xl font-bold text-green-600">{bookings.filter((b) => b.status?.toLowerCase() === "confirmed").length}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><CreditCard className="h-4 w-4 text-orange-600" /><div><p className="text-sm font-medium">Pending Bookings</p><p className="text-2xl font-bold text-orange-600">{bookings.filter((b) => b.status?.toLowerCase() === "pending").length}</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>View and manage customer bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by customer name, package, or booking ID..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Travel Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking._id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{booking._id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.fullName || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{booking.email || "N/A"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.packageName || "N/A"}</p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {booking.destination || "N/A"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.travelDateFrom ? new Date(booking.travelDateFrom).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Badge variant={getStatusColor(booking.status)}>{booking.status}</Badge>
                          <Select
                            value={booking.status}
                            onValueChange={(value) => updateBookingStatus(booking._id, value)}
                          >
                            <SelectTrigger className="w-28 h-6 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog onOpenChange={(open) => {
                            if (!open) setIsEditingBooking(false)
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>
                                <Eye className="h-4 w-4 mr-1" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Booking Details - {booking?._id}</DialogTitle>
                                <DialogDescription>Complete information for this booking</DialogDescription>
                              </DialogHeader>

                              {!isEditingBooking ? (
                                <div className="space-y-6">
                                  <div className="flex justify-end">
                                    <Button onClick={handleEditClick} variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">
                                      Edit Booking
                                    </Button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Customer & Booking Details */}
                                    <div className="space-y-6">
                                      <div>
                                        <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center"><User className="h-5 w-5 mr-2 text-muted-foreground"/> Customer Info</h3>
                                        <dl className="space-y-3 text-sm">
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Name</dt><dd className="col-span-2 font-medium">{booking?.fullName}</dd></div>
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Email</dt><dd className="col-span-2">{booking?.email}</dd></div>
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Phone</dt><dd className="col-span-2">{booking?.phone}</dd></div>
                                        </dl>
                                      </div>
                                      
                                      <div>
                                        <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center"><Calendar className="h-5 w-5 mr-2 text-muted-foreground"/> Trip Details</h3>
                                        <dl className="space-y-3 text-sm">
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Package</dt><dd className="col-span-2 font-medium">{booking?.packageName || "Custom"}</dd></div>
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Destination</dt><dd className="col-span-2">{booking?.destination || "N/A"}</dd></div>
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Travel Date</dt><dd className="col-span-2">{booking?.travelDateFrom ? new Date(booking?.travelDateFrom).toLocaleDateString() : "N/A"}</dd></div>
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Duration</dt><dd className="col-span-2">{booking?.duration || "N/A"}</dd></div>
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Guests</dt><dd className="col-span-2">{booking?.adults || 0} Adult(s), {booking?.children || 0} Child(ren)</dd></div>
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Special Req</dt><dd className="col-span-2 italic text-muted-foreground">{booking?.specialRequests || "None"}</dd></div>
                                        </dl>
                                      </div>
                                    </div>

                                    {/* Payment Details */}
                                    <div className="space-y-6">
                                      <div>
                                        <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center"><CreditCard className="h-5 w-5 mr-2 text-muted-foreground"/> Payment Info</h3>
                                        <dl className="space-y-3 text-sm">
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Total Amount</dt><dd className="col-span-2 font-bold">${booking?.totalAmount || 0}</dd></div>
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Paid Amount</dt><dd className="col-span-2 text-green-600 font-medium">${booking?.depositAmount || 0}</dd></div>
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Balance Due</dt><dd className="col-span-2 font-medium text-orange-600">${Math.max(0, (booking?.totalAmount || 0) - (booking?.depositAmount || 0))}</dd></div>
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Method</dt><dd className="col-span-2">{booking?.paymentMethod || "N/A"}</dd></div>
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Status</dt><dd className="col-span-2"><Badge variant={getStatusColor(booking?.status)}>{booking?.status}</Badge></dd></div>
                                          <div className="grid grid-cols-3"><dt className="text-muted-foreground font-medium">Booked On</dt><dd className="col-span-2">{booking?.createdAt ? new Date(booking?.createdAt).toLocaleDateString() : "N/A"}</dd></div>
                                        </dl>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-6 py-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Full Name</Label>
                                      <Input value={editBookingData.fullName || ""} onChange={e => setEditBookingData({...editBookingData, fullName: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Email</Label>
                                      <Input value={editBookingData.email || ""} onChange={e => setEditBookingData({...editBookingData, email: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Phone</Label>
                                      <Input value={editBookingData.phone || ""} onChange={e => setEditBookingData({...editBookingData, phone: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Package Name</Label>
                                      <Input value={editBookingData.packageName || ""} onChange={e => setEditBookingData({...editBookingData, packageName: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Destination</Label>
                                      <Input value={editBookingData.destination || ""} onChange={e => setEditBookingData({...editBookingData, destination: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Travel Date From</Label>
                                      <Input type="date" value={editBookingData.travelDateFrom ? new Date(editBookingData.travelDateFrom).toISOString().split('T')[0] : ""} onChange={e => setEditBookingData({...editBookingData, travelDateFrom: e.target.value})} />
                                    </div>
                                    <div className="space-y-2 flex gap-4">
                                      <div className="flex-1">
                                        <Label>Adults</Label>
                                        <Input type="number" value={editBookingData.adults || 0} onChange={e => setEditBookingData({...editBookingData, adults: Number(e.target.value)})} />
                                      </div>
                                      <div className="flex-1">
                                        <Label>Children</Label>
                                        <Input type="number" value={editBookingData.children || 0} onChange={e => setEditBookingData({...editBookingData, children: Number(e.target.value)})} />
                                      </div>
                                    </div>
                                    <div className="space-y-2 flex gap-4">
                                      <div className="flex-1">
                                        <Label>Total Amount</Label>
                                        <Input type="number" value={editBookingData.totalAmount || 0} onChange={e => setEditBookingData({...editBookingData, totalAmount: Number(e.target.value)})} />
                                      </div>
                                      <div className="flex-1">
                                        <Label>Deposit Amount</Label>
                                        <Input type="number" value={editBookingData.depositAmount || 0} onChange={e => setEditBookingData({...editBookingData, depositAmount: Number(e.target.value)})} />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Status</Label>
                                      <Select value={editBookingData.status || "pending"} onValueChange={v => setEditBookingData({...editBookingData, status: v})}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="confirmed">Confirmed</SelectItem>
                                          <SelectItem value="completed">Completed</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Payment Method</Label>
                                      <Input value={editBookingData.paymentMethod || ""} onChange={e => setEditBookingData({...editBookingData, paymentMethod: e.target.value})} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                      <Label>Special Requests</Label>
                                      <Textarea value={editBookingData.specialRequests || ""} onChange={e => setEditBookingData({...editBookingData, specialRequests: e.target.value})} />
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-2 mt-6">
                                    <Button variant="outline" onClick={() => setIsEditingBooking(false)}>Cancel</Button>
                                    <Button onClick={handleSaveBooking} disabled={isSaving}>
                                      {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button variant="outline" size="sm" onClick={() => openEmailModal(booking)}>
                            <Mail className="h-4 w-4 mr-1" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Email Modal */}
        <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Send Email to {selectedBooking?.fullName}</DialogTitle>
              <DialogDescription>
                Compose a custom email message to send directly to this customer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input id="to" value={selectedBooking?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject" 
                  value={emailSubject} 
                  onChange={(e) => setEmailSubject(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  value={emailBody} 
                  onChange={(e) => setEmailBody(e.target.value)} 
                  className="min-h-[150px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSendEmail} disabled={sendingEmail}>
                {sendingEmail ? "Sending..." : <><Send className="h-4 w-4 mr-2" />Send Email</>}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
