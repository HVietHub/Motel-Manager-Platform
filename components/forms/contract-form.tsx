"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const contractSchema = z.object({
  tenantId: z.string().min(1, "Vui lòng chọn người thuê"),
  roomId: z.string().min(1, "Vui lòng chọn phòng"),
  startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  endDate: z.string().min(1, "Ngày kết thúc là bắt buộc"),
  price: z.number().positive("Giá thuê phải > 0"),
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: "Ngày bắt đầu phải trước ngày kết thúc",
  path: ["endDate"],
});

export type ContractFormData = z.infer<typeof contractSchema>;

type Tenant = {
  id: string;
  user: { name: string; email: string };
  room: { roomNumber: string } | null;
};

type Room = {
  id: string;
  roomNumber: string;
  price: number;
  status: string;
  building: { name: string };
};

type ContractFormProps = {
  tenants: Tenant[];
  rooms: Room[];
  initialData?: Partial<ContractFormData>;
  onSubmit: (data: ContractFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
};

export function ContractForm({
  tenants,
  rooms,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Lưu",
}: ContractFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: initialData,
  });

  const selectedRoomId = watch("roomId");
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  // Auto-fill price when room is selected
  const handleRoomChange = (roomId: string) => {
    setValue("roomId", roomId);
    const room = rooms.find((r) => r.id === roomId);
    if (room && !initialData?.price) {
      setValue("price", room.price);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tenantId">
          Người Thuê <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("tenantId")}
          onValueChange={(value) => setValue("tenantId", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn người thuê" />
          </SelectTrigger>
          <SelectContent>
            {tenants.map((tenant) => (
              <SelectItem key={tenant.id} value={tenant.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{tenant.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tenant.user.email}
                    {tenant.room && ` • Phòng ${tenant.room.roomNumber}`}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.tenantId && (
          <p className="text-sm text-destructive">{errors.tenantId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="roomId">
          Phòng <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedRoomId}
          onValueChange={handleRoomChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn phòng" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                <div className="flex flex-col">
                  <span className="font-medium">
                    Phòng {room.roomNumber} - {room.building.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(room.price)}
                    {room.status === "OCCUPIED" && " • Đã có người"}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.roomId && (
          <p className="text-sm text-destructive">{errors.roomId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">
            Ngày Bắt Đầu <span className="text-destructive">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            {...register("startDate")}
            disabled={isLoading}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">
            Ngày Kết Thúc <span className="text-destructive">*</span>
          </Label>
          <Input
            id="endDate"
            type="date"
            {...register("endDate")}
            disabled={isLoading}
          />
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">
          Giá Thuê (VNĐ) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="price"
          type="number"
          placeholder="2500000"
          {...register("price")}
          disabled={isLoading}
        />
        {errors.price && (
          <p className="text-sm text-destructive">{errors.price.message}</p>
        )}
        {selectedRoom && (
          <p className="text-xs text-muted-foreground">
            Giá phòng hiện tại: {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(selectedRoom.price)}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
