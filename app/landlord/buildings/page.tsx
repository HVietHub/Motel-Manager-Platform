"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Pencil, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useLandlordId } from "@/hooks/use-landlord-id";

type Building = {
  id: string;
  name: string;
  address: string;
  description?: string;
  electricityPrice?: number;
  waterPrice?: number;
  totalRooms: number;
  availableRooms: number;
  createdAt: string;
};

export default function BuildingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const landlordId = useLandlordId();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    electricityPrice: 3000,
    waterPrice: 50000,
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    electricityPrice: 3000,
    waterPrice: 50000,
  });

  useEffect(() => {
    if (landlordId) {
      fetchBuildings(landlordId);
    } else {
      setIsLoading(false);
    }
  }, [landlordId]);

  const fetchBuildings = async (landlordId: string) => {
    try {
      const response = await fetch(`/api/buildings?landlordId=${landlordId}`);
      if (response.ok) {
        const data = await response.json();
        setBuildings(data.map((b: any) => ({
          ...b,
          electricityPrice: b.electricityPrice || 3000,
          waterPrice: b.waterPrice || 50000,
        })));
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
      toast.error("Không thể tải danh sách tòa nhà");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBuildings = buildings.filter((building) =>
    building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    building.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!landlordId) {
      return;
    }

    try {
      const response = await fetch("/api/buildings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          landlordId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Tạo tòa nhà thành công!");
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((warning: string) => toast.warning(warning));
        }
        setIsCreateDialogOpen(false);
        setFormData({ name: "", address: "", electricityPrice: 3000, waterPrice: 50000 });
        fetchBuildings(landlordId);
      } else {
        toast.error("Không thể tạo tòa nhà");
      }
    } catch (error) {
      console.error("Error creating building:", error);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleEdit = async () => {
    if (!selectedBuilding) return;

    try {
      const response = await fetch(`/api/buildings/${selectedBuilding.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Cập nhật tòa nhà thành công!");
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((warning: string) => toast.warning(warning));
        }
        setIsEditDialogOpen(false);
        setSelectedBuilding(null);
        if (landlordId) {
          fetchBuildings(landlordId);
        }
      } else {
        toast.error("Không thể cập nhật tòa nhà");
      }
    } catch (error) {
      console.error("Error updating building:", error);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleDelete = (building: Building) => {
    if (building.totalRooms > 0) {
      toast.error("Không thể xóa tòa nhà có phòng!");
      return;
    }
    toast.success("Xóa tòa nhà thành công!");
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Tòa Nhà / Dãy Trọ</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý thông tin tòa nhà nhiều tầng hoặc dãy phòng trọ
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Tòa Nhà / Dãy Trọ
        </Button>
      </div>

      {/* Search and Filter */}
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

          {/* Table */}
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
                {filteredBuildings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        {searchQuery
                          ? "Không tìm thấy tòa nhà nào"
                          : "Chưa có tòa nhà nào"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBuildings.map((building) => (
                    <TableRow key={building.id}>
                      <TableCell className="font-medium">
                        {building.name}
                      </TableCell>
                      <TableCell>{building.address}</TableCell>
                      <TableCell className="text-center">
                        {building.totalRooms}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          {building.availableRooms}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(building.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBuilding(building);
                              setEditFormData({
                                name: building.name,
                                address: building.address,
                                electricityPrice: building.electricityPrice || 3000,
                                waterPrice: building.waterPrice || 50000,
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Tòa Nhà / Dãy Trọ Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin tòa nhà nhiều tầng hoặc dãy phòng trọ
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên Tòa Nhà / Dãy Trọ</Label>
              <Input
                id="name"
                placeholder="VD: Nhà Trọ A, Dãy Trọ B, Khu C..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Đặt tên để phân biệt các tòa nhà hoặc dãy trọ
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Địa Chỉ</Label>
              <Input
                id="address"
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="electricityPrice">Giá điện (VNĐ/kWh)</Label>
              <Input
                id="electricityPrice"
                type="number"
                min="0"
                placeholder="3000"
                value={formData.electricityPrice}
                onChange={(e) => setFormData({ ...formData, electricityPrice: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                Giá điện mặc định: 3000 VNĐ/kWh
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="waterPrice">Giá nước (VNĐ/tháng)</Label>
              <Input
                id="waterPrice"
                type="number"
                min="0"
                placeholder="50000"
                value={formData.waterPrice}
                onChange={(e) => setFormData({ ...formData, waterPrice: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                Giá nước cố định mỗi tháng, mặc định: 50000 VNĐ
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Tòa Nhà</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin tòa nhà
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên Tòa Nhà</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Địa Chỉ</Label>
              <Input
                id="edit-address"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-electricityPrice">Giá điện (VNĐ/kWh)</Label>
              <Input
                id="edit-electricityPrice"
                type="number"
                min="0"
                value={editFormData.electricityPrice}
                onChange={(e) => setEditFormData({ ...editFormData, electricityPrice: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                Giá điện hiện tại: {editFormData.electricityPrice.toLocaleString('vi-VN')} VNĐ/kWh
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-waterPrice">Giá nước (VNĐ/tháng)</Label>
              <Input
                id="edit-waterPrice"
                type="number"
                min="0"
                value={editFormData.waterPrice}
                onChange={(e) => setEditFormData({ ...editFormData, waterPrice: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                Giá nước hiện tại: {editFormData.waterPrice.toLocaleString('vi-VN')} VNĐ/tháng
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEdit}>Lưu Thay Đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
