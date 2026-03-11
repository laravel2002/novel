import { Metadata } from "next";
import { getStoriesPaginated } from "@/services/discovery";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  IconChevronLeft,
  IconChevronRight,
  IconFlame,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { getImageUrl } from "@/lib/utils";

import { LatestUpdatesClient } from "./LatestUpdatesClient";

export const metadata: Metadata = {
  title: "Mới Cập Nhật | Novel",
  description: "Danh sách 100 truyện chữ mới được cập nhật chương mới nhất.",
};

export const revalidate = 600;

export default async function LatestUpdatesPage() {
  const { data: stories, nextCursor } = await getStoriesPaginated({
    limit: 12,
    cursor: undefined,
    sortBy: "updatedAt",
  });

  return (
    <LatestUpdatesClient initialData={{ data: stories, nextCursor }} />
  );
}
