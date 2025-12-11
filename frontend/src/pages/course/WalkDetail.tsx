import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Map,
  MapMarker,
  CustomOverlayMap,
  useKakaoLoader,
} from "react-kakao-maps-sdk";

import "./WalkDetail.css"; // 🔥 Walk 전용 CSS (Theme 구조 기반)

interface WalkData {
  id: string;
  title?: string;
  subtitle?: string;

  address?: string;
  traffic_info?: string;
  etc_info?: string;

  contents?: string;

  latitude?: number;
  longitude?: number;

  image_url?: string;
  thumbnail?: string;

  type?: string;
}

const WalkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [sideOpen, setSideOpen] = useState(false);
  const [data, setData] = useState<WalkData | null>(null);
  const [loading, setLoading] = useState(true);

  const query = new URLSearchParams(location.search);
  const historyPage = query.get("page") || 1;
  const historyKeyword = query.get("keyword") || "";

  const [loadingMap, errorMap] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAOMAP_KEY,
    libraries: ["services"],
  });

  const extract = (v: any) => (Array.isArray(v) ? v[0] : v);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8484/api/walk/${id}`);
        const doc = res.data;

        const formatted: WalkData = {
          id: doc.id,
          title: extract(doc.title),
          subtitle: extract(doc.subtitle),

          address: extract(doc.address),
          traffic_info: extract(doc.traffic_info),
          etc_info: extract(doc.etc_info),

          contents: extract(doc.contents),

          latitude: doc.latitude ? Number(extract(doc.latitude)) : undefined,
          longitude: doc.longitude ? Number(extract(doc.longitude)) : undefined,

          image_url: extract(doc.image_url),
          thumbnail: extract(doc.thumbnail),

          type: extract(doc.type),
        };

        setData(formatted);
      } catch {
        alert("데이터를 불러올 수 없습니다.");
        navigate("/course/walk");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading || loadingMap) return <div className="loading">불러오는 중…</div>;
  if (errorMap) return <div className="loading">지도 로딩 실패</div>;
  if (!data) return <div className="loading">데이터 없음</div>;

  const lat = data.latitude ?? 0;
  const lng = data.longitude ?? 0;
  const hasLocation = lat !== 0 && lng !== 0;

  const thumbSrc = data.thumbnail || data.image_url || "/noimg.png";

  return (
    <div className="walk-detail">

      {/* HEADER */}
      <header className="walk-header">
        <div className="walk-thumb-box">
          <img src={thumbSrc} alt={data.title} />
          <span className="walk-type-pill">도보 여행지</span>
        </div>

        <div className="walk-title-wrap">
          <h1>{data.title}</h1>

          {data.subtitle && <p className="walk-subtitle">{data.subtitle}</p>}

          {data.address && (
            <div className="walk-title-location">
              {data.address
                .split(/[\n]+| {2,}/)
                .filter((v) => v.trim())
                .map((addr, i) => (
                  <p key={i}>📍 {addr.trim()}</p>
                ))}
            </div>
          )}
        </div>
      </header>

      {/* BODY */}
      <div className="walk-container">
        {/* 모바일 토글 버튼 */}
        <button
          className="walk-side-toggle-btn"
          onClick={() => setSideOpen(!sideOpen)}
        >
          {sideOpen ? "▲ 정보 닫기" : "▼ 정보 보기"}
        </button>

        <div className="walk-content-grid">
          {/* SIDEBAR */}
          <aside className={`walk-side-card ${sideOpen ? "open" : "closed"}`}>
            <button
              className="walk-back-btn"
              onClick={() =>
                navigate(`/course/walk?page=${historyPage}&keyword=${historyKeyword}`)
              }
            >
              ← 목록으로
            </button>

            <section>
              <h2>기본 정보</h2>
              <div className="walk-info-list">
                {data.address && (
                  <div>
                    <strong>📍 주소</strong>
                    <p>{data.address}</p>
                  </div>
                )}

                {data.traffic_info && (
                  <div>
                    <strong>🚌 교통 정보</strong>
                    <p>{data.traffic_info}</p>
                  </div>
                )}

                {data.etc_info && (
                  <div>
                    <strong>ℹ️ 기타 정보</strong>
                    <p>{data.etc_info}</p>
                  </div>
                )}
              </div>
            </section>
          </aside>

          {/* MAIN CONTENT */}
          <main className="walk-main-card">
            <section>
              <h2>장소 소개</h2>

              {/* 본문 대표 이미지 — ThemeDetail과 동일하게 추가 */}
              {data.image_url && (
                <div className="walk-main-image">
                  <img src={data.image_url} alt={data.title} />
                </div>
              )}

              {/* contents HTML 처리 */}
              {data.contents && (
                <div
                  className="walk-html-content"
                  dangerouslySetInnerHTML={{
                    __html: data.contents.replace(
                      /<p[^>]*>([^<]{1,25})<\/p>/g,
                      '<p class="short-title">$1</p>'
                    ),
                  }}
                />
              )}
            </section>


            <section>
              <h2>위치 정보</h2>

              {hasLocation ? (
                <div className="walk-map-box">
                  <Map center={{ lat, lng }} level={3} style={{ width: "100%", height: "100%" }}>
                    <MapMarker position={{ lat, lng }} />

                    <CustomOverlayMap position={{ lat: lat + 0.0008, lng }}>
                      <div className="walk-marker-box">
                        <strong>{data.title}</strong>
                        <br />
                        <a
                          href={`https://map.kakao.com/link/map/${data.title},${lat},${lng}`}
                          target="_blank"
                        >
                          카카오맵 보기
                        </a>
                      </div>
                    </CustomOverlayMap>
                  </Map>
                </div>
              ) : (
                <div className="walk-map-fallback">위치 정보 없음</div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default WalkDetail;
