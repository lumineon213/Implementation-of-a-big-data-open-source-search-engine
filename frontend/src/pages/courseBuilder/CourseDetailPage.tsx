import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CourseDetailPage.css";
import { fetchCourseDetail, type CourseDetailResponseDto } from "./course.api";
import CourseBuilderMap from "../courseBuilder/CourseBuilderMap"; // 경로는 네 프로젝트 구조에 맞게 조정

const CourseDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CourseDetailResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    let alive = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const dto = await fetchCourseDetail(courseId);
        if (!alive) return;
        setData(dto);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("코스 조회 실패. courseId가 맞는지 / 서버 로그 확인.");
        setData(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [courseId]);

  const mapSelected = useMemo(() => {
    if (!data?.spots) return [];
    return data.spots.map((s) => ({
      orderIndex: s.orderIndex,
      placeId: s.placeId,
      placeType: s.placeType as any,
      title: s.title || "(제목 없음)",
      address: s.address || null,
      thumbnail: s.thumbnail || null,
      lat: typeof s.latitude === "number" ? s.latitude : null,
      lng: typeof s.longitude === "number" ? s.longitude : null,
    }));
  }, [data]);

  if (loading) return <div className="cdp-muted">불러오는 중…</div>;
  if (error) return <div className="cdp-error">{error}</div>;
  if (!data) return <div className="cdp-muted">데이터 없음</div>;

  const spotCount = data.spots?.length || 0;

  return (
    <div className="cdp-page">
      <div className="cdp-topbar">
        <button className="cdp-btn" onClick={() => navigate(-1)}>
          ← 뒤로
        </button>

        {/* 수정은 아직 API가 없으니 “조회 기반 프리필”만 걸어두기 */}
        <button
          className="cdp-btn"
          onClick={() => navigate(`/course/builder?courseId=${data.courseId}`)}
          title="수정 API 붙기 전이라 저장은 아직 create로만 가능하게 막는 걸 추천"
        >
          수정(프리필)
        </button>
      </div>

      <div className="cdp-head">
        <div className="cdp-title">{data.title || "(제목 없음)"}</div>
        <div className="cdp-meta">
          <span>코스 ID: {data.courseId}</span>
          <span className="cdp-dot">·</span>
          <span>스팟 {spotCount}개</span>
          <span className="cdp-dot">·</span>
          <span>공개: {data.isPublic ?? "-"}</span>
        </div>
        {data.description ? <div className="cdp-desc">{data.description}</div> : null}
        {data.tags ? <div className="cdp-tags">#{data.tags}</div> : null}
      </div>

      <div className="cdp-grid">
        <div className="cdp-left">
          <div className="cdp-section-title">스팟 목록</div>

          <div className="cdp-list">
            {data.spots.map((s) => {
              const noCoord = !(typeof s.latitude === "number" && typeof s.longitude === "number");
              const thumb = s.thumbnail || "https://dummyimage.com/600x400/dddddd/000000.png&text=Spot";

              return (
                <div key={`${s.placeType}:${s.placeId}:${s.orderIndex}`} className="cdp-item">
                  <div className="cdp-idx">{s.orderIndex + 1}</div>

                  <div className="cdp-thumb">
                    <img
                      src={thumb}
                      alt={s.title || "spot"}
                      onError={(e) => {
                        e.currentTarget.src = "https://dummyimage.com/600x400/dddddd/000000.png&text=Spot";
                      }}
                    />
                  </div>

                  <div className="cdp-main">
                    <div className="cdp-item-title">{s.title || "(제목 없음)"}</div>
                    <div className="cdp-sub">
                      {s.address || "주소 없음"}
                      {noCoord && <span className="cdp-badge">지도 표시 불가</span>}
                    </div>
                    <div className="cdp-small">
                      {s.placeType} / {s.placeId}
                      {s.category ? <span className="cdp-dot">·</span> : null}
                      {s.category ? <span>category: {String(s.category)}</span> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cdp-right">
          <div className="cdp-section-title">지도</div>
          <div className="cdp-mapbox">
            <CourseBuilderMap selected={mapSelected} height={420} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
