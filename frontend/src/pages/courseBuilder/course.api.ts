// src/pages/courseBuilder/course.api.ts
import { api, withApi } from "./courseBuilder.http";

/* ---------------------------
   Backend DTOs (Response)
--------------------------- */

export type CourseSpotDto = {
  orderIndex: number;
  placeId: string;
  placeType: string;

  title?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  thumbnail?: string | null;
  category?: string | null;
};

export type CourseDetailResponseDto = {
  courseId: number;
  accountId: string;

  title: string;
  description?: string;
  isPublic?: string;
  tags?: string;

  createdAt?: string;
  updatedAt?: string;

  spots: CourseSpotDto[];
};

/* ---------------------------
   Backend DTOs (Request)
--------------------------- */

export type CourseSpotRequestDto = {
  orderIndex: number;
  placeId: string;
  placeType: string; // 백엔드가 String으로 받으니 그대로
};

export type CourseCreateRequestDto = {
  title: string;
  description?: string;
  isPublic?: string; // "Y"/"N" 등
  tags?: string;
  spots: CourseSpotRequestDto[];
};

const COURSE_ROOT = withApi("/course");

/* ---------------------------
   API Functions
--------------------------- */

export async function fetchUserCourses(accountId: string) {
  const res = await api.get<CourseDetailResponseDto[]>(
    `${COURSE_ROOT}/user/${encodeURIComponent(accountId)}`
  );
  return res.data;
}

export async function fetchCourseDetail(courseId: number | string) {
  const res = await api.get<CourseDetailResponseDto>(`${COURSE_ROOT}/${courseId}`);
  return res.data;
}

export async function deleteCourse(courseId: number | string) {
  await api.delete(`${COURSE_ROOT}/${courseId}`);
}

/**
 * 코스 생성: POST /api/course?accountId=...
 */
export async function createCourse(accountId: string, payload: CourseCreateRequestDto) {
  const res = await api.post<number>(`${COURSE_ROOT}`, payload, {
    params: { accountId },
    headers: { "Content-Type": "application/json" },
  });
  return Number(res.data);
}

export async function updateCourse(
  courseId: number | string,
  accountId: string,
  payload: CourseCreateRequestDto
) {
  await api.put(`${COURSE_ROOT}/${courseId}`, payload, {
    params: { accountId },
    headers: { "Content-Type": "application/json" },
  });
}
