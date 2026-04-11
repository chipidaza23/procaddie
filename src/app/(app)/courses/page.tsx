"use client";

import { CourseSearchBar } from "@/components/course/course-search-bar";
import { CourseCard } from "@/components/course/course-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseSearch } from "@/lib/hooks/use-course-search";

export default function CoursesPage() {
  const { query, setQuery, results, isLoading, error } = useCourseSearch();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search for a golf course to view hole-by-hole details and aerial views.
        </p>
      </div>

      <CourseSearchBar value={query} onChange={setQuery} />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {results.map((course) => (
            <CourseCard key={course.external_id} course={course} />
          ))}
        </div>
      )}

      {!isLoading && query && results.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          No courses found for &quot;{query}&quot;.
        </p>
      )}
    </div>
  );
}
