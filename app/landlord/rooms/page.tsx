"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Pencil, Trash2, DoorOpen } from "lucide-react";
import { toast } from "sonner";
import { useLandlordId } from "@/hooks/use-landlord-id";

type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

type Room = {
  id: string;
  roomNumber: string;
  buildingName: string;
  floor: number;
  area: number;
  price: number;
  status: RoomStatus;
};

export default function RoomsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const landlordId = useLandlordId();
  const [formData, setFormData] = useState({
    buildingId: "",
    roomNumber: "",
    floor: 1,
    area: 0,
    price: 0,
    deposit: 0,
    description: "",
    status: "AVAILABLE" as RoomStatus,
  });

  useEffect(() => {
    if (landlordId) {
      fetchRooms(landlordId);
      fetchBuildings(landlordId);
    } else {
      setIsLoading(false);
    }
  }, [landlordId]);

  const fetchRooms = async (landlordId: string) => {
    try {
      const response = await fetch(`/api/rooms?landlordId=${landlordId}`);
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Không thể tải danh sách phòng");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBuildings = async (landlordId: string) => {
    try {
      const response = await fetch(`/api/buildings?landlordId=${landlordId}`);
      if (response.ok) {
        const data = await response.json();
        setBuildings(data);
        // Auto-select first building if only one exists
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, buildingId: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  };

  const getStatusBadge = (status: RoomStatus) => {
    const variants = {
      AVAILABLE: { label: "Trống", className: "bg-green-100 text-green-700" },
      OCCUPIED: { label: "Đã Thuê", className: "bg-blue-100 text-blue-700" },
      MAINTENANCE: { label: "Bảo Trì", className: "bg-orange-100 text-orange-700" },
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

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async () => {
    if (!landlordId || !formData.roomNumber || !formData.price) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Check if building exists
    if (!formData.buildingId) {
      toast.error("Vui lòng tạo tòa nhà trước khi thêm phòng");
      return;
    }

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, landlordId }),
      });

      if (response.ok) {
        toast.success("Tạo phòng thành công!");
        setIsCreateDialogOpen(false);
        setFormData({
          buildingId: buildings.length > 0 ? buildings[0].id : "",
          roomNumber: "",
          floor: 1,
          area: 0,
          price: 0,
          deposit: 0,
          description: "",
          status: "AVAILABLE",
        });
        fetchRooms(landlordId);
      } else {
        const error = await response.json();
        toast.error(error.error || "Không thể tạo phòng");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleEdit = async () => {
    if (!landlordId || !selectedRoom) return;

    try {
      const response = await fetch(`/api/rooms/${selectedRoom.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, landlordId }),
      });

      if (response.ok) {
        toast.success("Cập nhật phòng thành công!");
        setIsEditDialogOpen(false);
        fetchRooms(landlordId);
      } else {
        const error = await response.json();
        toast.error(error.error || "Không thể cập nhật phòng");
      }
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleDelete = async (room: any) => {
    if (room.status === "OCCUPIED") {
      toast.error("Không thể xóa phòng đang có người thuê!");
      return;
    }

    if (!landlordId) return;

    if (!confirm("Bạn có chắc chắn muốn xóa phòng này?")) return;

    try {
      const response = await fetch(`/api/rooms/${room.id}?landlordId=${landlordId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Xóa phòng thành công!");
        fetchRooms(landlordId);
      } else {
        const error = await response.json();
        toast.error(error.error || "Không thể xóa phòng");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Đã xảy ra lỗi");
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Phòng Trọ</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý phòng trọ theo tòa nhà hoặc dãy trọ
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Phòng
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Phòng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo số phòng, tòa nhà, dãy trọ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="AVAILABLE">Trống</SelectItem>
                <SelectItem value="OCCUPIED">Đã Thuê</SelectItem>
                <SelectItem value="MAINTENANCE">Bảo Trì</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Số Phòng</TableHead>
                  <TableHead>Tòa Nhà</TableHead>
                  <TableHead className="text-center">Tầng</TableHead>
                  <TableHead className="text-center">Diện Tích</TableHead>
                  <TableHead className="text-right">Giá Thuê</TableHead>
                  <TableHead className="text-center">Trạng Thái</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <DoorOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        {searchQuery || statusFilter !== "all"
                          ? "Không tìm thấy phòng nào"
                          : "Chưa có phòng nào"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">
                        {room.roomNumber}
                      </TableCell>
                      <TableCell>{room.building?.name || "N/A"}</TableCell>
                      <TableCell className="text-center">{room.floor}</TableCell>
                      <TableCell className="text-center">{room.area} m²</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(room.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(room.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRoom(room);
                              setFormData({
                                buildingId: room.buildingId,
                                roomNumber: room.roomNumber,
                                floor: room.floor,
                                area: room.area,
                                price: room.price,
                                deposit: room.deposit || 0,
                                description: room.description || "",
                                status: room.status || "AVAILABLE",
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(room)}
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
            <DialogTitle>Thêm Phòng Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin phòng trọ mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Building Selection - Smart Display */}
            {buildings.length === 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-medium text-orange-900">
                  ⚠️ Chưa có tòa nhà
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Vui lòng tạo tòa nhà trước khi thêm phòng
                </p>
              </div>
            )}
            
            {buildings.length === 1 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  🏢 Tòa nhà: {buildings[0].name}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  📍 {buildings[0].address}
                </p>
              </div>
            )}
            
            {buildings.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="building">Tòa Nhà / Dãy Trọ</Label>
                <Select 
                  value={formData.buildingId} 
                  onValueChange={(value) => setFormData({ ...formData, buildingId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tòa nhà hoặc dãy trọ" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{building.name}</span>
                          <span className="text-xs text-muted-foreground">{building.address}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Số Phòng / Mã Phòng</Label>
                <Input
                  id="roomNumber"
                  placeholder="101, P1, A, ..."
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  VD: 101, 201, P1, A, B...
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Tầng</Label>
                <Input
                  id="floor"
                  type="number"
                  placeholder="1"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                />
                <p className="text-xs text-muted-foreground">
                  Để 1 nếu là dãy ngang
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Diện Tích (m²)</Label>
                <Input
                  id="area"
                  type="number"
                  placeholder="20"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá Thuê (VNĐ)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="2500000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit">Tiền Cọc (VNĐ)</Label>
              <Input
                id="deposit"
                type="number"
                placeholder="5000000"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={buildings.length === 0}>
              Tạo Phòng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Phòng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin phòng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-roomNumber">Số Phòng</Label>
              <Input
                id="edit-roomNumber"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-floor">Tầng</Label>
                <Input
                  id="edit-floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-area">Diện Tích (m²)</Label>
                <Input
                  id="edit-area"
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Giá Thuê (VNĐ)</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Trạng Thái</Label>
              <Select value={selectedRoom?.status} onValueChange={(value) => setFormData({ ...formData, status: value as RoomStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Trống</SelectItem>
                  <SelectItem value="OCCUPIED">Đã Thuê</SelectItem>
                  <SelectItem value="MAINTENANCE">Bảo Trì</SelectItem>
                </SelectContent>
              </Select>
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
