"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
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
import { X, FileText } from "lucide-react";

const contractSchema = z.object({
  tenantId: z.string().min(1, "Vui lòng chọn người thuê"),
  roomId: z.string().min(1, "Vui lòng chọn phòng"),
  contractFile: z.instanceof(File).optional(),
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
  building: { name: string };
};

type ContractFormProps = {
  tenants: Tenant[];
  rooms: Room[];
  onSubmit: (data: ContractFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
};

export function ContractForm({
  tenants,
  rooms,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Tải Lên",
}: ContractFormProps) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleTenantChange = (tenantId: string) => {
    setValue("tenantId", tenantId);
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant && tenant.room) {
      const room = rooms.find(r => r.roomNumber === tenant.room?.roomNumber);
      if (room) {
        setValue("roomId", room.id);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 10 * 1024 * 1024;
      
      if (!validTypes.includes(file.type)) {
        alert('Chỉ chấp nhận file ảnh (JPG, PNG), PDF hoặc DOCX');
        return;
      }
      
      if (file.size > maxSize) {
        alert('File không được vượt quá 10MB');
        return;
      }
      
      setSelectedFile(file);
      setValue("contractFile", file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setValue("contractFile", undefined);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tenantId">
          Người Thuê <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("tenantId")}
          onValueChange={handleTenantChange}
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
          value={watch("roomId")}
          onValueChange={(value) => setValue("roomId", value)}
          disabled={isLoading || !watch("tenantId")}
        >
          <SelectTrigger>
            <SelectValue placeholder={watch("tenantId") ? "Chọn phòng" : "Chọn người thuê trước"} />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                <div className="flex flex-col">
                  <span className="font-medium">
                    Phòng {room.roomNumber} - {room.building.name}
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

      <div className="space-y-2">
        <Label htmlFor="contractFile">
          File Hợp Đồng (Tùy chọn)
        </Label>
        <div className="space-y-2">
          {!selectedFile ? (
            <div className="relative">
              <Input
                id="contractFile"
                type="file"
                accept="image/jpeg,image/png,image/jpg,.pdf,.docx"
                onChange={handleFileChange}
                disabled={isLoading}
                className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-input bg-background p-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Hỗ trợ: JPG, PNG, PDF, DOCX
        </p>
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
