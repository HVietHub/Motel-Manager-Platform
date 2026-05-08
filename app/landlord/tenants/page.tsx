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
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useLandlordId } from "@/hooks/auth/use-landlord-id";

export default function TenantsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"accepted" | "pending">("accepted");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isAssignRoomDialogOpen, setIsAssignRoomDialogOpen] = useState(false);
  const [isChangeRoomDialogOpen, setIsChangeRoomDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [pendingTenants, setPendingTenants] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const landlordId = useLandlordId();
  const [inviteUserCode, setInviteUserCode] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [availableRoomsForInvite, setAvailableRoomsForInvite] = useState<any[]>([]);

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

  const fetchPendingTenants = async (id: string) => {
    try {
      const res = await fetch(`/api/tenants/pending?landlordId=${id}`);
      if (res.ok) setPendingTenants(await res.json());
    } catch {
      console.error("Error fetching pending tenants");
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
      if (res.ok) setAvailableRoomsForInvite(await res.json());
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
      const res = await fetch("/api/tenants/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landlordId, userCode: inviteUserCode, roomId: selectedRoomId }),
      });
      if (res.ok) {
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
        const err = await res.json();
        toast.error(err.error || "Không thể mời người thuê");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    }
  };

  const handleCancelInvite = async (tenant: any) => {
    if (!landlordId) return;
    try {
      const res = await fetch("/api/tenants/invite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: tenant.id, landlordId }),
      });
      if (res.ok) {
        toast.success("Đã hủy lời mời!");
        fetchPendingTenants(landlordId);
      } else {
        const err = await res.json();
        toast.error(err.error || "Không thể hủy lời mời");
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

    // Block delete if active contract exists
    const hasActiveContract = selectedTenant.contracts?.some(
      (c: any) => c.status === "ACTIVE"
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Người Thuê</h1>
          <p className="text-muted-foreground mt-1">Quản lý thông tin người thuê trọ</p>
        </div>
        <Button
          onClick={() => {
            setInviteUserCode("");
            setSelectedRoomId("");
            setSelectedBuildingId("");
            setAvailableRoomsForInvite([]);
            setIsInviteDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Mời Người Thuê
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
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

          {/* ── Accepted tab ── */}
          {activeTab === "accepted" ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số Điện Thoại</TableHead>
                    <TableHead>Phòng</TableHead>
                    <TableHead className="text-center">Trạng Thái</TableHead>
                    <TableHead className="text-center">Thanh Toán</TableHead>
                    <TableHead className="text-right">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.length === 0 ? (
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
                            {/* Xem hợp đồng */}
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
                            {/* Xem hóa đơn */}
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
                            {/* Gán / Chuyển phòng */}
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
                                  setIsAssignRoomDialogOpen(true);
                                }}
                              >
                                <UserPlus className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {/* Xóa */}
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
          ) : (
            /* ── Pending tab ── */
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số Điện Thoại</TableHead>
                    <TableHead className="text-center">Trạng Thái</TableHead>
                    <TableHead className="text-right">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTenants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Không có lời mời đang chờ</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingTenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell className="font-medium">{tenant.user?.name || "N/A"}</TableCell>
                        <TableCell>{tenant.user?.email || "N/A"}</TableCell>
                        <TableCell>{tenant.phone}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-orange-100 text-orange-700" variant="secondary">
                            Đang Chờ Phản Hồi
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Hủy lời mời"
                            onClick={() => handleCancelInvite(tenant)}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
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

      {/* ── Invite Dialog ── */}
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
              <Label htmlFor="inviteUserCode">Mã Người Dùng</Label>
              <Input
                id="inviteUserCode"
                placeholder="TN001"
                value={inviteUserCode}
                onChange={(e) => setInviteUserCode(e.target.value.toUpperCase())}
              />
              <p className="text-xs text-muted-foreground">Mã có dạng TN001, TN002, ...</p>
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
                  <SelectValue placeholder="Chọn tòa nhà" />
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
                    {availableRoomsForInvite.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">Không có phòng trống</div>
                    ) : (
                      availableRoomsForInvite.map((r) => (
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
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleInvite}>Mời Người Thuê</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Assign Room Dialog ── */}
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

      {/* ── Change Room Dialog ── */}
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

      {/* ── Delete Dialog ── */}
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
