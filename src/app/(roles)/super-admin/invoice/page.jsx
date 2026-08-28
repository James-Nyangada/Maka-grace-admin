"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Save, Mail, Trash2, Printer } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"


const InvoiceTemplate = ({ invoiceData, forwardRef }) => (
  <div 
    ref={forwardRef} 
    className="bg-white p-10 shadow-lg w-full max-w-[800px] min-h-[1000px] relative text-gray-800 mx-auto"
    style={{ fontFamily: "'Inter', sans-serif" }}
  >
    {/* Decorative Elements */}
    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100 rounded-br-[100px] -z-0 opacity-50"></div>
    <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-100 rounded-tl-[150px] -z-0 opacity-50"></div>

    {/* Header */}
    <div className="flex justify-between items-start mb-12 relative z-10">
      <div className="flex items-center gap-3">
        <img src="/logo-maka.png" alt="Maka Grace Travel" className="h-16 object-contain" onError={(e) => e.target.style.display='none'} />
        <div>
          <h2 className="text-2xl font-bold text-blue-900 tracking-tight">MAKA GRACE</h2>
          <p className="text-sm font-medium text-gray-500 tracking-widest uppercase">Travel Agency</p>
        </div>
      </div>
      <div className="text-right">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">INVOICE</h1>
        <p className="text-lg font-medium text-gray-600">#{invoiceData.invoiceNumber}</p>
        <p className="text-sm text-gray-500 mt-1">Date: {invoiceData.date}</p>
      </div>
    </div>

    {/* Addresses */}
    <div className="flex justify-between mb-12 relative z-10">
      <div>
        <h3 className="font-bold text-blue-900 mb-2 uppercase text-sm">Business Details:</h3>
        <p className="font-medium text-gray-800">Maka Grace Travel</p>
        <p className="text-sm text-gray-600">Nairobi, Kenya</p>
        <p className="text-sm text-gray-600">info@makagracetravel.co.ke</p>
        <p className="text-sm text-gray-600">www.makagracetravel.co.ke</p>
      </div>
      <div className="text-right">
        <h3 className="font-bold text-blue-900 mb-2 uppercase text-sm">Invoice To:</h3>
        <p className="font-medium text-gray-800 uppercase">{invoiceData.customerName || "Customer Name"}</p>
        {invoiceData.customerEmail && <p className="text-sm text-gray-600">{invoiceData.customerEmail}</p>}
        {invoiceData.customerPhone && <p className="text-sm text-gray-600">{invoiceData.customerPhone}</p>}
      </div>
    </div>

    {/* Table */}
    <div className="mb-10 relative z-10">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-yellow-400 text-blue-950">
            <th className="py-3 px-4 font-bold rounded-l-md w-16">Item</th>
            <th className="py-3 px-4 font-bold">Description</th>
            <th className="py-3 px-4 font-bold rounded-r-md text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-4 px-4 font-medium">1</td>
            <td className="py-4 px-4 text-gray-700">{invoiceData.packageName || "Travel Package"}</td>
            <td className="py-4 px-4 text-right font-medium">{invoiceData.currency === 'USD' ? '$' : 'KSH '}{(invoiceData.totalAmount || 0).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* Totals */}
    <div className="flex justify-end mb-12 relative z-10">
      <div className="w-64 space-y-3">
        <div className="flex justify-between font-medium text-gray-600">
          <span>Total Amount:</span>
          <span>{invoiceData.currency === 'USD' ? '$' : 'KSH '}{(invoiceData.totalAmount || 0).toFixed(2)}</span>
        </div>
        {(invoiceData.depositPercentage || 0) > 0 && (
          <div className="flex justify-between font-medium text-gray-600">
            <span>Deposit ({invoiceData.depositPercentage}%):</span>
            <span>{invoiceData.currency === 'USD' ? '$' : 'KSH '}{(invoiceData.depositAmount || 0).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-blue-900 text-lg border-t-2 border-yellow-400 pt-2">
          <span>Amount Due:</span>
          <span>
            {invoiceData.currency === 'USD' ? '$' : 'KSH '}
            {((invoiceData.depositPercentage || 0) > 0 ? (invoiceData.depositAmount || 0) : (invoiceData.totalAmount || 0)).toFixed(2)}
          </span>
        </div>
      </div>
    </div>

    {/* Payment Details */}
    <div className="mb-8 relative z-10">
      <h3 className="font-bold text-blue-900 mb-3 uppercase text-sm">Payment Info:</h3>
      <div className="bg-blue-50 p-4 rounded-md inline-block min-w-[300px]">
        {(invoiceData.paymentDetails || "").split('\n').map((line, i) => (
          <p key={i} className="text-sm text-gray-700 font-medium mb-1">{line}</p>
        ))}
      </div>
    </div>
    
    {/* Footer */}
    <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end border-t border-gray-200 pt-6">
      <p className="text-xs text-gray-500 italic max-w-sm">
        Thank you for choosing Maka Grace Travel. All payments should be made prior to the travel date.
      </p>
      <div className="text-center">
        <div className="w-32 border-b-2 border-gray-800 mb-2"></div>
        <p className="text-xs font-medium text-gray-600">Authorized Sign</p>
      </div>
    </div>
  </div>
)

export default function InvoicePage() {
  const [invoices, setInvoices] = useState([])
  const [bookings, setBookings] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Invoice form state
  const [selectedBooking, setSelectedBooking] = useState("manual")
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    packageName: "",
    totalAmount: 0,
    depositPercentage: 0,
    depositAmount: 0,
    paymentDetails: "Account Number: 1234-567\nA/C Name: Maka Grace Travel\nBank Details: Add Details",
    date: new Date().toISOString().split('T')[0],
    currency: "USD"
  })

  const invoiceRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [invRes, bookRes, pkgRes] = await Promise.all([
        api.invoices.getAll().catch(() => []),
        api.bookings.getAll().catch(() => ({ bookings: [] })),
        api.packages.getAdminAll().catch(() => ({ packages: [] }))
      ])
      
      setInvoices(Array.isArray(invRes) ? invRes : [])
      setBookings(bookRes.bookings || [])
      setPackages(pkgRes.packages || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleBookingSelect = (bookingId) => {
    setSelectedBooking(bookingId)
    if (bookingId === "manual") {
      setInvoiceData({
        ...invoiceData,
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        packageName: "",
        totalAmount: 0,
        depositAmount: 0,
        currency: "USD"
      })
      return
    }

    const booking = bookings.find(b => b._id === bookingId)
    if (booking) {
      setInvoiceData({
        ...invoiceData,
        customerName: booking.fullName || "",
        customerEmail: booking.email || "",
        customerPhone: booking.phone || "",
        packageName: booking.packageName || "",
        totalAmount: booking.totalAmount || 0,
        depositAmount: booking.depositAmount || 0,
        bookingId: booking._id,
        currency: "USD"
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setInvoiceData({
      ...invoiceData,
      [name]: name === "totalAmount" || name === "depositPercentage" || name === "depositAmount" 
        ? Number(value) : value
    })
  }

  // Calculate deposit amount if percentage changes
  useEffect(() => {
    if (invoiceData.depositPercentage > 0) {
      setInvoiceData(prev => ({
        ...prev,
        depositAmount: (prev.totalAmount * prev.depositPercentage) / 100
      }))
    }
  }, [invoiceData.depositPercentage, invoiceData.totalAmount])

  const generatePDF = async () => {
    const element = invoiceRef.current;
    if (!element) {
      console.error("Invoice template element not found!")
      return null;
    }

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      // Create isolated iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '794px';
      iframe.style.height = '1123px';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow.document;

      // Copy all styles from the parent document to ensure Tailwind works in the iframe
      const styleLinks = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML)
        .join('\\n');

      // Setup iframe content
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            ${styleLinks}
            <style>
              body { margin: 0; padding: 0; background: white; }
              /* Force convert any unsupported modern colors for html2canvas if needed */
              .bg-blue-100 { background-color: #dbeafe !important; }
              .bg-blue-50 { background-color: #eff6ff !important; }
              .text-blue-900 { color: #1e3a8a !important; }
              .text-blue-950 { color: #172554 !important; }
              .bg-yellow-400 { background-color: #facc15 !important; }
            </style>
          </head>
          <body>
            ${element.outerHTML}
          </body>
        </html>
      `);
      doc.close();

      // Wait for iframe content and styles to fully load
      await new Promise(resolve => {
        if (iframe.contentWindow.document.readyState === 'complete') {
          setTimeout(resolve, 500);
        } else {
          iframe.contentWindow.onload = () => setTimeout(resolve, 500);
        }
      });

      const iframeElement = doc.body.firstChild;

      // Capture the element inside the isolated iframe
      const canvas = await html2canvas(iframeElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight],
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      return pdf;
    } catch (error) {
      console.error("PDF generation failed:", error)
      toast.error(`Failed to generate PDF: ${error.message}`)
      return null
    }
  }

  const handleDownload = async () => {
    try {
      const pdf = await generatePDF();
      if (!pdf) throw new Error("PDF generation failed");
      
      pdf.save(`${invoiceData.invoiceNumber}.pdf`);
      toast.success("Invoice downloaded")
    } catch (error) {
      console.error("Error downloading:", error)
      toast.error(`Download failed: ${error.message}`)
    }
  }

  const handleDownloadFromTable = async (invoice) => {
    const loadingToast = toast.loading("Generating PDF for download...")
    try {
      setInvoiceData({
        ...invoiceData,
        ...invoice,
        date: invoice.createdAt ? new Date(invoice.createdAt).toISOString().split('T')[0] : invoiceData.date
      })
      
      // Wait for React to render the updated state in the hidden ref
      await new Promise(resolve => setTimeout(resolve, 500))

      const pdf = await generatePDF()
      if (!pdf) throw new Error("PDF generation failed")

      pdf.save(`${invoice.invoiceNumber || invoiceData.invoiceNumber}.pdf`)
      toast.success("Invoice downloaded", { id: loadingToast })
    } catch (error) {
      console.error("Error downloading:", error)
      toast.error(`Failed to download PDF: ${error.message}`, { id: loadingToast })
    }
  }

  const handleSaveInvoice = async () => {
    // Check for duplicates
    const isDuplicate = invoices.some(inv => 
      inv.invoiceNumber === invoiceData.invoiceNumber || 
      (inv.customerName && inv.customerName.toLowerCase() === invoiceData.customerName.toLowerCase() && inv.packageName === invoiceData.packageName)
    )

    if (isDuplicate) {
      toast.error("Invoice already generated for this customer/booking or invoice number.")
      return
    }

    try {
      const res = await api.invoices.create(invoiceData)
      setInvoices([res, ...invoices])
      toast.success("Invoice saved successfully")
      // Reset invoice number for next
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`
      }))
    } catch (error) {
      console.error("Error saving invoice:", error)
      toast.error(`Failed to save invoice: ${error.message}`)
    }
  }

  const handleDeleteInvoice = async (id) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return
    try {
      await api.invoices.delete(id)
      setInvoices(invoices.filter(i => i._id !== id))
      toast.success("Invoice deleted")
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast.error("Failed to delete invoice")
    }
  }



  const handleSendEmail = async (invoice) => {
    const loadingToast = toast.loading("Generating PDF and sending email...")
    try {
      setInvoiceData({
        ...invoiceData,
        ...invoice,
        date: invoice.createdAt ? new Date(invoice.createdAt).toISOString().split('T')[0] : invoiceData.date
      })
      
      // Wait for React to render the updated state in the hidden ref
      await new Promise(resolve => setTimeout(resolve, 500))

      const pdf = await generatePDF()
      if (!pdf) throw new Error("PDF generation failed")

      // Get PDF as base64 data URI string for the server endpoint
      const pdfBase64 = pdf.output('datauristring')

      await api.invoices.sendEmail(invoice._id, { pdfBase64 })
      toast.success("Invoice sent to customer successfully!", { id: loadingToast })
    } catch (error) {
      console.error("Error sending email:", error)
      toast.error(`Failed to send email: ${error.message}`, { id: loadingToast })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Manage and generate invoices for bookings</p>
        </div>

        {/* Hidden template always in DOM for iframe extraction */}
        <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -100, top: 0, left: 0, width: '100%' }}>
          <InvoiceTemplate invoiceData={invoiceData} forwardRef={invoiceRef} />
        </div>



        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="generate">Generate Invoice</TabsTrigger>
            <TabsTrigger value="manage">Manage Invoices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form Section */}
              <div className="lg:col-span-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Booking</Label>
                      <Select value={selectedBooking} onValueChange={handleBookingSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select booking to auto-fill" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">-- Manual Entry --</SelectItem>
                          {bookings.map(b => (
                            <SelectItem key={b._id} value={b._id}>
                              {b.fullName} ({b.packageName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Invoice Number</Label>
                      <Input name="invoiceNumber" value={invoiceData.invoiceNumber} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                      <Label>Customer Name</Label>
                      <Input name="customerName" value={invoiceData.customerName} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                      <Label>Customer Email</Label>
                      <Input name="customerEmail" type="email" value={invoiceData.customerEmail} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                      <Label>Package Name</Label>
                      <Input name="packageName" value={invoiceData.packageName} onChange={handleInputChange} list="package-list" />
                      <datalist id="package-list">
                        {packages.map(p => <option key={p._id} value={p.title} />)}
                      </datalist>
                    </div>

                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select value={invoiceData.currency} onValueChange={(value) => handleInputChange({ target: { name: 'currency', value } })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="KSH">KSH (Ksh)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Total Payment ({invoiceData.currency === 'USD' ? '$' : 'KSH'})</Label>
                      <Input name="totalAmount" type="number" value={invoiceData.totalAmount} onChange={handleInputChange} />
                    </div>

                    <div className="flex gap-2">
                      <div className="space-y-2 flex-1">
                        <Label>Deposit (%)</Label>
                        <Input name="depositPercentage" type="number" value={invoiceData.depositPercentage} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label>Deposit ({invoiceData.currency === 'USD' ? '$' : 'KSH'})</Label>
                        <Input name="depositAmount" type="number" value={invoiceData.depositAmount} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Details</Label>
                      <textarea 
                        name="paymentDetails" 
                        value={invoiceData.paymentDetails} 
                        onChange={handleInputChange}
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                      <Button onClick={handleSaveInvoice} className="w-full">
                        <Save className="h-4 w-4 mr-2" /> Save Invoice
                      </Button>
                      <Button variant="outline" onClick={handleDownload} className="w-full">
                        <Download className="h-4 w-4 mr-2" /> Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Section */}
              <div className="lg:col-span-8 overflow-auto border rounded-lg bg-gray-100 p-8 flex justify-center">
                <InvoiceTemplate invoiceData={invoiceData} />
              </div>

            </div>
          </TabsContent>
          
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Saved Invoices</CardTitle>
                <CardDescription>View, manage and send generated invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            No invoices found
                          </TableCell>
                        </TableRow>
                      ) : (
                        invoices.map((invoice) => (
                          <TableRow key={invoice._id}>
                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                            <TableCell>
                              {invoice.customerName}
                              <br/>
                              <span className="text-xs text-muted-foreground">{invoice.customerEmail}</span>
                            </TableCell>
                            <TableCell>{invoice.packageName}</TableCell>
                            <TableCell>{invoice.currency === 'KSH' ? 'KSH ' : '$'}{invoice.totalAmount}</TableCell>
                            <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleDownloadFromTable(invoice)}
                                  title="Download PDF"
                                >
                                  <Download className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleSendEmail(invoice)}
                                  title="Send Email"
                                >
                                  <Mail className="h-4 w-4 text-blue-600" />
                                </Button>

                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleDeleteInvoice(invoice._id)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
