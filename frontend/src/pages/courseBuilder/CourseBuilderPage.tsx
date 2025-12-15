// src/pages/courseBuilder/CourseBuilderPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./CourseBuilderPage.css";
import CourseBuilderMap from "./CourseBuilderMap";

import {
  COURSE_BUILDER_TABS,
  fetchPlaceList,
  type CourseSpotUI,
  type PlaceItem,
  type PlaceType,
} from "./courseBuilder.api";

import {
  createCourse,
  updateCourse,
  fetchCourseDetail,
  type CourseCreateRequestDto,
} from "./course.api";

import { getAccountIdFromJwtSub } from "./courseBuilder.auth";

const PAGE_SIZE = 20;
const GROUP_SIZE = 10;

const FALLBACK_IMG =
  "https://dummyimage.com/600x400/dddddd/111111.png&text=No+Image";

const CourseBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ 수정모드 판단 (courseId 쿼리 있으면 수정)
  const courseIdParam =
    searchParams.get("courseId") ?? searchParams.get("courseid"); // 혹시 소문자로 들어와도 방어
  const isEdit = !!courseIdParam;
  const courseId = courseIdParam ? Number(courseIdParam) : null;

  const [activeType, setActiveType] = useState<PlaceType>("search");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<PlaceItem[]>([]);
  const [total, setTotal] = useState<number | undefined>(undefined);

  const [selected, setSelected] = useState<CourseSpotUI[]>([]);
  const [goPage, setGoPage] = useState("");

  // ✅ 코스 메타(폼)
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseTags, setCourseTags] = useState("");
  const [isPublic, setIsPublic] = useState<"Y" | "N">("Y");

  const totalPages = useMemo(() => {
    const t = total ?? 0;
    return Math.max(1, Math.ceil(t / PAGE_SIZE));
  }, [total]);

  const groupStart = useMemo(() => {
    return Math.floor((page - 1) / GROUP_SIZE) * GROUP_SIZE + 1;
  }, [page]);

  const groupEnd = useMemo(() => {
    return Math.min(totalPages, groupStart + GROUP_SIZE - 1);
  }, [totalPages, groupStart]);

  const pageNumbers = useMemo(() => {
    const arr: number[] = [];
    for (let p = groupStart; p <= groupEnd; p++) arr.push(p);
    return arr;
  }, [groupStart, groupEnd]);

  const clampPage = (p: number) => Math.max(1, Math.min(totalPages, p));

  /* ------------------------------
     1) 좌측 리스트(검색 결과) 로딩
  ------------------------------ */
  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);
      try {
        const res = await fetchPlaceList({
          placeType: activeType,
          keyword,
          page,
          size: PAGE_SIZE,
        });
        if (!alive) return;

        setList(res.list);
        setTotal(res.total);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setList([]);
        setTotal(undefined);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [activeType, keyword, page]);

  /* ------------------------------
     2) ✅ 수정모드 프리필(핵심)
  ------------------------------ */
  useEffect(() => {
    if (!isEdit) return;
    if (!courseId || Number.isNaN(courseId)) return;

    let alive = true;

    (async () => {
      try {
        const dto = await fetchCourseDetail(courseId);
        if (!alive) return;

        setCourseTitle(dto.title ?? "");
        setCourseDesc(dto.description ?? "");
        setCourseTags(dto.tags ?? "");
        setIsPublic((dto.isPublic as "Y" | "N") ?? "Y");

        const spots: CourseSpotUI[] = (dto.spots ?? [])
          .slice()
          .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
          .map((s, idx) => ({
            // ✅ 프론트 UI는 lat/lng, 백엔드는 latitude/longitude
            orderIndex: idx,
            placeId: s.placeId,
            placeType: s.placeType as PlaceType, // 타입은 실제론 string이지만 UI에서 PlaceType으로 써도 OK
            title: s.title ?? "(정보 없음)",
            address: s.address ?? null,
            thumbnail: s.thumbnail ?? null,
            lat: (s.latitude ?? null) as number | null,
            lng: (s.longitude ?? null) as number | null,
          }));

        setSelected(spots);
      } catch (e) {
        console.error("수정 프리필 실패", e);
        alert("코스 불러오기 실패");
      }
    })();

    return () => {
      alive = false;
    };
  }, [isEdit, courseIdParam]); // courseIdParam 기준으로 재실행

  /* ------------------------------
     Spot 조작
  ------------------------------ */
  const addSpot = (p: PlaceItem) => {
    const exists = selected.some(
      (s) => s.placeType === p.placeType && s.placeId === p.placeId
    );
    if (exists) return;

    setSelected((prev) => [
      ...prev,
      {
        orderIndex: prev.length,
        placeId: p.placeId,
        placeType: p.placeType,
        title: p.title,
        address: p.address ?? null,
        thumbnail: p.thumbnail ?? null,
        lat: p.lat ?? null,
        lng: p.lng ?? null,
      },
    ]);
  };

  const removeSpot = (idx: number) => {
    setSelected((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, newIndex) => ({ ...s, orderIndex: newIndex }))
    );
  };

  const clearAll = () => setSelected([]);

  /* ------------------------------
     ✅ 저장/수정 버튼
  ------------------------------ */
  const onSave = async () => {
    const accountId = getAccountIdFromJwtSub();
    if (!accountId) {
      alert("로그인이 필요합니다. (토큰 없음/파싱 실패)");
      return;
    }

    const payload: CourseCreateRequestDto = {
      title: courseTitle.trim(),
      description: courseDesc.trim() || undefined,
      tags: courseTags.trim() || undefined,
      isPublic,
      spots: selected.map((s) => ({
        orderIndex: s.orderIndex,
        placeId: s.placeId,
        placeType: s.placeType, // 백엔드 string
      })),
    };

    if (!payload.title) return alert("코스 제목은 필수");
    if (payload.spots.length === 0) return alert("스팟을 1개 이상 추가하세요.");

    try {
      let savedId: number;

      if (isEdit && courseId) {
        await updateCourse(courseId, accountId, payload);
        savedId = courseId;
        alert("수정 완료");
      } else {
        savedId = await createCourse(accountId, payload);
        alert("저장 완료");
      }

      // ✅ 리다이렉트 (가장 안전: 상세로 이동)
      navigate(`/course/view/${savedId}`, { replace: true });

      // 만약 “리스트 페이지”로 보내고 싶으면 위 줄 대신 아래로 바꿔:
      // navigate("/course", { replace: true });
      // 또는 네 리스트 라우트가 따로 있으면 그 path로.
    } catch (e: any) {
      console.error("저장 실패", {
        status: e?.response?.status,
        data: e?.response?.data,
        url: e?.config?.url,
        params: e?.config?.params,
      });
      alert("저장 실패. (서버 로그/권한/경로 확인)");
    }
  };

  return (
    <div className="cb-page">
      <div className="cb-grid">
        {/* LEFT */}
        <div className="cb-area-left">
          <div className="cb-left">
            <div className="cb-tabs">
              {COURSE_BUILDER_TABS.map((t) => (
                <button
                  key={t.key}
                  className={`cb-tab ${activeType === t.key ? "active" : ""}`}
                  onClick={() => {
                    setActiveType(t.key);
                    setPage(1);
                    setGoPage("");
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="cb-search">
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                  setGoPage("");
                }}
                placeholder="검색어 입력"
              />
            </div>

            <div className="cb-list">
              {loading ? (
                <div className="cb-muted">불러오는 중… (서버야 울지 마)</div>
              ) : list.length === 0 ? (
                <div className="cb-muted">결과 없음</div>
              ) : (
                list.map((p) => {
                  const noCoord = !(
                    typeof p.lat === "number" && typeof p.lng === "number"
                  );

                  return (
                    <div key={`${p.placeType}:${p.placeId}`} className="cb-card">
                      <div className="cb-thumb">
                        <img
                          src={p.thumbnail || FALLBACK_IMG}
                          alt={p.title}
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMG;
                          }}
                        />
                      </div>

                      <div className="cb-card-main">
                        <div className="cb-title">{p.title}</div>
                        <div className="cb-sub">
                          {p.address || "주소 없음"}
                          {noCoord && (
                            <span className="cb-badge">지도 표시 불가</span>
                          )}
                        </div>
                      </div>

                      <button className="cb-add" onClick={() => addSpot(p)}>
                        추가
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            <div className="cb-paging">
              <button
                className="cb-page-btn"
                disabled={page <= 1}
                onClick={() => setPage(1)}
                title="첫 페이지"
              >
                {"<<"}
              </button>

              <button
                className="cb-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => clampPage(p - 1))}
                title="이전"
              >
                {"<"}
              </button>

              <div className="cb-page-list">
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    className={`cb-page-num ${page === n ? "active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                className="cb-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => clampPage(p + 1))}
                title="다음"
              >
                {">"}
              </button>

              <button
                className="cb-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(totalPages)}
                title="마지막 페이지"
              >
                {">>"}
              </button>

              <div className="cb-go">
                <input
                  value={goPage}
                  onChange={(e) =>
                    setGoPage(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="Go"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const n = Number(goPage);
                      if (!Number.isFinite(n) || n < 1) return;
                      setPage(clampPage(n));
                      setGoPage("");
                    }
                  }}
                />
                <button
                  className="cb-page-btn"
                  onClick={() => {
                    const n = Number(goPage);
                    if (!Number.isFinite(n) || n < 1) return;
                    setPage(clampPage(n));
                    setGoPage("");
                  }}
                >
                  이동
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="cb-area-right">
          <div className="cb-right">
            {/* ✅ 헤더는 위에 고정(스크롤 밖) */}
            <div className="cb-selected-head">
              <div className="cb-selected-title">
                {isEdit ? "내 코스 (수정)" : "내 코스"}
              </div>
              <div className="cb-selected-meta">
                <div className="cb-selected-count">
                  총 {selected.length}개 선택됨
                </div>
                <button
                  className="cb-clear"
                  onClick={clearAll}
                  disabled={selected.length === 0}
                  title="전체 삭제"
                >
                  전체 삭제
                </button>
              </div>
            </div>

            {/* ✅ 폼 + 리스트를 “한 덩어리”로 묶어서 같이 스크롤 */}
            <div className="cb-right-body">
              <div className="cb-course-form">
                <div className="cb-field">
                  <div className="cb-label">
                    코스 제목 <span className="cb-required">*</span>
                  </div>
                  <input
                    className="cb-input"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="예) 부산 1일 코스 - 바다/야경"
                  />
                </div>

                <div className="cb-field">
                  <div className="cb-label">설명</div>
                  <textarea
                    className="cb-textarea"
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    placeholder="코스 설명(선택)"
                  />
                </div>

                <div className="cb-field">
                  <div className="cb-label">태그</div>
                  <input
                    className="cb-input"
                    value={courseTags}
                    onChange={(e) => setCourseTags(e.target.value)}
                    placeholder="예) 바다, 야경, 맛집"
                  />
                </div>

                <div className="cb-form-row">
                  <div className="cb-field cb-field-inline">
                    <div className="cb-label">공개 여부:</div>
                    <label className="cb-radio">
                      <input
                        type="radio"
                        name="isPublic"
                        checked={isPublic === "Y"}
                        onChange={() => setIsPublic("Y")}
                      />
                      공개
                    </label>
                    <label className="cb-radio">
                      <input
                        type="radio"
                        name="isPublic"
                        checked={isPublic === "N"}
                        onChange={() => setIsPublic("N")}
                      />
                      비공개
                    </label>
                  </div>

                  <button className="cb-save" onClick={onSave}>
                    {isEdit ? "수정" : "저장"}
                  </button>
                </div>
              </div>

              {selected.length === 0 ? (
                <div className="cb-muted">
                  아직 비었음. 이제부터 네 감각을 믿어라.
                </div>
              ) : (
                <div className="cb-selected-list">
                  {selected.map((s, idx) => {
                    const noCoord = !(
                      typeof s.lat === "number" && typeof s.lng === "number"
                    );

                    return (
                      <div
                        key={`${s.placeType}:${s.placeId}`}
                        className="cb-selected-item"
                      >
                        <div className="cb-selected-index">{idx + 1}</div>

                        <div className="cb-selected-thumb">
                          <img
                            src={s.thumbnail || FALLBACK_IMG}
                            alt={s.title}
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_IMG;
                            }}
                          />
                        </div>

                        <div className="cb-selected-main">
                          <div className="cb-title">{s.title}</div>
                          <div className="cb-sub">
                            {s.address || "주소 없음"}
                            {noCoord && (
                              <span className="cb-badge">지도 표시 불가</span>
                            )}
                          </div>
                        </div>

                        <button
                          className="cb-remove"
                          onClick={() => removeSpot(idx)}
                        >
                          삭제
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAP */}
        <div className="cb-area-map">
          <div className="cb-map">
            <CourseBuilderMap selected={selected} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilderPage;
