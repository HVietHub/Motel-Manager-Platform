"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const tenantSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  name: z.string().min(1, "Tên là bắt buộc").max(100, "Tên quá dài"),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số"),
  idCard: z
    .string()
    .min(9, "CMND/CCCD phải có ít nhất 9 số")
    .max(12, "CMND/CCCD không hợp lệ"),
  dateOfBirth: z.string().min(1, "Ngày sinh là bắt buộc"),
});

export type TenantFormData = z.infer<typeof tenantSchema>;

type TenantFormProps = {
  initialData?: Partial<TenantFormData>;
  onSubmit: (data: TenantFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  isEdit?: boolean;
};

export function TenantForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Lưu",
  isEdit = false,
}: TenantFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="tenant@example.com"
          {...register("email")}
          disabled={isLoading || isEdit}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
        {isEdit && (
          <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">
          Họ và Tên <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Nguyễn Văn A"
          {...register("name")}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">
            Số Điện Thoại <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            placeholder="0912345678"
            {...register("phone")}
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="idCard">
            CMND/CCCD <span className="text-destructive">*</span>
          </Label>
          <Input
            id="idCard"
            placeholder="001234567890"
            {...register("idCard")}
            disabled={isLoading}
          />
          {errors.idCard && (
            <p className="text-sm text-destructive">{errors.idCard.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">
          Ngày Sinh <span className="text-destructive">*</span>
        </Label>
        <Input
          id="dateOfBirth"
          type="date"
          {...register("dateOfBirth")}
          disabled={isLoading}
        />
        {errors.dateOfBirth && (
          <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
        )}
      </div>

      {!isEdit && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            ℹ️ Mật khẩu sẽ được tạo tự động và gửi qua email cho người thuê
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
          {isLoading ? "Đang xử lý..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
