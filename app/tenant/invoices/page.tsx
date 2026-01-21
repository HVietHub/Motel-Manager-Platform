"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt } from "lucide-react";
import { toast } from "sonner";
import { useTenantId } from "@/hooks/use-tenant-id";

type Invoice = {
  id: string;
  month: number;
  year: number;
  rentAmount: number;
  electricityAmount: number;
  waterAmount: number;
  serviceAmount: number;
  otherAmount: number;
  totalAmount: number;
  status: string;
  paidDate: string | null;
  createdAt: string;
};

export default function TenantInvoicesPage() {
  const tenantId = useTenantId();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      fetchInvoices();
    }
  }, [tenantId]);

  const fetchInvoices = async () => {
    if (!tenantId) return;

    try {
      const response = await fetch(`/api/invoices?tenantId=${tenantId}`);
      if (!response.ok) throw new Error("Failed to fetch invoices");

      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error("Fetch invoices error:", error);
      toast.error("Không thể tải danh sách hóa đơn");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalUnpaid = invoices
    .filter((inv) => inv.status === "UNPAID")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Hóa Đơn Của Tôi</h1>
        <p className="text-muted-foreground mt-1">
          Danh sách hóa đơn tiền thuê và dịch vụ
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tổng Chưa Thanh Toán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalUnpaid)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.filter((inv) => inv.status === "UNPAID").length} hóa đơn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tổng Đã Thanh Toán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.filter((inv) => inv.status === "PAID").length} hóa đơn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Hóa Đơn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Tháng/Năm</TableHead>
                  <TableHead className="text-right">Tiền Phòng</TableHead>
                  <TableHead className="text-right">Điện</TableHead>
                  <TableHead className="text-right">Nước</TableHead>
                  <TableHead className="text-right">Dịch Vụ</TableHead>
                  <TableHead className="text-right">Khác</TableHead>
                  <TableHead className="text-right">Tổng Cộng</TableHead>
                  <TableHead className="text-center">Trạng Thái</TableHead>
                  <TableHead className="text-center">Ngày Thanh Toán</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        Chưa có hóa đơn nào
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="text-center">
                        {invoice.month}/{invoice.year}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.rentAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.electricityAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.waterAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.serviceAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.otherAmount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(invoice.totalAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {invoice.status === "PAID" ? (
                          <Badge className="bg-green-100 text-green-700" variant="secondary">
                            Đã Thanh Toán
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700" variant="secondary">
                            Chưa Thanh Toán
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {invoice.paidDate
                          ? new Date(invoice.paidDate).toLocaleDateString("vi-VN")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
