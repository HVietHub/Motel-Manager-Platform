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
  electricityUsage: z.number().min(0, "Số điện không hợp lệ"),
  serviceAmount: z.number().min(0, "Phí dịch vụ phải >= 0").optional(),
  otherAmount: z.number().min(0, "Phí khác phải >= 0").optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

type Tenant = {
  id: string;
  user: { name: string; email: string };
  room: { 
    roomNumber: string; 
    price: number; 
    building: { 
      name: string;
      electricityPrice: number;
      waterPrice: number;
    } 
  } | null;
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
      electricityUsage: 0,
      serviceAmount: 0,
      otherAmount: 0,
      ...initialData,
    },
  });

  const selectedTenantId = watch("tenantId");
  const electricityUsage = watch("electricityUsage") || 0;
  const serviceAmount = watch("serviceAmount") || 0;
  const otherAmount = watch("otherAmount") || 0;

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  // Calculate amounts based on tenant's room and building
  const roomPrice = selectedTenant?.room?.price || 0;
  const electricityPrice = selectedTenant?.room?.building.electricityPrice || 0;
  const waterPrice = selectedTenant?.room?.building.waterPrice || 0;
  const electricityAmount = electricityUsage * electricityPrice;
  const total = roomPrice + electricityAmount + waterPrice + serviceAmount + otherAmount;

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
        <Label htmlFor="electricityUsage">
          Số điện tiêu thụ (kWh) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="electricityUsage"
          type="number"
          min="0"
          step="0.1"
          placeholder="150"
          {...register("electricityUsage", { valueAsNumber: true })}
          disabled={isLoading}
        />
        {errors.electricityUsage && (
          <p className="text-sm text-destructive">{errors.electricityUsage.message}</p>
        )}
        {electricityUsage > 1000 && (
          <p className="text-sm text-yellow-600">⚠️ Số điện tiêu thụ cao (&gt;1000 kWh)</p>
        )}
      </div>

      {selectedTenant?.room && (
        <div className="p-4 bg-blue-50 rounded-lg space-y-2">
          <p className="text-sm font-semibold text-blue-900">Chi tiết tính toán:</p>
          <div className="space-y-1 text-sm text-blue-800">
            <div className="flex justify-between">
              <span>Tiền phòng:</span>
              <span className="font-medium">{roomPrice.toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div className="flex justify-between">
              <span>Tiền điện ({electricityUsage} kWh × {electricityPrice.toLocaleString('vi-VN')} VNĐ/kWh):</span>
              <span className="font-medium">{electricityAmount.toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div className="flex justify-between">
              <span>Tiền nước (cố định):</span>
              <span className="font-medium">{waterPrice.toLocaleString('vi-VN')} VNĐ</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="serviceAmount">Phí Dịch Vụ (VNĐ)</Label>
          <Input
            id="serviceAmount"
            type="number"
            min="0"
            placeholder="0"
            {...register("serviceAmount", { valueAsNumber: true })}
            disabled={isLoading}
          />
          {errors.serviceAmount && (
            <p className="text-sm text-destructive">{errors.serviceAmount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="otherAmount">Phí Khác (VNĐ)</Label>
          <Input
            id="otherAmount"
            type="number"
            min="0"
            placeholder="0"
            {...register("otherAmount", { valueAsNumber: true })}
            disabled={isLoading}
          />
          {errors.otherAmount && (
            <p className="text-sm text-destructive">{errors.otherAmount.message}</p>
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
