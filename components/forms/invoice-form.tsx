"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
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

const invoiceSchema = z.object({
  tenantId: z.string().min(1, "Vui lòng chọn người thuê"),
  month: z.number().int().min(1, "Tháng phải >= 1").max(12, "Tháng phải <= 12"),
  year: z.number().int().min(2020, "Năm không hợp lệ").max(2100, "Năm không hợp lệ"),
  roomPrice: z.number().min(0, "Tiền phòng phải >= 0"),
  electricityPrice: z.number().min(0, "Tiền điện phải >= 0"),
  waterPrice: z.number().min(0, "Tiền nước phải >= 0"),
  servicePrice: z.number().min(0, "Phí dịch vụ phải >= 0").optional(),
  otherFees: z.number().min(0, "Phí khác phải >= 0").optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

type Tenant = {
  id: string;
  user: { name: string; email: string };
  room: { roomNumber: string; price: number; building: { name: string } } | null;
};

type InvoiceFormProps = {
  tenants: Tenant[];
  initialData?: Partial<InvoiceFormData>;
  onSubmit: (data: InvoiceFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
};

export function InvoiceForm({
  tenants,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Lưu",
}: InvoiceFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      servicePrice: 0,
      otherFees: 0,
      ...initialData,
    },
  });

  const selectedTenantId = watch("tenantId");
  const roomPrice = watch("roomPrice") || 0;
  const electricityPrice = watch("electricityPrice") || 0;
  const waterPrice = watch("waterPrice") || 0;
  const servicePrice = watch("servicePrice") || 0;
  const otherFees = watch("otherFees") || 0;

  const total = roomPrice + electricityPrice + waterPrice + servicePrice + otherFees;

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  // Auto-fill room price when tenant is selected
  useEffect(() => {
    if (selectedTenant?.room && !initialData?.roomPrice) {
      setValue("roomPrice", selectedTenant.room.price);
    }
  }, [selectedTenant, setValue, initialData]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tenantId">
          Người Thuê <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedTenantId}
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="month">
            Tháng <span className="text-destructive">*</span>
          </Label>
          <Input
            id="month"
            type="number"
            min="1"
            max="12"
            {...register("month")}
            disabled={isLoading}
          />
          {errors.month && (
            <p className="text-sm text-destructive">{errors.month.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">
            Năm <span className="text-destructive">*</span>
          </Label>
          <Input
            id="year"
            type="number"
            {...register("year")}
            disabled={isLoading}
          />
          {errors.year && (
            <p className="text-sm text-destructive">{errors.year.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="roomPrice">
          Tiền Phòng (VNĐ) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="roomPrice"
          type="number"
          placeholder="2500000"
          {...register("roomPrice")}
          disabled={isLoading}
        />
        {errors.roomPrice && (
          <p className="text-sm text-destructive">{errors.roomPrice.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="electricityPrice">
            Tiền Điện (VNĐ) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="electricityPrice"
            type="number"
            placeholder="500000"
            {...register("electricityPrice")}
            disabled={isLoading}
          />
          {errors.electricityPrice && (
            <p className="text-sm text-destructive">{errors.electricityPrice.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="waterPrice">
            Tiền Nước (VNĐ) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="waterPrice"
            type="number"
            placeholder="100000"
            {...register("waterPrice")}
            disabled={isLoading}
          />
          {errors.waterPrice && (
            <p className="text-sm text-destructive">{errors.waterPrice.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="servicePrice">Phí Dịch Vụ (VNĐ)</Label>
          <Input
            id="servicePrice"
            type="number"
            placeholder="0"
            {...register("servicePrice")}
            disabled={isLoading}
          />
          {errors.servicePrice && (
            <p className="text-sm text-destructive">{errors.servicePrice.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="otherFees">Phí Khác (VNĐ)</Label>
          <Input
            id="otherFees"
            type="number"
            placeholder="0"
            {...register("otherFees")}
            disabled={isLoading}
          />
          {errors.otherFees && (
            <p className="text-sm text-destructive">{errors.otherFees.message}</p>
          )}
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Tổng Cộng:</span>
          <span className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(total)}
          </span>
        </div>
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
