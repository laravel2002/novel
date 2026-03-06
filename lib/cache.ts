import { unstable_cache } from "next/cache";

/**
 * Helper cache các Prisma queries cho Next.js App Router.
 * Giúp tận dụng Data Cache thay vì truy vấn trực tiếp CSDL mỗi lần request.
 *
 * @param queryFn Hàm thực hiện truy vấn DB
 * @param keyParts Mảng các chuỗi làm key cache
 * @param options Tùy chọn revalidate (giây) và tags
 */
export const cachePrismaQuery = async <T>(
    queryFn: () => Promise<T>,
    keyParts: string[],
    options?: {
        revalidate?: number | false;
        tags?: string[];
    }
): Promise<T> => {
    const cachedFn = unstable_cache(
        async () => {
            return queryFn();
        },
        keyParts,
        options
    );
    return cachedFn();
};
