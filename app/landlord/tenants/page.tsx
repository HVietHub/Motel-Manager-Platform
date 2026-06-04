"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Plus,
  Search,
  UserPlus,
  Users,
  Trash2,
  ArrowRightLeft,
  FileText,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { useLandlordId } from "@/hooks/auth/use-landlord-id";

type Building = {
  id: string;
  name: string;
};

type Room = {
  id: string;
  roomNumber: string;
  price: number;
  building?: Building | null;
};

type Contract = {
  id: string;
  status: string;
};

type PaymentSummary = {
  status: "PAID" | "UNPAID" | "OVERDUE" | "NO_INVOICE";
  unpaidInvoiceCount: number;
  overdueInvoiceCount: number;
  currentMonth: number;
  currentYear: number;
};

type Tenant = {
  id: string;
  phone?: string | null;
  idCard?: string | null;
  address?: string | null;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  room?: Room | null;
  contracts?: Contract[];
  paymentSummary?: PaymentSummary;
};

export default function TenantsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignRoomDialogOpen, setIsAssignRoomDialogOpen] = useState(false);
  const [isChangeRoomDialogOpen, setIsChangeRoomDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const landlordId = useLandlordId();
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [availableRoomsForCreate, setAvailableRoomsForCreate] = useState<Room[]>([]);
  const [newTenant, setNewTenant] = useState({
    name: "",
    email: "",
    phone: "",
    idCard: "",
    address: "",
  });

  useEffect(() => {
    if (landlordId) {
      fetchTenants(landlordId);
      fetchAvailableRooms(landlordId);
      fetchBuildings(landlordId);
    } else {
      setIsLoading(false);
    }
  }, [landlordId]);

  const fetchTenants = async (id: string) => {
    try {
      const res = await fetch(`/api/tenants?landlordId=${id}`);
      if (res.ok) setTenants(await res.json());
    } catch {
      toast.error("Không thể tải danh sách người thuê");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableRooms = async (id: string) => {
    try {
      const res = await fetch(`/api/rooms?landlordId=${id}&status=AVAILABLE`);
      if (res.ok) setRooms(await res.json());
    } catch {
      console.error("Error fetching rooms");
    }
  };

  const fetchBuildings = async (id: string) => {
    try {
      const res = await fetch(`/api/buildings?landlordId=${id}`);
      if (res.ok) setBuildings(await res.json());
    } catch {
      console.error("Error fetching buildings");
    }
  };

  const fetchRoomsByBuilding = async (buildingId: string) => {
    if (!landlordId) return;
    try {
      const res = await fetch(
        `/api/rooms?landlordId=${landlordId}&buildingId=${buildingId}&status=AVAILABLE`
      );
      if (res.ok) setAvailableRoomsForCreate(await res.json());
    } catch {
      console.error("Error fetching rooms by building");
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone?.includes(searchQuery)
  );

  const resetCreateForm = () => {
    setNewTenant({
      name: "",
      email: "",
      phone: "",
      idCard: "",
      address: "",
    });
    setSelectedRoomId("");
    setSelectedBuildingId("");
    setAvailableRoomsForCreate([]);
  };

  const handleCreateTenant = async () => {
    if (!landlordId) return;

    if (!newTenant.name || !newTenant.email || !newTenant.phone) {
      toast.error("Vui lòng nhập đầy đủ họ tên, email và số điện thoại");
      return;
    }

    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlordId,
          ...newTenant,
          roomId: selectedRoomId || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Đã thêm người thuê và tạo tài khoản đăng nhập!");
        setIsCreateDialogOpen(false);
        resetCreateForm();
        fetchTenants(landlordId);
        fetchAvailableRooms(landlordId);
      } else {
        toast.error(data.error || "Không thể thêm người thuê");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleAssignRoom = async () => {
    if (!landlordId || !selectedTenant || !selectedRoomId) {
      toast.error("Vui lòng chọn phòng");
      return;
    }
    try {
      const res = await fetch(`/api/tenants/${selectedTenant.id}/assign-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landlordId, roomId: selectedRoomId }),
      });
      if (res.ok) {
        toast.success("Gán phòng thành công!");
        setIsAssignRoomDialogOpen(false);
        setSelectedRoomId("");
        fetchTenants(landlordId);
        fetchAvailableRooms(landlordId);
      } else {
        const err = await res.json();
        toast.error(err.error || "Không thể gán phòng");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleChangeRoom = async () => {
    if (!landlordId || !selectedTenant || !selectedRoomId) {
      toast.error("Vui lòng chọn phòng");
      return;
    }
    try {
      const res = await fetch(`/api/tenants/${selectedTenant.id}/assign-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landlordId, roomId: selectedRoomId }),
      });
      if (res.ok) {
        toast.success("Chuyển phòng thành công!");
        setIsChangeRoomDialogOpen(false);
        setSelectedRoomId("");
        fetchTenants(landlordId);
        fetchAvailableRooms(landlordId);
      } else {
        const err = await res.json();
        toast.error(err.error || "Không thể chuyển phòng");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleDelete = async () => {
    if (!landlordId || !selectedTenant) return;

    const hasActiveContract = selectedTenant.contracts?.some(
      (c) => c.status === "ACTIVE"
    );
    if (hasActiveContract) {
      toast.error(
        "Không thể xóa người thuê đang có hợp đồng hiệu lực. Vui lòng kết thúc hợp đồng trước."
      );
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      const res = await fetch(`/api/tenants/${selectedTenant.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landlordId }),
      });
      if (res.ok) {
        toast.success("Đã xóa người thuê!");
        setIsDeleteDialogOpen(false);
        fetchTenants(landlordId);
        fetchAvailableRooms(landlordId);
      } else {
        const err = await res.json();
        toast.error(err.error || "Không thể xóa người thuê");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const fmt = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Người Thuê</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý người thuê và cấp tài khoản đăng nhập cho người thuê
          </p>
        </div>
        <Button
          onClick={() => {
            resetCreateForm();
            setIsCreateDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm Người Thuê
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Người Thuê ({tenants.length})</CardTitle>
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

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ Tên</TableHead>
                  <TableHead>Tài Khoản</TableHead>
                  <TableHead>Số Điện Thoại</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead className="text-center">Trạng Thái</TableHead>
                  <TableHead className="text-center">Thanh Toán</TableHead>
                  <TableHead className="text-right">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Đang tải danh sách người thuê...
                    </TableCell>
                  </TableRow>
                ) : filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "Không tìm thấy người thuê nào" : "Chưa có người thuê nào"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.user?.name || "N/A"}</TableCell>
                      <TableCell>{tenant.user?.email || "N/A"}</TableCell>
                      <TableCell>{tenant.phone}</TableCell>
                      <TableCell>
                        {tenant.room ? (
                          <div>
                            <div className="font-medium">{tenant.room.roomNumber}</div>
                            <div className="text-xs text-muted-foreground">
                              {tenant.room.building?.name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Chưa gán</span>
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
                          <Badge className="bg-green-100 text-green-700" variant="secondary">Đã Đóng</Badge>
                        ) : tenant.paymentSummary?.status === "OVERDUE" ? (
                          <Badge className="bg-orange-100 text-orange-700" variant="secondary">Còn Nợ</Badge>
                        ) : tenant.paymentSummary?.status === "UNPAID" ? (
                          <Badge className="bg-red-100 text-red-700" variant="secondary">Chưa Đóng</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Xem hợp đồng"
                            onClick={() =>
                              router.push(`/landlord/contracts?tenantId=${tenant.id}`)
                            }
                          >
                            <FileText className="h-4 w-4 text-indigo-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Xem hóa đơn"
                            onClick={() =>
                              router.push(`/landlord/invoices?tenantId=${tenant.id}`)
                            }
                          >
                            <Receipt className="h-4 w-4 text-teal-600" />
                          </Button>
                          {tenant.room ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Chuyển phòng"
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setSelectedRoomId("");
                                setIsChangeRoomDialogOpen(true);
                              }}
                            >
                              <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Gán phòng"
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setSelectedRoomId("");
                                setIsAssignRoomDialogOpen(true);
                              }}
                            >
                              <UserPlus className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Xóa người thuê"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setIsDeleteDialogOpen(true);
                            }}
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
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Người Thuê</DialogTitle>
            <DialogDescription>
              Chủ nhà tạo hồ sơ, tài khoản và mật khẩu để cấp cho người thuê đăng nhập.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tenantName">Họ Tên</Label>
                <Input
                  id="tenantName"
                  placeholder="Nguyễn Văn A"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenantPhone">Số Điện Thoại</Label>
                <Input
                  id="tenantPhone"
                  placeholder="0901234567"
                  value={newTenant.phone}
                  onChange={(e) => setNewTenant((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantEmail">Email / Tài Khoản Đăng Nhập</Label>
              <Input
                id="tenantEmail"
                type="email"
                placeholder="tenant@example.com"
                value={newTenant.email}
                onChange={(e) => setNewTenant((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                ℹ️ Mật khẩu mặc định là <strong>123456</strong>. Người thuê có thể đổi mật khẩu sau khi đăng nhập.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tenantIdCard">CCCD/CMND</Label>
                <Input
                  id="tenantIdCard"
                  placeholder="Tùy chọn"
                  value={newTenant.idCard}
                  onChange={(e) => setNewTenant((prev) => ({ ...prev, idCard: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenantAddress">Địa Chỉ</Label>
                <Input
                  id="tenantAddress"
                  placeholder="Tùy chọn"
                  value={newTenant.address}
                  onChange={(e) => setNewTenant((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tòa Nhà</Label>
              <Select
                value={selectedBuildingId}
                onValueChange={(v) => {
                  setSelectedBuildingId(v);
                  setSelectedRoomId("");
                  fetchRoomsByBuilding(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tòa nhà nếu muốn gán phòng ngay" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedBuildingId && (
              <div className="space-y-2">
                <Label>Phòng Trống</Label>
                <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng trống" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoomsForCreate.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">Không có phòng trống</div>
                    ) : (
                      availableRoomsForCreate.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          Phòng {r.roomNumber} — {fmt(r.price)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleCreateTenant}>Thêm Người Thuê</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignRoomDialogOpen} onOpenChange={setIsAssignRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gán Phòng</DialogTitle>
            <DialogDescription>
              Chọn phòng cho: <strong>{selectedTenant?.user?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Phòng Trống</Label>
              <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                <SelectTrigger><SelectValue placeholder="Chọn phòng trống" /></SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.building?.name} — Phòng {r.roomNumber} — {fmt(r.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignRoomDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleAssignRoom}>Gán Phòng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangeRoomDialogOpen} onOpenChange={setIsChangeRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chuyển Phòng</DialogTitle>
            <DialogDescription>
              Người thuê: <strong>{selectedTenant?.user?.name}</strong>
              <br />
              Phòng hiện tại: {selectedTenant?.room?.building?.name} — Phòng{" "}
              {selectedTenant?.room?.roomNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Phòng Mới</Label>
              <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                <SelectTrigger><SelectValue placeholder="Chọn phòng trống" /></SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.building?.name} — Phòng {r.roomNumber} — {fmt(r.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeRoomDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleChangeRoom}>Chuyển Phòng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác Nhận Xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa người thuê <strong>{selectedTenant?.user?.name}</strong>?
              <br />
              <span className="text-red-600 font-semibold">Hành động này không thể hoàn tác!</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa Người Thuê</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}