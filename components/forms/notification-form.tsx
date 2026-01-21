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

const notificationSchema = z.object({
  tenantId: z.string().min(1, "Vui lòng chọn người nhận"),
  title: z.string().min(1, "Tiêu đề là bắt buộc").max(200, "Tiêu đề quá dài"),
  message: z.string().min(1, "Nội dung là bắt buộc").max(1000, "Nội dung quá dài"),
});

export type NotificationFormData = z.infer<typeof notificationSchema>;

type Tenant = {
  id: string;
  user: { name: string; email: string };
  room: { roomNumber: string; building: { name: string } } | null;
};

type NotificationFormProps = {
  tenants: Tenant[];
  onSubmit: (data: NotificationFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  allowBroadcast?: boolean;
};

export function NotificationForm({
  tenants,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Gửi",
  allowBroadcast = true,
}: NotificationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
  });

  const selectedTenantId = watch("tenantId");
  const isBroadcast = selectedTenantId === "all";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tenantId">
          Người Nhận <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedTenantId}
          onValueChange={(value) => setValue("tenantId", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn người nhận" />
          </SelectTrigger>
          <SelectContent>
            {allowBroadcast && (
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <span className="font-medium">📢 Tất cả người thuê</span>
                </div>
              </SelectItem>
            )}
            {tenants.map((tenant) => (
              <SelectItem key={tenant.id} value={tenant.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{tenant.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tenant.room
                      ? `Phòng ${tenant.room.roomNumber} - ${tenant.room.building.name}`
                      : "Chưa có phòng"}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.tenantId && (
          <p className="text-sm text-destructive">{errors.tenantId.message}</p>
        )}
        {isBroadcast && (
          <p className="text-xs text-blue-600">
            ℹ️ Thông báo sẽ được gửi đến tất cả {tenants.length} người thuê
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          Tiêu Đề <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="VD: Thông báo cắt điện, Thông báo tăng giá..."
          {...register("title")}
          disabled={isLoading}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Nội Dung <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          placeholder="Nhập nội dung thông báo..."
          rows={6}
          {...register("message")}
          disabled={isLoading}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Tối đa 1000 ký tự
        </p>
      </div>

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
