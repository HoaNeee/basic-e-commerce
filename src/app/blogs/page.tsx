/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Tag,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { fetcher, get } from "@/utils/requets";
import useSWR from "swr";
import PaginationComponent from "@/components/PaginationComponent";
import { usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogModel } from "@/models/blogModel";

const LayoutBlogs = ({ tags }: { tags: string[] }) => {
  const [selectedTag, setSelectedTag] = useState("Tất cả");
  const [blogs, setBlogs] = useState<BlogModel[]>([]);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scrollLeft, setScrollLeft] = useState(0);

  const searchParams = useSearchParams();
  const pathName = usePathname();
  const router = useRouter();
  const page = Number(searchParams.get("page")) || 1;
  const keywordQuery = searchParams.get("keyword") || "";
  const tagQuery = searchParams.get("tag") || "";
  const listTags = useRef<any>(null);
  const limit = 10;

  const getBlogs = useCallback(async (page = 1, keyword = "", tag = "") => {
    try {
      setIsLoading(true);
      const api = `/blogs?limit=${limit}&keyword=${keyword}&page=${
        page || 1
      }&tag=${tag !== "Tất cả" ? tag : ""}`;
      const response = await get(api);
      setBlogs(response.data.blogs);
      setTotalPage(response.data.totalPage);
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getBlogs(page, keywordQuery, tagQuery);
    if (keywordQuery) {
      setKeyword(keywordQuery);
    }
    if (tagQuery) {
      setSelectedTag(tagQuery);
    } else {
      setSelectedTag("Tất cả");
    }
  }, [getBlogs, page, keywordQuery, tagQuery]);

  useEffect(() => {
    const list = listTags.current;
    if (list) {
      list.onscroll = () => {
        setScrollLeft(list.scrollLeft);
      };
    }

    return () => {
      if (list) {
        list.onscroll = null;
      }
    };
  }, [listTags, blogs]);

  const createQueryString = (
    name: string,
    value: string,
    query = searchParams
  ) => {
    const params = new URLSearchParams(query);
    params.set(name, value);
    return decodeURIComponent(params.toString());
  };

  const deleteQueryString = (name: string, query = searchParams) => {
    const params = new URLSearchParams(query);
    params.delete(name);
    return decodeURIComponent(params.toString());
  };

  const renderItemBlog = (blog: BlogModel) => {
    return (
      <article
        key={blog._id}
        className="bg-white dark:bg-neutral-800 dark:text-white/80 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={blog.image}
            alt={blog.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-black text-white px-3 py-1.5 capitalize rounded-full text-xs font-medium">
              {blog.tags && blog.tags?.length > 0 ? blog.tags[0] : "General"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white/80 mb-3 group-hover:text-blue-600 transition-colors">
            <Link href={`/blogs/${blog.slug}`} className="hover:underline">
              {blog.title}
            </Link>
          </h2>

          <p className="text-gray-600 dark:text-white/60 mb-4 line-clamp-3">
            {blog.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex items-center text-sm text-gray-500 dark:text-white/60 mb-4">
            <div className="flex items-center mr-4">
              <User className="w-4 h-4 mr-1" />
              {blog.author?.fullName || "Unknown Author"}
            </div>
            <div className="flex items-center mr-4">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {blog.readTime}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-neutral-600 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-neutral-500 transition-colors"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>

          {/* Read More Button */}
          <Link
            href={`/blogs/${blog.slug}`}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors"
          >
            Đọc thêm
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </article>
    );
  };

  const renderSkeleton = (key: number) => {
    return (
      <div className="w-full h-full" key={key}>
        <Skeleton className="w-full h-100" />
      </div>
    );
  };

  const renderTagFilter = (tags: string[]) => {
    const clientWidth = listTags.current ? listTags.current.clientWidth : 1280;

    const scrollWidth = listTags.current ? listTags.current.scrollWidth : 1280;

    const maxScrollLeft = scrollWidth - clientWidth;

    return (
      <div className="relative">
        <div
          className="max-w-full flex flex-nowrap gap-2 overflow-hidden mb-4 overflow-x-auto scroll-none px-10 transition-all duration-300"
          ref={listTags}
        >
          {tags.map((tag) => (
            <Button
              key={tag}
              onClick={() => {
                if (tag === tagQuery || tag === selectedTag) {
                  return;
                }

                setSelectedTag(tag);
                let newQuery: any = createQueryString(
                  "tag",
                  tag !== "Tất cả" ? tag : ""
                );
                if (newQuery.includes("page")) {
                  newQuery = deleteQueryString("page", newQuery);
                }
                router.push(`${pathName}?${newQuery}`, { scroll: false });
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? "bg-black text-white dark:bg-neutral-600 "
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              {tag}
            </Button>
          ))}
        </div>
        {scrollWidth > clientWidth &&
          listTags.current &&
          listTags.current.scrollLeft < maxScrollLeft - 100 && (
            <div className="absolute top-0 right-0 h-full flex items-center bg-gradient-to-r from-white/50 to-white pl-2">
              <button
                className="rounded-full md:hover:bg-neutral-200 active:bg-neutral-200 md:active:bg-none text-neutral-600 p-2 cursor-pointer transition-colors"
                onClick={() => {
                  setScrollLeft(Math.min(maxScrollLeft, scrollLeft + 300));
                  listTags.current.scrollLeft += 300;
                }}
              >
                <ChevronRight className="" />
              </button>
            </div>
          )}

        {listTags.current && listTags.current.scrollLeft > 0 && (
          <div className="absolute top-0 left-0 h-full flex items-center bg-gradient-to-r from-white to-white/80 pl-2">
            <button
              className="rounded-full md:hover:bg-neutral-200 active:bg-neutral-200 md:active:bg-none text-neutral-600 p-2 cursor-pointer transition-colors"
              onClick={() => {
                setScrollLeft(Math.max(0, scrollLeft - 300));
                listTags.current.scrollLeft -= 300;
              }}
            >
              <ChevronLeft className="" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter Section */}
      <div className="mb-8">
        {(keywordQuery || tagQuery) && (
          <div className="mb-2">
            <button
              onClick={() => {
                if (keywordQuery) {
                  setKeyword("");
                }
                if (tagQuery) {
                  setSelectedTag("Tất cả");
                }
                router.push(pathName, { scroll: false });
              }}
              className="px-2 flex items-center gap-1 py-1 text-sm text-red-600 bg-red-100/70 dark:bg-red-900/40 rounded-md hover:bg-red-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear filter
            </button>
          </div>
        )}
        <div className="flex w-full gap-4 mb-8">
          {/* Search Bar */}
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="w-full pl-10 pr-4 py-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    let newQuery: any = createQueryString("keyword", keyword);
                    if (newQuery.includes("page")) {
                      newQuery = deleteQueryString("page", newQuery);
                    }

                    router.push(`${pathName}?${newQuery}`, { scroll: false });
                  }
                }}
              />
            </div>
            <Button
              onClick={() => {
                let newQuery: any = createQueryString("keyword", keyword);
                if (newQuery.includes("page")) {
                  newQuery = deleteQueryString("page", newQuery);
                }

                router.push(`${pathName}?${newQuery}`);
              }}
              className="py-6"
            >
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Tag Filter */}
        {renderTagFilter(tags)}
      </div>

      {/* Blog Posts Grid */}
      {!isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => renderItemBlog(blog))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: limit }).map((_, index) =>
            renderSkeleton(index)
          )}
        </div>
      )}
      {/* No Results */}
      {blogs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Không tìm thấy bài viết
          </h3>
          <p className="text-gray-600">
            Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác
          </p>
        </div>
      )}

      {/* Pagination would go here */}
      {totalPage > 1 && (
        <div className="flex justify-center mt-8">
          <PaginationComponent
            totalPage={totalPage}
            className="justify-center"
          />
        </div>
      )}
    </div>
  );
};

const Blogs = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  const { data } = useSWR("/blogs/tags", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useEffect(() => {
    if (data && data.code === 200) {
      let array = [];
      array.push("Tất cả");
      array = [...array, ...data.data];
      setTags(array);
    }
  }, [data]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const renderLoading = () => {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-black dark:border-white"></div>
      </div>
    );
  };

  if (!loaded) {
    return renderLoading();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white">
      {/* Header Section */}
      <div className="bg-white shadow-sm dark:bg-black/90">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 dark:text-white">
              Blog Thời Trang
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-white/80">
              Khám phá những xu hướng mới nhất, mẹo hay và cảm hứng thời trang
              từ các chuyên gia
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={renderLoading()}>
        <LayoutBlogs tags={tags} />
      </Suspense>
    </div>
  );
};

export default Blogs;
