import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

interface WalkData {
  id: string;
  title: string;
  subtitle?: string;

  address?: string;
  traffic_info?: string;
  etc_info?: string;

  image_url?: string;

  contents?: string;

  latitude?: number;
  longitude?: number;

  type?: string;
}

const WalkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const historyPage = query.get("page") || 1;
  const historyKeyword = query.get("keyword") || "";

  const [data, setData] = useState<WalkData | null>(null);
  const [loading, setLoading] = useState(true);

  const [loadingMap, errorMap] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAOMAP_KEY!,
    libraries: ["services"],
  });

  const extract = (v: any) => (Array.isArray(v) ? v[0] : v);

  useEffect(() => {
    const fetchDetail = async () => {
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
          image_url: extract(doc.image_url),

          latitude: doc.latitude ? parseFloat(doc.latitude) : undefined,
          longitude: doc.longitude ? parseFloat(doc.longitude) : undefined,

          type: extract(doc.type),
        };

        setData(formatted);
      } catch (err) {
        alert("데이터 조회 실패");
        navigate("/course/walk");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading || loadingMap)
    return <div className="text-center py-10 text-lg">불러오는 중…</div>;
  if (errorMap) return <div className="text-center py-10">지도 로딩 실패</div>;
  if (!data) return <div className="text-center py-10">데이터 없음</div>;

  const lat = data.latitude ?? 0;
  const lng = data.longitude ?? 0;
  const validLocation = lat !== 0 && lng !== 0;

  const paragraphs =
    data.contents
      ?.replace(/\r\n/g, "\n")
      .split(/\n{2,}|\n- |\n• /)
      .filter((p) => p.trim().length > 0) ?? [];

  return (
    <div className="min-h-screen app-content-padding pb-10 px-8 xl:px-0 flex justify-center">
      <div className="bg-white max-w-6xl w-full shadow-md rounded-lg p-8">

        {/* 뒤로가기 */}
        <button
          className="text-gray-600 mb-5 hover:text-black"
          onClick={() =>
            navigate(`/course/walk?page=${historyPage}&keyword=${historyKeyword}`)
          }
        >
          ← 목록으로
        </button>

        {/* 제목 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold">{data.title}</h1>
          {data.subtitle && (
            <p className="text-lg text-gray-700 mt-1">{data.subtitle}</p>
          )}
        </div>

        {/* 이미지 */}
        <div className="mb-10">
          <img
            src={data.image_url || "/noimg.png"}
            alt={data.title}
            className="w-full rounded-md block mx-auto"
          />
        </div>

        {/* 기본 정보 */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">기본 정보</h2>
          <div className="flex flex-col border-t border-gray-300 pt-4">
            {[
              { label: "주소", value: data.address, icon: "📍" },
              { label: "교통 정보", value: data.traffic_info, icon: "🚌" },
              { label: "기타 정보", value: data.etc_info, icon: "ℹ️" },
            ]
              .filter((item) => item.value)
              .map((item, idx) => (
                <div key={idx} className="pb-4 border-b border-gray-200">
                  <div className="flex items-start gap-2 mb-1">
                    <span className="w-5 h-5 flex items-center justify-center text-[18px]">
                      {item.icon}
                    </span>
                    <p className="font-semibold text-sm text-gray-700">
                      {item.label}
                    </p>
                  </div>
                  <p className="text-gray-900 text-[15px] leading-relaxed">
                    {item.value}
                  </p>
                </div>
              ))}
          </div>
        </section>

        {/* 소개 */}
        {paragraphs.length > 0 && (
          <section className="mt-10 pt-4 border-t border-gray-300">
            <h2 className="text-2xl font-extrabold mb-6 text-gray-800">
              장소 소개
            </h2>

            <div className="space-y-6 text-gray-800 text-base leading-relaxed">
              {paragraphs.map((p, i) => (
                <p key={i}>{p.trim()}</p>
              ))}
            </div>
          </section>
        )}

        {/* 지도 */}
        <section className="mt-12 pt-4 border-t border-gray-300">
          <h2 className="text-2xl font-extrabold mb-6 text-gray-800">
            위치 정보
          </h2>

          {validLocation ? (
            <div className="w-full h-[400px] rounded-md border border-gray-300 overflow-hidden">
              <Map
                center={{ lat, lng }}
                level={3}
                style={{ width: "100%", height: "100%" }}
              >
                <MapMarker position={{ lat, lng }}>
                  <div className="text-[12px] p-1">
                    {data.title}
                    <br />
                    <a
                      className="text-blue-600 underline"
                      target="_blank"
                      href={`https://map.kakao.com/link/map/${data.title},${lat},${lng}`}
                    >
                      카카오맵 보기
                    </a>
                  </div>
                </MapMarker>
              </Map>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center bg-gray-100 border border-gray-300">
              위치 정보 없음
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default WalkDetail;
