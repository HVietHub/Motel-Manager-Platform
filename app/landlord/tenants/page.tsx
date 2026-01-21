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
import { Plus, Search, Pencil, UserPlus, UserMinus, Users } from "lucide-react";
import { toast } from "sonner";
import { useLandlordId } from "@/hooks/use-landlord-id";

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"accepted" | "pending">("accepted");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignRoomDialogOpen, setIsAssignRoomDialogOpen] = useState(false);
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
    address: "",
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  useEffect(() => {
    if (landlordId) {
      fetchTenants(landlordId);
      fetchPendingTenants(landlordId);
      fetchAvailableRooms(landlordId);
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

  const filteredTenants = tenants.filter((tenant) =>
    tenant.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.phone.includes(searchQuery)
  );

  const handleCreate = async () => {
    toast.error("Vui lòng sử dụng chức năng 'Mời Người Thuê' để thêm người thuê đã có tài khoản");
  };

  const handleInvite = async () => {
    if (!landlordId || !inviteEmail) {
      toast.error("Vui lòng nhập email người thuê");
      return;
    }

    try {
      const response = await fetch("/api/tenants/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landlordId, email: inviteEmail }),
      });

      if (response.ok) {
        toast.success("Đã gửi lời mời cho người thuê!");
        setIsInviteDialogOpen(false);
        setInviteEmail("");
        fetchPendingTenants(landlordId);
        setActiveTab("pending"); // Switch to pending tab
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
          setInviteEmail("");
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
                  <TableHead className="text-center">Trạng Thái</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
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
                      <TableCell>{tenant.phone}</TableCell>
                      <TableCell>{tenant.idCard || "N/A"}</TableCell>
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
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
                                address: tenant.address || "",
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {!tenant.room && (
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

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mời Người Thuê</DialogTitle>
            <DialogDescription>
              Nhập email của người thuê đã có tài khoản để mời họ vào quản lý của bạn.
              Người thuê cần đăng ký tài khoản trước khi bạn có thể mời họ.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email Người Thuê</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="nguyenvana@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Người thuê phải đã đăng ký tài khoản với vai trò "Người Thuê"
              </p>
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="edit-address">Địa Chỉ</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
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
    </div>
  );
}
