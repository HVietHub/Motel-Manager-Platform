"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const buildingSchema = z.object({
  name: z.string().min(1, "Tên tòa nhà là bắt buộc").max(100, "Tên tòa nhà quá dài"),
  address: z.string().min(1, "Địa chỉ là bắt buộc").max(200, "Địa chỉ quá dài"),
  description: z.string().max(500, "Mô tả quá dài").optional(),
});

export type BuildingFormData = z.infer<typeof buildingSchema>;

type BuildingFormProps = {
  initialData?: Partial<BuildingFormData>;
  onSubmit: (data: BuildingFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
};

export function BuildingForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Lưu",
}: BuildingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuildingFormData>({
    resolver: zodResolver(buildingSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Tên Tòa Nhà / Dãy Trọ <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="VD: Nhà Trọ A, Dãy Trọ B..."
          {...register("name")}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">
          Địa Chỉ <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address"
          placeholder="123 Đường ABC, Quận XYZ..."
          {...register("address")}
          disabled={isLoading}
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô Tả</Label>
        <Textarea
          id="description"
          placeholder="Mô tả về tòa nhà..."
          rows={3}
          {...register("description")}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
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
