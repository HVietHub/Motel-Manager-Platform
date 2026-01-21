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
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { useTenantId } from "@/hooks/use-tenant-id";

type ContractStatus = "ACTIVE" | "EXPIRED" | "TERMINATED";

type Contract = {
  id: string;
  roomNumber: string;
  buildingName: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  status: ContractStatus;
  terms: string | null;
};

export default function TenantContractsPage() {
  const tenantId = useTenantId();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      fetchContracts();
    }
  }, [tenantId]);

  const fetchContracts = async () => {
    if (!tenantId) return;

    try {
      const response = await fetch(`/api/contracts?tenantId=${tenantId}`);
      if (!response.ok) throw new Error("Failed to fetch contracts");

      const data = await response.json();
      const formattedContracts = data.map((contract: any) => ({
        id: contract.id,
        roomNumber: contract.room.roomNumber,
        buildingName: contract.room.building.name,
        startDate: contract.startDate,
        endDate: contract.endDate,
        rentAmount: contract.rentAmount,
        depositAmount: contract.depositAmount,
        status: contract.status,
        terms: contract.terms,
      }));
      setContracts(formattedContracts);
    } catch (error) {
      console.error("Fetch contracts error:", error);
      toast.error("Không thể tải danh sách hợp đồng");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: ContractStatus) => {
    const variants = {
      ACTIVE: { label: "Đang Hiệu Lực", className: "bg-green-100 text-green-700" },
      EXPIRED: { label: "Hết Hạn", className: "bg-gray-100 text-gray-700" },
      TERMINATED: { label: "Đã Hủy", className: "bg-red-100 text-red-700" },
    };
    const variant = variants[status];
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Hợp Đồng Của Tôi</h1>
        <p className="text-muted-foreground mt-1">
          Danh sách các hợp đồng thuê trọ
        </p>
      </div>

      {/* Contracts List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Hợp Đồng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Ngày Bắt Đầu</TableHead>
                  <TableHead>Ngày Kết Thúc</TableHead>
                  <TableHead className="text-right">Tiền Thuê</TableHead>
                  <TableHead className="text-right">Tiền Cọc</TableHead>
                  <TableHead className="text-center">Trạng Thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        Chưa có hợp đồng nào
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{contract.roomNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            {contract.buildingName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(contract.startDate).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        {new Date(contract.endDate).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(contract.rentAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(contract.depositAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(contract.status)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Contract Details */}
      {contracts.length > 0 && contracts[0].terms && (
        <Card>
          <CardHeader>
            <CardTitle>Điều Khoản Hợp Đồng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{contracts[0].terms}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
