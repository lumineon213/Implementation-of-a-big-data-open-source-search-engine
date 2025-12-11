import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk";

import "./MarineDetail.css";

interface MarineData {
  id: string;
  main_title?: string;
  title?: string;
  subtitle?: string;
  address?: string;
  tel?: string;
  homepage?: string;
  traffic_info?: string;
  usage_day?: string;
  holiday?: string;
  usage_time?: string;
  usage_amount?: string;
  facilities?: string;
  description?: string;
  contents?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  thumbnail?: string;
  type?: string;
}

const MarineDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [sideOpen, setSideOpen] = useState(false);
  const [data, setData] = useState<MarineData | null>(null);
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
        const res = await axios.get(`http://localhost:8484/api/marine/${id}`);
        const doc = res.data;

        const formatted: MarineData = {
          id: doc.id,
          main_title: extract(doc.main_title),
          title: extract(doc.title),
          subtitle: extract(doc.subtitle),
          address: extract(doc.address),
          tel: extract(doc.tel),
          homepage: extract(doc.homepage),
          traffic_info: extract(doc.traffic_info),
          usage_day: extract(doc.usage_day),
          holiday: extract(doc.holiday),
          usage_time: extract(doc.usage_time),
          usage_amount: extract(doc.usage_amount),
          facilities: extract(doc.facilities),
          description: extract(doc.description),
          contents: extract(doc.contents),
          latitude: doc.latitude ? parseFloat(extract(doc.latitude)) : undefined,
          longitude: doc.longitude ? parseFloat(extract(doc.longitude)) : undefined,
          image_url: extract(doc.image_url),
          thumbnail: extract(doc.thumbnail),
          type: extract(doc.type),
        };

        setData(formatted);
      } catch (e) {
        alert("데이터를 불러올 수 없습니다.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (loading || loadingMap) return <div className="loading">불러오는 중…</div>;
  if (errorMap) return <div className="loading">지도 로딩 실패</div>;
  if (!data) return <div className="loading">데이터 없음</div>;

  const lat = Number(data.latitude);
  const lng = Number(data.longitude);

  const typeLabel = (t?: string) => {
    switch (t) {
      case "MARINE_TOURISM": return "해양 테마";
      case "URBAN_TOURISM": return "도심 테마";
      default: return "여행 테마";
    }
  };

  const thumbSrc = data.thumbnail || data.image_url || "/noimg.png";

  return (
    <div className="marine-detail">

      {/* HEADER */}
      <header className="marine-header">
        <div className="thumb-box">
          <img src={thumbSrc} alt={data.title} />
          {data.type && <span className="type-pill">{typeLabel(data.type)}</span>}
        </div>

        <div className="title-wrap">
          <h1>{data.main_title || data.title}</h1>

          {data.subtitle && (
            <p className="subtitle">{data.subtitle}</p>
          )}

          {data.address && (
            <div className="title-location">
              📍 {data.address}
            </div>
          )}
        </div>
      </header>

      {/* BODY */}
      <div className="container">

        <button
          className="side-toggle-btn"
          onClick={() => setSideOpen(!sideOpen)}
        >
          {sideOpen ? "▲ 정보 닫기" : "▼ 정보 보기"}
        </button>

        <div className="content-grid">

          {/* SIDECARD */}
          <aside className={`side-card ${sideOpen ? "open" : "closed"}`}>
            <button
              className="back-btn"
              onClick={() =>
                navigate(`/course/marine?page=${historyPage}&keyword=${historyKeyword}`)
              }
            >
              ← 목록으로
            </button>

            <section>
              <h2>기본 정보</h2>
              <div className="info-list">

                {data.address && (
                  <div>
                    <strong>📍 주소</strong>
                    <p>{data.address}</p>
                  </div>
                )}

                {data.tel && (
                  <div>
                    <strong>📞 연락처</strong>
                    <p>{data.tel}</p>
                  </div>
                )}

                {data.homepage && (
                  <div>
                    <strong>🔗 홈페이지</strong>
                    {data.homepage.split(/\s+/).map((url, i) => (
                      <a
                        key={i}
                        href={
                          url.startsWith("http") ? url : `https://${url}`
                        }
                        target="_blank"
                        className="link-item"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {(data.usage_day ||
              data.usage_time ||
              data.holiday ||
              data.usage_amount ||
              data.facilities) && (
              <section>
                <h2>운영 및 이용 정보</h2>
                <div className="info-list">
                  {data.usage_day && (
                    <div>
                      <strong>🗓 운영일</strong>
                      <p>{data.usage_day}</p>
                    </div>
                  )}

                  {data.usage_time && (
                    <div>
                      <strong>⏰ 운영 시간</strong>
                      <p>{data.usage_time}</p>
                    </div>
                  )}

                  {data.holiday && (
                    <div>
                      <strong>📌 휴무일</strong>
                      <p>{data.holiday}</p>
                    </div>
                  )}

                  {data.usage_amount && (
                    <div>
                      <strong>💰 이용 요금</strong>
                      <p>{data.usage_amount}</p>
                    </div>
                  )}

                  {data.facilities && (
                    <div>
                      <strong>🏬 편의시설</strong>
                      <p>{data.facilities}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {data.traffic_info && (
              <section>
                <h2>교통 정보</h2>
                <p>{data.traffic_info}</p>
              </section>
            )}
          </aside>

          {/* MAIN CONTENT */}
          <main className="main-card">

            <section>
              <h2>장소 소개</h2>

              {data.description && (
                <p className="desc">{data.description}</p>
              )}

              {data.image_url && (
                <div className="main-image">
                  <img src={data.image_url} alt={data.title} />
                </div>
              )}

              {data.contents && (
                <div
                  className="html-content"
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

              {data.latitude && data.longitude ? (
                <div className="map-box">
                  <Map center={{ lat, lng }} level={3} style={{ width: "100%", height: "100%" }}>
                    <MapMarker position={{ lat, lng }} />
                    <CustomOverlayMap position={{ lat: lat + 0.0008, lng }}>
                      <div className="marker-box">
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
                <div className="map-fallback">위치 정보 없음</div>
              )}
            </section>

          </main>

        </div>

      </div>

    </div>
  );
};

export default MarineDetail;
