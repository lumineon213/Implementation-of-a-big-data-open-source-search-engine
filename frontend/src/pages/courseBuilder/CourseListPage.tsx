import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CourseListPage.css";
import { deleteCourse, fetchUserCourses, type CourseDetailResponseDto } from "./course.api";

const PAGE_SIZE = 8;
const GROUP_SIZE = 10;

import { getAccountIdFromJwtSub } from "./courseBuilder.auth";


const CourseListPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseDetailResponseDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [accountId, setAccountId] = useState<string>("");

  // paging
  const [page, setPage] = useState(1);
  const [goPage, setGoPage] = useState("");

  const total = courses.length;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const groupStart = useMemo(() => Math.floor((page - 1) / GROUP_SIZE) * GROUP_SIZE + 1, [page]);
  const groupEnd = useMemo(() => Math.min(totalPages, groupStart + GROUP_SIZE - 1), [totalPages, groupStart]);

  const pageNumbers = useMemo(() => {
    const arr: number[] = [];
    for (let p = groupStart; p <= groupEnd; p++) arr.push(p);
    return arr;
  }, [groupStart, groupEnd]);

  const clampPage = (p: number) => Math.max(1, Math.min(totalPages, p));

  const currentList = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return courses.slice(start, end);
  }, [courses, page]);

  // ✅ 핵심: /mypage 호출 제거, JWT sub로 accountId 확보
  useEffect(() => {
    const id = getAccountIdFromJwtSub();

    if (!id) {
      // 토큰 없거나 파싱 실패면 로그인으로
      navigate("/login");
      return;
    }

    setAccountId(id);

    let alive = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchUserCourses(id);
        if (!alive) return;

        setCourses(data || []);
        setPage(1);
      } catch (e: any) {
        console.error("코스 목록 조회 실패", {
          status: e?.response?.status,
          data: e?.response?.data,
          url: e?.config?.url,
          params: e?.config?.params,
        });

        if (!alive) return;
        setError("코스 목록 조회 실패. (서버/토큰/권한/경로 확인)");
        setCourses([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [navigate]);

  const handleDelete = async (courseId: number) => {
    const ok = window.confirm("이 코스를 삭제할까요? (되돌리기 없음)");
    if (!ok) return;

    try {
      await deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.courseId !== courseId));
      setPage((p) => clampPage(p));
    } catch (e: any) {
      console.error("코스 삭제 실패", {
        status: e?.response?.status,
        data: e?.response?.data,
        url: e?.config?.url,
      });
      alert("삭제 실패. 서버 로그 확인.");
    }
  };

  return (
    <div className="cml-page">
      <div className="cml-header">
        <div className="cml-title">내 코스 목록</div>
        <div className="cml-sub">
          accountId: <b>{accountId || "(로딩중)"}</b> / 총 <b>{total}</b>개
        </div>

        <div className="cml-actions">
          <button className="cml-btn" onClick={() => navigate("/course/builder")}>
            새 코스 만들기
          </button>
        </div>
      </div>

      {loading ? (
        <div className="cml-muted">불러오는 중… 서버야 착해져라.</div>
      ) : error ? (
        <div className="cml-error">{error}</div>
      ) : total === 0 ? (
        <div className="cml-muted">아직 코스가 없습니다.</div>
      ) : (
        <>
          <div className="cml-grid">
            {currentList.map((c) => {
              const coverThumb = c.spots?.find((s) => s.thumbnail)?.thumbnail || "";
              const spotCount = c.spots?.length || 0;
              const firstTitle = c.spots?.[0]?.title;

              return (
                <div key={c.courseId} className="cml-card">
                  <div
                    className="cml-thumb"
                    onClick={() => navigate(`/course/view/${c.courseId}`)}
                    role="button"
                    title="상세 보기"
                  >
                    <img
                      src={coverThumb || "https://dummyimage.com/600x400/dddddd/000000.png&text=Course"}
                      alt={c.title}
                      onError={(e) => {
                        e.currentTarget.src = "https://dummyimage.com/600x400/dddddd/000000.png&text=Course";
                      }}
                    />
                  </div>

                  <div className="cml-body">
                    <div className="cml-card-title" title={c.title}>
                      {c.title || "(제목 없음)"}
                    </div>
                    <div className="cml-meta">
                      <span>스팟 {spotCount}개</span>
                      {firstTitle ? <span className="cml-dot">·</span> : null}
                      {firstTitle ? <span className="cml-weak">첫 장소: {firstTitle}</span> : null}
                    </div>
                    {c.tags ? (
                      <div className="cml-tags">#{c.tags}</div>
                    ) : (
                      <div className="cml-tags cml-tags-empty">태그 없음</div>
                    )}
                  </div>

                  <div className="cml-card-actions">
                    <button className="cml-btn" onClick={() => navigate(`/course/view/${c.courseId}`)}>
                      조회
                    </button>
                    <button className="cml-btn danger" onClick={() => handleDelete(c.courseId)}>
                      삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cml-paging">
            <button className="cml-page-btn" disabled={page <= 1} onClick={() => setPage(1)}>
              {"<<"}
            </button>
            <button className="cml-page-btn" disabled={page <= 1} onClick={() => setPage((p) => clampPage(p - 1))}>
              {"<"}
            </button>

            <div className="cml-page-list">
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  className={`cml-page-num ${page === n ? "active" : ""}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
            </div>

            <button className="cml-page-btn" disabled={page >= totalPages} onClick={() => setPage((p) => clampPage(p + 1))}>
              {">"}
            </button>
            <button className="cml-page-btn" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
              {">>"}
            </button>

            <div className="cml-go">
              <input
                value={goPage}
                onChange={(e) => setGoPage(e.target.value.replace(/[^\d]/g, ""))}
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
                className="cml-page-btn"
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
        </>
      )}
    </div>
  );
};

export default CourseListPage;
