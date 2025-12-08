import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

interface FestivalDetailData {
  id: string;
  title: string;
  subtitle?: string;
  address?: string;
  place?: string;
  gugun?: string;
  description?: string;
  homepage?: string;
  phone?: string;
  usage_day?: string;
  usage_time?: string;
  usage_amount?: string;
  facility?: string;
  traffic_info?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
}

const TravelFestivalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [festival, setFestival] = useState<FestivalDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  const [loadingMap, errorMap] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAOMAP_KEY || "YOUR_APP_KEY_HERE",
    libraries: ["services"],
  });

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8484/api/festival/${id}`);
        setFestival(res.data);
      } catch (e) {
        console.error("축제 상세조회 실패", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading || loadingMap) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        축제 상세 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (errorMap) {
    return <div style={{ padding: 40 }}>지도 로딩 실패 (카카오맵 키를 확인해 주세요).</div>;
  }

  if (!festival) {
    return <div style={{ padding: 40 }}>축제 정보를 찾을 수 없습니다.</div>;
  }

  const latNum =
    festival.latitude != null && festival.latitude !== ""
      ? Number(festival.latitude)
      : NaN;
  const lngNum =
    festival.longitude != null && festival.longitude !== ""
      ? Number(festival.longitude)
      : NaN;

  const hasValidLocation =
    !isNaN(latNum) && !isNaN(lngNum) && latNum !== 0 && lngNum !== 0;

  return (
    <div style={{ padding: "40px 20px 80px", maxWidth: 1100, margin: "0 auto" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: 16,
          padding: "6px 10px",
          borderRadius: 6,
          border: "1px solid #ddd",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        ← 목록으로
      </button>

      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
        {festival.title}
      </h1>
      {festival.subtitle && (
        <div style={{ fontSize: 15, color: "#666", marginBottom: 8 }}>
          {festival.subtitle}
        </div>
      )}

      <div style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
        {festival.gugun && <span>[{festival.gugun}] </span>}
        {festival.place && <span>{festival.place} · </span>}
        {festival.address}
      </div>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontSize: 14,
        color: "#444",
        marginBottom: 24,
      }}>
        {festival.usage_day && (
          <div>
            <strong>운영기간: </strong>
            {festival.usage_day}
          </div>
        )}
        {festival.usage_time && (
          <div>
            <strong>운영요일/시간: </strong>
            {festival.usage_time}
          </div>
        )}
        {festival.usage_amount && (
          <div>
            <strong>이용요금: </strong>
            {festival.usage_amount}
          </div>
        )}
        {festival.phone && (
          <div>
            <strong>문의전화: </strong>
            {festival.phone}
          </div>
        )}
        {festival.homepage && (
          <div>
            <strong>홈페이지: </strong>
            <a
              href={festival.homepage}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#2b6cb0" }}
            >
              {festival.homepage}
            </a>
          </div>
        )}
        {festival.facility && (
          <div>
            <strong>편의시설: </strong>
            {festival.facility}
          </div>
        )}
      </div>

      {festival.description && (
        <div style={{ marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
          <strong>상세 정보</strong>
          <div style={{ marginTop: 6 }}>{festival.description}</div>
        </div>
      )}

      {festival.traffic_info && (
        <div style={{ marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
          <strong>교통 정보</strong>
          <div style={{ marginTop: 6 }}>{festival.traffic_info}</div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>오시는 길</h2>
        {hasValidLocation ? (
          <div style={{ width: "100%", height: 320, borderRadius: 8, overflow: "hidden" }}>
            <Map center={{ lat: latNum, lng: lngNum }} style={{ width: "100%", height: "100%" }} level={3}>
              <MapMarker position={{ lat: latNum, lng: lngNum }}>
                <div style={{ fontSize: 12 }}>
                  {festival.title}
                  <br />
                  {festival.address}
                  <br />
                  <a
                    href={`https://map.kakao.com/link/map/${encodeURIComponent(
                      festival.title
                    )},${latNum},${lngNum}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#2b6cb0" }}
                  >
                    큰 지도 보기 / 길찾기
                  </a>
                </div>
              </MapMarker>
            </Map>
          </div>
        ) : (
          <div
            style={{
              height: 260,
              borderRadius: 8,
              backgroundColor: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#777",
              fontSize: 14,
            }}
          >
            위치 정보가 없어 지도를 표시할 수 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelFestivalDetail;
