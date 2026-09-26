"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Plus, Search, FileDown, Pencil, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard-layout";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const emptyDestination = () => ({ hotel: "", hotelName: "", checkIn: "", checkOut: "" });
const emptyAccommodation = () => ({ hotel: "", roomType: "", units: 1, nights: 1, foodPlan: "", meals: "" });
const emptyForm = () => ({
  bookingNames: "",
  residency: "Non-Residents",
  numberOfAdults: 1,
  teenagers: "",
  numberOfChildren: "",
  childrenDetails: "",
  whoToCharge: "Maka Grace Travel",
  voucherDate: format(new Date(), "yyyy-MM-dd"),
  createdByName: "",
  createdByEmail: "",
  destinations: [emptyDestination()],
  accommodations: [emptyAccommodation()],
  extras: "",
  transfers: "",
  specialInstructions: "",
});

const toInputDate = (d) => (d ? format(new Date(d), "yyyy-MM-dd") : "");
const fmtDate = (d) => (d ? format(new Date(d), "EEE, dd MMM-yyyy") : "");
const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const orNone = (s) => (s && String(s).trim() ? esc(s) : "--None--");

export default function ReservationVoucherPage() {
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm());

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/api/reservation-vouchers`, { withCredentials: true });
      setVouchers(res.data);
    } catch (error) {
      toast.error("Failed to fetch reservation vouchers");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateRow = (key, index, field, value) =>
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));

  const addRow = (key, factory) =>
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], factory()] }));

  const removeRow = (key, index) =>
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].length > 1 ? prev[key].filter((_, i) => i !== index) : prev[key],
    }));

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm());
    setIsFormOpen(true);
  };

  const openEdit = (v) => {
    setEditingId(v._id);
    setFormData({
      ...emptyForm(),
      ...v,
      voucherDate: toInputDate(v.voucherDate),
      destinations: v.destinations.map((d) => ({
        ...d,
        checkIn: toInputDate(d.checkIn),
        checkOut: toInputDate(d.checkOut),
      })),
      accommodations: v.accommodations.map((a) => ({ ...a })),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        numberOfAdults: Number(formData.numberOfAdults),
        accommodations: formData.accommodations.map((a) => ({
          ...a,
          units: Number(a.units),
          nights: Number(a.nights),
        })),
      };
      if (editingId) {
        await axios.put(`${API}/api/reservation-vouchers/${editingId}`, payload, { withCredentials: true });
        toast.success("Reservation voucher updated");
      } else {
        await axios.post(`${API}/api/reservation-vouchers`, payload, { withCredentials: true });
        toast.success("Reservation voucher created");
      }
      setIsFormOpen(false);
      fetchVouchers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save voucher");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this reservation voucher?")) return;
    try {
      await axios.delete(`${API}/api/reservation-vouchers/${id}`, { withCredentials: true });
      toast.success("Voucher deleted");
      fetchVouchers();
    } catch (error) {
      toast.error("Failed to delete voucher");
    }
  };

  const buildVoucherHtml = (v) => {
    const BLUE = "#0a5cf0";
    const GREEN = "#0b6b34";
    const th = `padding:7px 6px;background:${BLUE};color:#fff;text-align:left;font-size:15px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;`;
    const td = `padding:7px 6px;font-size:15px;border-bottom:1px solid #e3e3e3;font-family:Arial,Helvetica,sans-serif;`;
    const bg = (i) => (i % 2 === 0 ? "#f1f1f1" : "#fff");
    const serif = "font-family:'Times New Roman',Times,serif;";
    const infoRows = [
      ["Booking Names", orNone(v.bookingNames)],
      ["Residency", orNone(v.residency)],
      ["Number of Adults", esc(v.numberOfAdults)],
      ["Teenagers between 12 and 17", orNone(v.teenagers)],
      ["Number of Children below 12", orNone(v.numberOfChildren)],
      ["Details of children below 12", orNone(v.childrenDetails)],
      ["Who to charge", orNone(v.whoToCharge)],
      ["Voucher Dated", esc(format(new Date(v.voucherDate), "EEE, dd MMM-yyyy"))],
      ["Created by , Name", orNone(v.createdByName)],
      ["Created by , Email", orNone(v.createdByEmail)],
    ]
      .map(
        ([k, val], i) => `<tr style="background:${bg(i)};">
          <td style="${td}font-weight:bold;width:50%;">${k} :</td><td style="${td}">${val}</td></tr>`
      )
      .join("");

    const section = (title, body, extra = "") => `
      <div style="position:relative;border:1.5px solid ${BLUE};border-radius:26px;padding:30px 16px 14px;margin-top:20px;${extra}">
        <div style="position:absolute;top:-16px;left:14px;background:${BLUE};color:#fff;padding:4px 12px;border-radius:7px;${serif}font-weight:bold;font-size:20px;">${title}</div>
        ${body}
      </div>`;

    const destinations = `<table style="width:100%;border-collapse:collapse;">
      <tr><th style="${th}width:24%;">HOTELS</th><th style="${th}width:28%;">HOTEL NAME</th><th style="${th}">CHECK-IN</th><th style="${th}">CHECK-OUT</th></tr>
      ${v.destinations
        .map(
          (d, i) => `<tr style="background:${bg(i)};">
        <td style="${td}">${esc(d.hotel)}</td><td style="${td}">${esc(d.hotelName)}</td>
        <td style="${td}">${esc(fmtDate(d.checkIn))}</td><td style="${td}">${esc(fmtDate(d.checkOut))}</td></tr>`
        )
        .join("")}
    </table>`;

    const accommodations = `<table style="width:100%;border-collapse:collapse;">
      <tr><th style="${th}width:38%;">HOTEL</th><th style="${th}width:24%;">ROOM TYPE</th><th style="${th}width:16%;">UNITS</th><th style="${th}">NIGHTS</th></tr>
      ${v.accommodations
        .map(
          (a, i) => `<tr style="background:${bg(i * 2)};">
        <td style="${td}">${esc(a.hotel)}</td><td style="${td}">${esc(a.roomType)}</td>
        <td style="${td}">${esc(a.units)}</td><td style="${td}">${esc(a.nights)}</td></tr>
        <tr style="background:#fff;"><td colspan="2" style="${td}font-weight:bold;">Food Plan [${esc(a.foodPlan)}]</td>
        <td colspan="2" style="${td}font-weight:bold;">Meals? [${esc(a.meals)}]</td></tr>`
        )
        .join("")}
    </table>`;

    const line = (label, val) =>
      `<div style="${serif}font-size:18px;margin:3px 0;min-height:22px;"><b>${label}</b> : ${esc(val)}</div>`;

    return `
      <div id="v-capture" style="width:794px;min-height:1123px;box-sizing:border-box;padding:28px 38px 20px;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif;position:relative;">
        <div style="text-align:right;font-size:10px;font-weight:bold;">Date :${esc(format(new Date(v.voucherDate), "EEE , dd MMM - yyyy"))}</div>
        <div style="display:flex;align-items:center;gap:22px;border-bottom:2px solid ${GREEN};padding-bottom:14px;margin-top:2px;">
          <img src="/logo-maka.png" alt="Maka Grace Travel" style="height:130px;width:130px;object-fit:contain;" />
          <div>
            <div style="font-size:30px;font-weight:bold;color:${GREEN};line-height:1.15;">MAKA GRACE TOURS AND TRAVEL</div>
            <div style="font-size:19px;font-style:italic;color:#8b1a2b;margin:2px 0 8px;">Travel with Grace | Discover the Extra Ordinary</div>
            <div style="font-size:17px;letter-spacing:1px;">NAIROBI, KENYA</div>
            <div style="font-size:17px;letter-spacing:1px;">MOBILE: <span style="color:${GREEN};font-weight:bold;">+254 705 794 254</span></div>
            <div style="font-size:17px;letter-spacing:1px;">EMAIL: info@makagracetravel.co.ke</div>
          </div>
        </div>
        <div style="text-align:center;${serif}font-size:23px;font-weight:bold;text-decoration:underline;margin:22px 0 20px;">RESERVATIONS DEPARTMENT</div>
        <div style="display:flex;justify-content:space-between;align-items:center;${serif}font-weight:bold;font-size:18px;">
          <div>PLEASE <i style="color:#1a9a1a;">[ RESERVE ]</i> VOUCHER NUMBER : <u>#${esc(v.voucherNumber)}</u></div>
          <div style="border:3px solid #22c522;border-radius:10px;padding:8px 14px;color:#22a822;font-family:Arial,sans-serif;font-size:14px;letter-spacing:3px;">RESERVE</div>
        </div>
        ${section("VOUCHER INFORMATION", `<table style="width:100%;border-collapse:collapse;border-top:7px solid ${BLUE};">${infoRows}</table>`, "margin-top:8px;")}
        ${section("DESTINATIONS", destinations)}
        ${section("ACCOMODATIONS", accommodations)}
        <div style="margin-top:26px;">
          ${line("Extras", v.extras)}
          ${line("Transfers", v.transfers)}
          ${line("Special Instructions", v.specialInstructions)}
        </div>
        <div style="position:absolute;left:0;right:0;bottom:18px;text-align:center;font-size:15px;">
          <b>Maka Grace Travel LTD |</b> <i>Official Document</i> <b>Website: www.makagracetravel.co.ke | Email: info@makagracetravel.co.ke</b>
          <div style="font-size:9px;font-style:italic;margin-top:6px;"><b>Page: 1 of 1</b></div>
        </div>
      </div>`;
  };

  const downloadPDF = async (v) => {
    setDownloadingId(v._id);
    let iframe;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      iframe = document.createElement("iframe");
      iframe.style.cssText = "position:absolute;width:794px;height:1200px;top:-9999px;left:-9999px;";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><base href="${window.location.origin}/" />
        <style>body{margin:0;background:#fff;}</style></head><body>${buildVoucherHtml(v)}</body></html>`);
      doc.close();

      const img = doc.querySelector("img");
      if (img && !img.complete) {
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(doc.getElementById("v-capture"), {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;
      const imgData = canvas.toDataURL("image/png");

      // Keep the voucher on a single A4 page, shrinking only if it overflows
      const fit = Math.min(1, pageH / imgH);
      pdf.addImage(imgData, "PNG", (pageW - pageW * fit) / 2, 0, pageW * fit, imgH * fit);
      pdf.save(`Reservation_Voucher_${v.voucherNumber}.pdf`);
      toast.success("PDF downloaded");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    } finally {
      if (iframe) document.body.removeChild(iframe);
      setDownloadingId(null);
    }
  };

  const term = searchTerm.toLowerCase();
  const filtered = vouchers.filter(
    (v) =>
      v.voucherNumber?.toLowerCase().includes(term) ||
      v.bookingNames?.toLowerCase().includes(term) ||
      v.destinations?.some((d) => d.hotelName?.toLowerCase().includes(term))
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reservation Vouchers</h1>
            <p className="text-muted-foreground">Create, edit and download reservation vouchers for hotels and lodges.</p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Create Reservation Voucher
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>All Reservation Vouchers</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by number, guest, or hotel..."
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
                    <TableHead>Voucher No.</TableHead>
                    <TableHead>Booking Names</TableHead>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Voucher Date</TableHead>
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
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No reservation vouchers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((v) => (
                      <TableRow key={v._id}>
                        <TableCell className="font-medium">#{v.voucherNumber}</TableCell>
                        <TableCell>{v.bookingNames}</TableCell>
                        <TableCell>{v.destinations?.[0]?.hotelName}</TableCell>
                        <TableCell>{v.destinations?.[0] && fmtDate(v.destinations[0].checkIn)}</TableCell>
                        <TableCell>{format(new Date(v.voucherDate), "dd MMM yyyy")}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(v)}>
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={downloadingId === v._id}
                            onClick={() => downloadPDF(v)}
                          >
                            {downloadingId === v._id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <FileDown className="h-4 w-4 mr-1" />
                            )}
                            Download
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(v._id)}>
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

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Reservation Voucher" : "Create Reservation Voucher"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-2">
              <section className="space-y-3">
                <h3 className="font-semibold text-emerald-700">Voucher Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Booking Names *">
                    <Input required name="bookingNames" value={formData.bookingNames} onChange={handleChange} />
                  </Field>
                  <Field label="Residency">
                    <Input name="residency" placeholder="Non-Residents" value={formData.residency} onChange={handleChange} />
                  </Field>
                  <Field label="Number of Adults *">
                    <Input required type="number" min="0" name="numberOfAdults" value={formData.numberOfAdults} onChange={handleChange} />
                  </Field>
                  <Field label="Teenagers between 12 and 17">
                    <Input name="teenagers" value={formData.teenagers} onChange={handleChange} />
                  </Field>
                  <Field label="Number of Children below 12">
                    <Input name="numberOfChildren" value={formData.numberOfChildren} onChange={handleChange} />
                  </Field>
                  <Field label="Details of children below 12">
                    <Input name="childrenDetails" value={formData.childrenDetails} onChange={handleChange} />
                  </Field>
                  <Field label="Who to charge">
                    <Input name="whoToCharge" value={formData.whoToCharge} onChange={handleChange} />
                  </Field>
                  <Field label="Voucher Dated *">
                    <Input required type="date" name="voucherDate" value={formData.voucherDate} onChange={handleChange} />
                  </Field>
                  <Field label="Created by, Name">
                    <Input name="createdByName" value={formData.createdByName} onChange={handleChange} />
                  </Field>
                  <Field label="Created by, Email">
                    <Input type="email" name="createdByEmail" value={formData.createdByEmail} onChange={handleChange} />
                  </Field>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-emerald-700">Destinations</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => addRow("destinations", emptyDestination)}>
                    <Plus className="h-4 w-4 mr-1" /> Add destination
                  </Button>
                </div>
                {formData.destinations.map((d, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-end">
                    <Field label="Hotel *">
                      <Input required value={d.hotel} onChange={(e) => updateRow("destinations", i, "hotel", e.target.value)} />
                    </Field>
                    <Field label="Hotel Name *">
                      <Input required value={d.hotelName} onChange={(e) => updateRow("destinations", i, "hotelName", e.target.value)} />
                    </Field>
                    <Field label="Check-in *">
                      <Input required type="date" value={d.checkIn} onChange={(e) => updateRow("destinations", i, "checkIn", e.target.value)} />
                    </Field>
                    <Field label="Check-out *">
                      <Input required type="date" value={d.checkOut} onChange={(e) => updateRow("destinations", i, "checkOut", e.target.value)} />
                    </Field>
                    <Button type="button" variant="ghost" size="icon" disabled={formData.destinations.length === 1} onClick={() => removeRow("destinations", i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-emerald-700">Accommodations</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => addRow("accommodations", emptyAccommodation)}>
                    <Plus className="h-4 w-4 mr-1" /> Add accommodation
                  </Button>
                </div>
                {formData.accommodations.map((a, i) => (
                  <div key={i} className="grid grid-cols-6 gap-2 items-end border-b pb-3">
                    <Field label="Hotel *">
                      <Input required value={a.hotel} onChange={(e) => updateRow("accommodations", i, "hotel", e.target.value)} />
                    </Field>
                    <Field label="Room Type *">
                      <Input required placeholder="double" value={a.roomType} onChange={(e) => updateRow("accommodations", i, "roomType", e.target.value)} />
                    </Field>
                    <Field label="Units *">
                      <Input required type="number" min="1" value={a.units} onChange={(e) => updateRow("accommodations", i, "units", e.target.value)} />
                    </Field>
                    <Field label="Nights *">
                      <Input required type="number" min="1" value={a.nights} onChange={(e) => updateRow("accommodations", i, "nights", e.target.value)} />
                    </Field>
                    <Field label="Food Plan">
                      <Input placeholder="FB" value={a.foodPlan} onChange={(e) => updateRow("accommodations", i, "foodPlan", e.target.value)} />
                    </Field>
                    <div className="flex gap-2 items-end">
                      <Field label="Meals?">
                        <Input value={a.meals} onChange={(e) => updateRow("accommodations", i, "meals", e.target.value)} />
                      </Field>
                      <Button type="button" variant="ghost" size="icon" disabled={formData.accommodations.length === 1} onClick={() => removeRow("accommodations", i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </section>

              <section className="space-y-3">
                <Field label="Extras">
                  <Input name="extras" value={formData.extras} onChange={handleChange} />
                </Field>
                <Field label="Transfers">
                  <Input name="transfers" value={formData.transfers} onChange={handleChange} />
                </Field>
                <Field label="Special Instructions">
                  <Textarea name="specialInstructions" rows={3} value={formData.specialInstructions} onChange={handleChange} />
                </Field>
              </section>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingId ? "Save Changes" : "Save Voucher"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2 flex-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
