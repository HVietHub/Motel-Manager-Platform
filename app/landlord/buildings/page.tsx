"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useLandlordId } from "@/hooks/use-landlord-id";
import { useRouter } from "next/navigation";

type Building = {
  id: string;
  name: string;
  address: string;
  totalRooms: number;
  availableRooms: number;
  createdAt: string;
};

export default function BuildingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const landlordId = useLandlordId();
  const router = useRouter();

  useEffect(() => {
    if (landlordId) fetchBuildings(landlordId);
    else setIsLoading(false);
  }, [landlordId]);

  const fetchBuildings = async (id: string) => {
    try {
      const res = await fetch(`/api/buildings?landlordId=${id}`);
      if (res.ok) setBuildings(await res.json());
    } catch {
      toast.error("Không thể tải danh sách tòa nhà");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (building: Building) => {
    if (building.totalRooms > 0) {
      toast.error("Không thể xóa tòa nhà còn phòng!");
      return;
    }
    try {
      const res = await fetch(`/api/buildings/${building.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Xóa tòa nhà thành công!");
        if (landlordId) fetchBuildings(landlordId);
      } else {
        const err = await res.json();
        toast.error(err.error || "Không thể xóa tòa nhà");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi xóa");
    }
  };

  const filtered = buildings.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="p-8"><p>Đang tải...</p></div>;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Tòa Nhà / Dãy Trọ</h1>
          <p className="text-muted-foreground mt-1">Quản lý thông tin tòa nhà nhiều tầng hoặc dãy phòng trọ</p>
        </div>
        <Button onClick={() => router.push("/landlord/buildings/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Tòa Nhà / Dãy Trọ
        </Button>
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Tòa Nhà / Dãy Trọ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên Tòa Nhà</TableHead>
                  <TableHead>Địa Chỉ</TableHead>
                  <TableHead className="text-center">Tổng Phòng</TableHead>
                  <TableHead className="text-center">Phòng Trống</TableHead>
                  <TableHead className="text-center">Ngày Tạo</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "Không tìm thấy tòa nhà nào" : "Chưa có tòa nhà nào"}
                      </p>
                      {!searchQuery && (
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => router.push("/landlord/buildings/create")}>
                          <Plus className="mr-1.5 h-3.5 w-3.5" /> Thêm tòa nhà đầu tiên
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((building) => (
                    <TableRow key={building.id}>
                      <TableCell className="font-medium">{building.name}</TableCell>
                      <TableCell className="text-muted-foreground">{building.address}</TableCell>
                      <TableCell className="text-center">{building.totalRooms}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          {building.availableRooms}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {new Date(building.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Single edit button → /buildings/[id]/edit (info + surcharges) */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Chỉnh sửa tòa nhà & phụ thu"
                            onClick={() => router.push(`/landlord/buildings/${building.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Xóa tòa nhà"
                            onClick={() => handleDelete(building)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
