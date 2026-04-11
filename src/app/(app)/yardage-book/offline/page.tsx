"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useOffline } from "@/lib/hooks/use-offline";
import { getAllCourses } from "@/lib/services/offline-store";
import type { Course } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WifiOff, Wifi, Download, BookOpen, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function OfflinePage() {
  const { isOnline, cachedCourseIds } = useOffline();
  const [cachedCourses, setCachedCourses] = useState<Course[]>([]);
  const [loadingCached, setLoadingCached] = useState(true);

  useEffect(() => {
    async function load() {
      setLoadingCached(true);
      try {
        const courses = await getAllCourses();
        setCachedCourses(courses);
      } finally {
        setLoadingCached(false);
      }
    }
    load();
  }, [cachedCourseIds]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div
        className={`flex items-center gap-3 rounded-lg p-4 ${
          isOnline
            ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">Online</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Download courses to access them offline on the course.
              </p>
            </div>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Offline</p>
              <p className="text-sm text-red-700 dark:text-red-300">
                You&apos;re offline. Showing cached courses below.
              </p>
            </div>
          </>
        )}
      </div>
      <div>
        <h2 className="font-semibold mb-3">Downloaded Courses</h2>
        {loadingCached ? (
          <p className="text-sm text-muted-foreground">Loading cached courses…</p>
        ) : cachedCourses.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Download className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No courses downloaded yet. Go to a yardage book while online and cache it for offline use.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cachedCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-semibold">{course.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      <Download className="h-3 w-3 mr-1" />
                      Cached
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {[course.city, course.state].filter(Boolean).join(", ")}
                    <span className="mx-1">·</span>
                    Par {course.par} · {course.num_holes} holes
                  </div>
                  <Link
                    href={`/yardage-book/${course.id}`}
                    className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-1 w-full")}
                  >
                    <BookOpen className="h-3 w-3" />
                    Open Yardage Book
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
