import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Novel Web App",
    short_name: "Novel",
    description: "Nền tảng đọc và lưu trữ truyện online siêu mượt",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#09090b",
    icons: [
      {
        src: "https://placehold.co/192x192/09090b/ffffff/png?text=N",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "https://placehold.co/512x512/09090b/ffffff/png?text=N",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
