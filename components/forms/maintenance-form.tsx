"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const maintenanceSchema = z.object({
  roomId: z.string().min(1, "Vui lòng chọn phòng"),
  title: z.string().min(1, "Tiêu đề là bắt buộc").max(200, "Tiêu đề quá dài"),
  description: z.string().min(1, "Mô tả là bắt buộc").max(1000, "Mô tả quá dài"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

type Room = {
  id: string;
  roomNumber: string;
  building: { name: string };
};

type MaintenanceFormProps = {
  rooms?: Room[];
  initialData?: Partial<MaintenanceFormData>;
  onSubmit: (data: MaintenanceFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  isTenant?: boolean;
};

export function MaintenanceForm({
  rooms = [],
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Gửi",
  isTenant = false,
}: MaintenanceFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      priority: "MEDIUM",
      ...initialData,
    },
  });

  const selectedRoomId = watch("roomId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isTenant && rooms.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="roomId">
            Phòng <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedRoomId}
            onValueChange={(value) => setValue("roomId", value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn phòng" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">Phòng {room.roomNumber}</span>
                    <span className="text-xs text-muted-foreground">
                      {room.building.name}
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
      )}

      <div className="space-y-2">
        <Label htmlFor="title">
          Tiêu Đề <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="VD: Điện không hoạt động, Nước rò rỉ..."
          {...register("title")}
          disabled={isLoading}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {!isTenant && (
        <div className="space-y-2">
          <Label htmlFor="priority">Mức Độ Ưu Tiên</Label>
          <Select
            value={watch("priority")}
            onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") => setValue("priority", value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Thấp
                </span>
              </SelectItem>
              <SelectItem value="MEDIUM">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                  Trung Bình
                </span>
              </SelectItem>
              <SelectItem value="HIGH">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  Cao
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">
          Mô Tả Chi Tiết <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Mô tả chi tiết vấn đề cần sửa chữa..."
          rows={6}
          {...register("description")}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Vui lòng mô tả chi tiết để chúng tôi có thể hỗ trợ tốt nhất
        </p>
      </div>

      {isTenant && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            ℹ️ Yêu cầu của bạn sẽ được gửi đến chủ nhà và xử lý trong thời gian sớm nhất
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang gửi..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
