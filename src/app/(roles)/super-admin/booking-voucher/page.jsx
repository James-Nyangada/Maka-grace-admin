"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Plus, Search, FileDown, Eye, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function BookingVoucherPage() {
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewVoucher, setPreviewVoucher] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [formData, setFormData] = useState({
    hotelLodge: "",
    from: "Maka Grace Travel",
    guestName: "",
    nationality: "",
    phone: "",
    checkInDate: "",
    checkOutDate: "",
    roomType: "",
    mealPlan: "",
    numberOfRooms: 1,
    numberOfAdults: 1,
    numberOfChildren: 0,
    numberOfNights: 1,
    remarks: "",
  });

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/api/booking-vouchers`, { withCredentials: true });
      setVouchers(res.data);
    } catch (error) {
      toast.error("Failed to fetch vouchers");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/booking-vouchers`, formData, { withCredentials: true });
      toast.success("Booking voucher created successfully");
      setIsCreateModalOpen(false);
      setPreviewVoucher(res.data);
      fetchVouchers();
      
      setFormData({
        hotelLodge: "",
        from: "Maka Grace Travel",
        guestName: "",
        nationality: "",
        phone: "",
        checkInDate: "",
        checkOutDate: "",
        roomType: "",
        mealPlan: "",
        numberOfRooms: 1,
        numberOfAdults: 1,
        numberOfChildren: 0,
        numberOfNights: 1,
        remarks: "",
      });
    } catch (error) {
      toast.error("Failed to create voucher");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;
    try {
      await axios.delete(`${API}/api/booking-vouchers/${id}`, { withCredentials: true });
      toast.success("Voucher deleted");
      fetchVouchers();
    } catch (error) {
      toast.error("Failed to delete voucher");
    }
  };

  const downloadPDF = async () => {
    if (!previewVoucher) return;
    setIsDownloading(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      // 1. Create HTML template with Maka branding
      const htmlString = `
        <div id="v-capture" style="width: 800px; padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: white; color: #1f2937;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 30px;">
            <div>
              <img src="/logo-maka.png" alt="Maka Logo" style="height: 80px;" />
            </div>
            <div style="text-align: right;">
              <h1 style="color: #059669; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Booking Voucher</h1>
              <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #4b5563;">Voucher #: ${previewVoucher.voucherId || 'N/A'}</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Date: ${format(new Date(previewVoucher.createdAt || Date.now()), "dd MMM yyyy")}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">To (Hotel/Lodge)</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #111827;">${previewVoucher.hotelLodge}</p>
            </div>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">From</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #111827;">${previewVoucher.from}</p>
            </div>
          </div>

          <h2 style="font-size: 16px; color: #059669; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px;">Guest Information</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%; background: #f9fafb;">Guest Name</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${previewVoucher.guestName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Nationality</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${previewVoucher.nationality}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Phone Contact</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${previewVoucher.phone}</td>
            </tr>
          </table>

          <h2 style="font-size: 16px; color: #059669; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px;">Booking Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; text-align: left;">
            <thead>
              <tr style="background: #059669; color: white;">
                <th style="padding: 10px; border: 1px solid #059669;">Check In</th>
                <th style="padding: 10px; border: 1px solid #059669;">Check Out</th>
                <th style="padding: 10px; border: 1px solid #059669;">Nights</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">${format(new Date(previewVoucher.checkInDate), "dd MMM yyyy")}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">${format(new Date(previewVoucher.checkOutDate), "dd MMM yyyy")}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">${previewVoucher.numberOfNights}</td>
              </tr>
            </tbody>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; width: 30%; background: #f9fafb;">Room Type</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${previewVoucher.roomType}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">No. of Rooms</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${previewVoucher.numberOfRooms}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Occupants</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${previewVoucher.numberOfAdults} Adult(s), ${previewVoucher.numberOfChildren} Child(ren)</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Meal Plan</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${previewVoucher.mealPlan}</td>
            </tr>
          </table>

          ${previewVoucher.remarks ? `
          <h2 style="font-size: 16px; color: #059669; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px;">Remarks / Special Requests</h2>
          <div style="padding: 15px; border: 1px dashed #9ca3af; border-radius: 8px; background: #f9fafb; font-style: italic;">
            ${previewVoucher.remarks}
          </div>
          ` : ''}

          <div style="margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 0;">Thank you for booking with Maka Grace Travel</p>
            <p style="margin: 0;">Generated by Admin System • Voucher ID: ${previewVoucher.voucherId}</p>
          </div>
        </div>
      `;

      // 2. Isolated iframe trick
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "800px";
      iframe.style.height = "1200px";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      
      const baseUrl = window.location.origin;
      
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <base href="${baseUrl}/" />
            <style>
              body { margin: 0; padding: 0; background: white; }
            </style>
          </head>
          <body>${htmlString}</body>
        </html>
      `);
      doc.close();

      await new Promise((resolve) => setTimeout(resolve, 500));

      const captureTarget = doc.getElementById("v-capture");

      const canvas = await html2canvas(captureTarget, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Booking_Voucher_${previewVoucher.voucherId || 'Draft'}.pdf`);

      document.body.removeChild(iframe);
      toast.success("PDF Downloaded successfully!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredVouchers = vouchers.filter((v) => 
    v.voucherId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.hotelLodge?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Vouchers</h1>
          <p className="text-muted-foreground">Manage and generate PDF vouchers for hotel bookings.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Voucher
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>All Vouchers</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, guest, or hotel..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher ID</TableHead>
                  <TableHead>Guest Name</TableHead>
                  <TableHead>Hotel/Lodge</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredVouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No vouchers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVouchers.map((v) => (
                    <TableRow key={v._id}>
                      <TableCell className="font-medium">{v.voucherId || "N/A"}</TableCell>
                      <TableCell>{v.guestName}</TableCell>
                      <TableCell>{v.hotelLodge}</TableCell>
                      <TableCell>{format(new Date(v.checkInDate), "dd MMM yyyy")}</TableCell>
                      <TableCell>{format(new Date(v.createdAt), "dd MMM yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => setPreviewVoucher(v)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View & Print
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(v._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Booking Voucher</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateVoucher} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hotel / Lodge *</Label>
                <Input required name="hotelLodge" value={formData.hotelLodge} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>From *</Label>
                <Input required name="from" value={formData.from} onChange={handleInputChange} />
              </div>
              
              <div className="space-y-2">
                <Label>Guest Name *</Label>
                <Input required name="guestName" value={formData.guestName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Nationality *</Label>
                <Input required name="nationality" value={formData.nationality} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label>Phone Contact *</Label>
                <Input required name="phone" value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Room Type *</Label>
                <Input required name="roomType" placeholder="e.g. Double Deluxe" value={formData.roomType} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label>Check In Date *</Label>
                <Input required type="date" name="checkInDate" value={formData.checkInDate} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Check Out Date *</Label>
                <Input required type="date" name="checkOutDate" value={formData.checkOutDate} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label>Meal Plan *</Label>
                <Input required name="mealPlan" placeholder="e.g. Half Board" value={formData.mealPlan} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Number of Nights *</Label>
                <Input required type="number" min="1" name="numberOfNights" value={formData.numberOfNights} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label>Number of Rooms *</Label>
                <Input required type="number" min="1" name="numberOfRooms" value={formData.numberOfRooms} onChange={handleInputChange} />
              </div>
              <div className="space-y-2 flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Adults *</Label>
                  <Input required type="number" min="1" name="numberOfAdults" value={formData.numberOfAdults} onChange={handleInputChange} />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Children</Label>
                  <Input type="number" min="0" name="numberOfChildren" value={formData.numberOfChildren} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Remarks / Special Requests</Label>
              <Textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={3} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button type="submit">Generate Voucher</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewVoucher} onOpenChange={(open) => !open && setPreviewVoucher(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Voucher Preview (ID: {previewVoucher?.voucherId})</DialogTitle>
          </DialogHeader>
          
          {previewVoucher && (
            <div className="border rounded-md p-6 space-y-6 bg-slate-50 dark:bg-slate-900">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-emerald-600">{previewVoucher.hotelLodge}</h3>
                <div className="text-right">
                  <p className="font-medium">Guest: {previewVoucher.guestName}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(previewVoucher.checkInDate), "MMM dd, yyyy")} - {format(new Date(previewVoucher.checkOutDate), "MMM dd, yyyy")}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Nationality:</span> {previewVoucher.nationality}</div>
                <div><span className="font-medium">Phone:</span> {previewVoucher.phone}</div>
                <div><span className="font-medium">Room Type:</span> {previewVoucher.roomType} ({previewVoucher.numberOfRooms} room)</div>
                <div><span className="font-medium">Occupants:</span> {previewVoucher.numberOfAdults} Adults, {previewVoucher.numberOfChildren} Children</div>
                <div><span className="font-medium">Meal Plan:</span> {previewVoucher.mealPlan}</div>
                <div><span className="font-medium">Nights:</span> {previewVoucher.numberOfNights}</div>
              </div>

              {previewVoucher.remarks && (
                <div className="text-sm border-t pt-4 mt-4">
                  <span className="font-medium block mb-1">Remarks:</span>
                  <p className="text-muted-foreground italic">{previewVoucher.remarks}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewVoucher(null)}>Close</Button>
            <Button onClick={downloadPDF} disabled={isDownloading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isDownloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
              {isDownloading ? "Generating PDF..." : "Download PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
