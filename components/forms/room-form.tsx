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

const roomSchema = z.object({
  buildingId: z.string().min(1, "Vui lòng chọn tòa nhà"),
  roomNumber: z.string().min(1, "Số phòng là bắt buộc").max(20, "Số phòng quá dài"),
  floor: z.number().int().min(1, "Tầng phải >= 1").max(100, "Tầng không hợp lệ"),
  area: z.number().positive("Diện tích phải > 0").max(1000, "Diện tích quá lớn"),
  price: z.number().positive("Giá thuê phải > 0"),
  deposit: z.number().min(0, "Tiền cọc phải >= 0").optional(),
  description: z.string().max(500, "Mô tả quá dài").optional(),
});

export type RoomFormData = z.infer<typeof roomSchema>;

type Building = {
  id: string;
  name: string;
  address: string;
};

type RoomFormProps = {
  buildings: Building[];
  initialData?: Partial<RoomFormData>;
  onSubmit: (data: RoomFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
};

export function RoomForm({
  buildings,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Lưu",
}: RoomFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      floor: 1,
      deposit: 0,
      ...initialData,
      // Auto-select first building if only one exists
      buildingId: initialData?.buildingId || (buildings.length === 1 ? buildings[0].id : ""),
    },
  });

  const selectedBuildingId = watch("buildingId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Building Selection - Smart Display */}
      {buildings.length === 0 && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm font-medium text-orange-900">⚠️ Chưa có tòa nhà</p>
          <p className="text-xs text-orange-700 mt-1">
            Vui lòng tạo tòa nhà trước khi thêm phòng
          </p>
        </div>
      )}

      {buildings.length === 1 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">🏢 Tòa nhà: {buildings[0].name}</p>
          <p className="text-xs text-blue-700 mt-1">📍 {buildings[0].address}</p>
        </div>
      )}

      {buildings.length > 1 && (
        <div className="space-y-2">
          <Label htmlFor="buildingId">
            Tòa Nhà / Dãy Trọ <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedBuildingId}
            onValueChange={(value) => setValue("buildingId", value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn tòa nhà hoặc dãy trọ" />
            </SelectTrigger>
            <SelectContent>
              {buildings.map((building) => (
                <SelectItem key={building.id} value={building.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{building.name}</span>
                    <span className="text-xs text-muted-foreground">{building.address}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.buildingId && (
            <p className="text-sm text-destructive">{errors.buildingId.message}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="roomNumber">
            Số Phòng / Mã Phòng <span className="text-destructive">*</span>
          </Label>
          <Input
            id="roomNumber"
            placeholder="101, P1, A..."
            {...register("roomNumber")}
            disabled={isLoading}
          />
          {errors.roomNumber && (
            <p className="text-sm text-destructive">{errors.roomNumber.message}</p>
          )}
          <p className="text-xs text-muted-foreground">VD: 101, 201, P1, A, B...</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="floor">
            Tầng <span className="text-destructive">*</span>
          </Label>
          <Input
            id="floor"
            type="number"
            placeholder="1"
            {...register("floor")}
            disabled={isLoading}
          />
          {errors.floor && (
            <p className="text-sm text-destructive">{errors.floor.message}</p>
          )}
          <p className="text-xs text-muted-foreground">Để 1 nếu là dãy ngang</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="area">
            Diện Tích (m²) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="area"
            type="number"
            step="0.1"
            placeholder="20"
            {...register("area")}
            disabled={isLoading}
          />
          {errors.area && (
            <p className="text-sm text-destructive">{errors.area.message}</p>
          )}
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
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deposit">Tiền Cọc (VNĐ)</Label>
        <Input
          id="deposit"
          type="number"
          placeholder="5000000"
          {...register("deposit")}
          disabled={isLoading}
        />
        {errors.deposit && (
          <p className="text-sm text-destructive">{errors.deposit.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô Tả</Label>
        <Textarea
          id="description"
          placeholder="Mô tả về phòng..."
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
        <Button type="submit" disabled={isLoading || buildings.length === 0}>
          {isLoading ? "Đang xử lý..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
