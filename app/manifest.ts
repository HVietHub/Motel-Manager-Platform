import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HouseSea - Nền Tảng Quản Lý Nhà Trọ Thông Minh',
    short_name: 'HouseSea',
    description: 'Kết nối chủ nhà và người thuê - Quản lý nhà trọ dễ dàng, hiệu quả',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/icon.webp',
        sizes: 'any',
        type: 'image/webp',
      },
    ],
  }
}
