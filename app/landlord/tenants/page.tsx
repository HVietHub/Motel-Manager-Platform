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
import { Plus, Search, Pencil, UserPlus, UserMinus, Users, Eye, EyeOff, Trash2, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { useLandlordId } from "@/hooks/use-landlord-id";

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"accepted" | "pending">("accepted");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignRoomDialogOpen, setIsAssignRoomDialogOpen] = useState(false);
  const [isChangeRoomDialogOpen, setIsChangeRoomDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [pendingTenants, setPendingTenants] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const landlordId = useLandlordId();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    idCard: "",
  });
  const [inviteUserCode, setInviteUserCode] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [availableRoomsForInvite, setAvailableRoomsForInvite] = useState<any[]>([]);
  const [visibleTenantIds, setVisibleTenantIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (landlordId) {
      fetchTenants(landlordId);
      fetchPendingTenants(landlordId);
      fetchAvailableRooms(landlordId);
      fetchBuildings(landlordId);
    } else {
      setIsLoading(false);
    }
  }, [landlordId]);

  const fetchTenants = async (landlordId: string) => {
    try {
      const response = await fetch(`/api/tenants?landlordId=${landlordId}`);
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
      toast.error("Không thể tải danh sách người thuê");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingTenants = async (landlordId: string) => {
    try {
      const response = await fetch(`/api/tenants/pending?landlordId=${landlordId}`);
      if (response.ok) {
        const data = await response.json();
        setPendingTenants(data);
      }
    } catch (error) {
      console.error("Error fetching pending tenants:", error);
    }
  };

  const fetchAvailableRooms = async (landlordId: string) => {
    try {
      const response = await fetch(`/api/rooms?landlordId=${landlordId}&status=AVAILABLE`);
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchBuildings = async (landlordId: string) => {
    try {
      const response = await fetch(`/api/buildings?landlordId=${landlordId}`);
      if (response.ok) {
        const data = await response.json();
        setBuildings(data);
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  };

  const fetchRoomsByBuilding = async (buildingId: string) => {
    if (!landlordId) return;
    try {
      const response = await fetch(`/api/rooms?landlordId=${landlordId}&buildingId=${buildingId}&status=AVAILABLE`);
      if (response.ok) {
        const data = await response.json();
        setAvailableRoomsForInvite(data);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const filteredTenants = tenants.filter((tenant) =>
    tenant.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.phone.includes(searchQuery)
  );

  const handleCreate = async () => {
    toast.error("Vui lòng sử dụng chức năng 'Mời Người Thuê' để thêm người thuê đã có tài khoản");
  };

  const handleInvite = async () => {
    if (!landlordId || !inviteUserCode) {
      toast.error("Vui lòng nhập mã người dùng");
      return;
    }

    if (!selectedRoomId) {
      toast.error("Vui lòng chọn phòng");
      return;
    }

    try {
      const response = await fetch("/api/tenants/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landlordId, userCode: inviteUserCode, roomId: selectedRoomId }),
      });

      if (response.ok) {
        toast.success("Đã gửi lời mời cho người thuê!");
        setIsInviteDialogOpen(false);
        setInviteUserCode("");
        setSelectedRoomId("");
        setSelectedBuildingId("");
        setAvailableRoomsForInvite([]);
        fetchPendingTenants(landlordId);
        fetchAvailableRooms(landlordId);
        setActiveTab("pending");
      } else {
        const error = await response.json();
        toast.error(error.error || "Không thể mời người thuê");
      }
    } catch (error) {
      console.error("Error inviting tenant:", error);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleEdit = async () => {
    if (!landlordId || !selectedTenant) return;

    try {
      const response = await fetch(`/api/tenants/${selectedTenant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, landlordId }),
      });

      if (response.ok) {
        toast.success("Cập nhật thông tin người thuê thành công!");
        setIsEditDialogOpen(false);
        fetchTenants(landlordId);
      } else {
        const error = await response.json();
        toast.error(error.error || "Không thể cập nhật người thuê");
      }
    } catch (error) {
      console.error("Error updating tenant:", error);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleChangeRoom = async () => {
    if (!landlordId || !selectedTenant || !selectedRoomId) {
      toast.error("Vui lòng chọn phòng");
      return;
    }

    try {
      const response = await fetch(`/api/tenants/${selectedTenant.id}/assign-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landlordId, roomId: selectedRoomId }),
      });

      if (response.ok) {
        toast.success("Chuyển phòng thành công!");
        setIsChangeRoomDialogOpen(false);
        setSelectedRoomId("");
        fetchTenants(landlordId);
        fetchAvailableRooms(landlordId);
      } else {
        const error = await response.json();
        toast.error(error.error || "Không thể chuyển phòng");
      }
    } catch (error) {
      console.error("Error changing room:", error);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleDelete = async () => {
    if (!landlordId || !selectedTenant) return;

    try {
      const response = await fetch(`/api/tenants/${selectedTenant.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landlordId }),
      });

      if (response.ok) {
        toast.success("Đã xóa người thuê!");
        setIsDeleteDialogOpen(false);
        fetchTenants(landlordId);
        fetchAvailableRooms(landlordId);
      } else {
        const error = await response.json();
        toast.error(error.error || "Không thể xóa người thuê");
      }
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleAssignRoom = async () => {
    if (!landlordId || !selectedTenant || !selectedRoomId) {
      toast.error("Vui lòng chọn phòng");
      return;
    }

    try {
      const response = await fetch(`/api/tenants/${selectedTenant.id}/assign-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landlordId, roomId: selectedRoomId }),
      });

      if (response.ok) {
        toast.success("Gán phòng thành công!");
        setIsAssignRoomDialogOpen(false);
        setSelectedRoomId("");
        fetchTenants(landlordId);
        fetchAvailableRooms(landlordId);
      } else {
        const error = await response.json();
        toast.error(error.error || "Không thể gán phòng");
      }
    } catch (error) {
      console.error("Error assigning room:", error);
      toast.error("Đã xảy ra lỗi");
    }
  };

  const toggleTenantVisibility = (tenantId: string) => {
    setVisibleTenantIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tenantId)) {
        newSet.delete(tenantId);
      } else {
        newSet.add(tenantId);
      }
      return newSet;
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Người Thuê</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý thông tin người thuê trọ
          </p>
        </div>
        <Button onClick={() => {
          setInviteUserCode("");
          setSelectedRoomId("");
          setSelectedBuildingId("");
          setAvailableRoomsForInvite([]);
          setIsInviteDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Mời Người Thuê
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh Sách Người Thuê</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "accepted" ? "default" : "outline"}
                onClick={() => setActiveTab("accepted")}
              >
                Đã Chấp Nhận ({tenants.length})
              </Button>
              <Button
                variant={activeTab === "pending" ? "default" : "outline"}
                onClick={() => setActiveTab("pending")}
              >
                Đang Chờ ({pendingTenants.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Table */}
          {activeTab === "accepted" ? (
            <div className="border rounded-lg">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số Điện Thoại</TableHead>
                  <TableHead>CMND/CCCD</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Thời Gian Thuê</TableHead>
                  <TableHead className="text-center">Trạng Thái Thuê</TableHead>
                  <TableHead className="text-center">Thanh Toán</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        {searchQuery
                          ? "Không tìm thấy người thuê nào"
                          : "Chưa có người thuê nào"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">
                        {tenant.user?.name || "N/A"}
                      </TableCell>
                      <TableCell>{tenant.user?.email || "N/A"}</TableCell>
                      <TableCell>
                        {visibleTenantIds.has(tenant.id) ? tenant.phone : "••••••••"}
                      </TableCell>
                      <TableCell>
                        {visibleTenantIds.has(tenant.id) ? (tenant.idCard || "N/A") : "••••••••"}
                      </TableCell>
                      <TableCell>
                        {tenant.room ? (
                          <div>
                            <div className="font-medium">{tenant.room.roomNumber}</div>
                            <div className="text-xs text-muted-foreground">
                              {tenant.room.building?.name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Chưa gán</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {tenant.contracts && tenant.contracts.length > 0 ? (
                          <div className="text-sm">
                            <div>
                              {new Date(tenant.contracts[0].startDate).toLocaleDateString("vi-VN")}
                            </div>
                            <div className="text-muted-foreground">
                              đến {new Date(tenant.contracts[0].endDate).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Chưa có hợp đồng</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {tenant.room ? (
                          <Badge className="bg-blue-100 text-blue-700" variant="secondary">
                            Đang Thuê
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700" variant="secondary">
                            Chưa Thuê
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {tenant.paymentSummary?.status === "PAID" ? (
                          <Badge className="bg-green-100 text-green-700" variant="secondary">
                            Đã Đóng
                          </Badge>
                        ) : tenant.paymentSummary?.status === "OVERDUE" ? (
                          <Badge className="bg-orange-100 text-orange-700" variant="secondary">
                            Còn Nợ
                          </Badge>
                        ) : tenant.paymentSummary?.status === "UNPAID" ? (
                          <Badge className="bg-red-100 text-red-700" variant="secondary">
                            Chưa Đóng
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTenantVisibility(tenant.id)}
                            title={visibleTenantIds.has(tenant.id) ? "Ẩn thông tin" : "Xem thông tin"}
                          >
                            {visibleTenantIds.has(tenant.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setFormData({
                                name: tenant.user?.name || "",
                                email: tenant.user?.email || "",
                                phone: tenant.phone,
                                idCard: tenant.idCard || "",
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {tenant.room ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTenant(tenant);
                                  setSelectedRoomId("");
                                  setIsChangeRoomDialogOpen(true);
                                }}
                                title="Chuyển phòng"
                              >
                                <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTenant(tenant);
                                  setIsDeleteDialogOpen(true);
                                }}
                                title="Xóa người thuê"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setIsAssignRoomDialogOpen(true);
                              }}
                            >
                              <UserPlus className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          ) : (
            // Pending Invitations Table
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số Điện Thoại</TableHead>
                    <TableHead className="text-center">Trạng Thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTenants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          Không có lời mời đang chờ
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingTenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell className="font-medium">
                          {tenant.user?.name || "N/A"}
                        </TableCell>
                        <TableCell>{tenant.user?.email || "N/A"}</TableCell>
                        <TableCell>{tenant.phone}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-orange-100 text-orange-700" variant="secondary">
                            Đang Chờ Phản Hồi
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mời Người Thuê</DialogTitle>
            <DialogDescription>
              Nhập mã người dùng và chọn phòng để mời người thuê vào quản lý.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inviteUserCode">Mã Người Dùng (User ID)</Label>
              <Input
                id="inviteUserCode"
                type="text"
                placeholder="TN001"
                value={inviteUserCode}
                onChange={(e) => setInviteUserCode(e.target.value.toUpperCase())}
              />
              <p className="text-xs text-muted-foreground">
                Mã người dùng có dạng TN001, TN002, ...
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="building">Tòa Nhà</Label>
              <Select 
                value={selectedBuildingId} 
                onValueChange={(value) => {
                  setSelectedBuildingId(value);
                  setSelectedRoomId("");
                  fetchRoomsByBuilding(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tòa nhà" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBuildingId && (
              <div className="space-y-2">
                <Label htmlFor="room">Phòng Trống</Label>
                <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng trống" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoomsForInvite.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        Không có phòng trống
                      </div>
                    ) : (
                      availableRoomsForInvite.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          Phòng {room.roomNumber} - {formatCurrency(room.price)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleInvite}>Mời Người Thuê</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog - Deprecated */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Người Thuê Mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin người thuê. Mật khẩu sẽ được tự động tạo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ Tên</Label>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nguyenvana@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Số Điện Thoại</Label>
                <Input
                  id="phone"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idCard">CMND/CCCD</Label>
                <Input
                  id="idCard"
                  placeholder="001234567890"
                  value={formData.idCard}
                  onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                />
              </div>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate}>Tạo Người Thuê</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Thông Tin</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin người thuê
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">Họ Tên</Label>
              <Input
                id="edit-fullName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Số Điện Thoại</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-idCard">CMND/CCCD</Label>
                <Input
                  id="edit-idCard"
                  value={formData.idCard}
                  onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                />
              </div>
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

      {/* Assign Room Dialog */}
      <Dialog open={isAssignRoomDialogOpen} onOpenChange={setIsAssignRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gán Phòng</DialogTitle>
            <DialogDescription>
              Chọn phòng cho người thuê: {selectedTenant?.user?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="room">Phòng Trống</Label>
              <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng trống" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.building?.name} - Phòng {room.roomNumber} - {formatCurrency(room.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignRoomDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAssignRoom}>Gán Phòng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Room Dialog */}
      <Dialog open={isChangeRoomDialogOpen} onOpenChange={setIsChangeRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chuyển Phòng</DialogTitle>
            <DialogDescription>
              Chuyển phòng cho người thuê: {selectedTenant?.user?.name}
              <br />
              Phòng hiện tại: {selectedTenant?.room?.building?.name} - Phòng {selectedTenant?.room?.roomNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newRoom">Phòng Mới</Label>
              <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng trống" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.building?.name} - Phòng {room.roomNumber} - {formatCurrency(room.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeRoomDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleChangeRoom}>Chuyển Phòng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác Nhận Xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa người thuê: {selectedTenant?.user?.name}?
              <br />
              <span className="text-red-600 font-semibold">Hành động này không thể hoàn tác!</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa Người Thuê
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
