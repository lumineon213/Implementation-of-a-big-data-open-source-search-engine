import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

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
  type?: string;
}

const MarineDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const historyPage = query.get("page") || 1;
  const historyKeyword = query.get("keyword") || "";

  const [data, setData] = useState<MarineData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading || loadingMap)
    return <div className="text-center py-10 text-lg">불러오는 중…</div>;
  if (errorMap) return <div className="text-center py-10">지도 로딩 실패</div>;
  if (!data) return <div className="text-center py-10">데이터 없음</div>;

  const lat = data.latitude ?? 0;
  const lng = data.longitude ?? 0;
  const validLocation = lat !== 0 && lng !== 0;

  const typeLabel = (t?: string) => {
    switch (t) {
      case "MARINE_TOURISM":
        return "해양 테마";
      case "URBAN_TOURISM":
        return "도심 테마";
      default:
        return "여행 테마";
    }
  };

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
            navigate(`/course/marine?page=${historyPage}&keyword=${historyKeyword}`)
          }
        >
          ← 목록으로
        </button>

        {/* 제목 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold">{data.main_title || data.title}</h1>
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
              { label: "연락처", value: data.tel, icon: "📞" },
              { label: "홈페이지", value: data.homepage, icon: "🔗", isLink: true },
              { label: "분류", value: typeLabel(data.type), icon: "📁" },
            ]
              .filter((item) => item.value)
              .map((item, i) => (
                <div key={i} className="pb-4 border-b border-gray-200">
                  <div className="flex items-start gap-2 mb-1">
                    <span className="w-5 h-5 flex items-center justify-center text-[18px]">
                      {item.icon}
                    </span>
                    <p className="font-semibold text-sm text-gray-700">
                      {item.label}
                    </p>
                  </div>

                  {/* 값 */}
                  {item.isLink ? (
                    <a
                      href={item.value}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline break-words text-[15px]"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-gray-900 leading-relaxed text-[15px]">
                      {item.value}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>

        {/* 운영 정보 */}
        {(data.usage_day ||
          data.usage_time ||
          data.usage_amount ||
          data.holiday ||
          data.facilities) && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">운영 및 이용 정보</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 pt-4 border-t border-gray-300">
              {data.usage_day && (
                <div className="py-3 border-b border-gray-200">
                  <p className="font-semibold text-sm text-gray-700 mb-1">🗓 운영일</p>
                  <p className="text-gray-900">{data.usage_day}</p>
                </div>
              )}

              {data.usage_time && (
                <div className="py-3 border-b border-gray-200">
                  <p className="font-semibold text-sm text-gray-700 mb-1">⏰ 운영 시간</p>
                  <p className="text-gray-900">{data.usage_time}</p>
                </div>
              )}

              {data.holiday && (
                <div className="py-3 border-b border-gray-200">
                  <p className="font-semibold text-sm text-gray-700 mb-1">📌 휴무일</p>
                  <p className="text-gray-900">{data.holiday}</p>
                </div>
              )}

              {data.usage_amount && (
                <div className="py-3 border-b border-gray-200">
                  <p className="font-semibold text-sm text-gray-700 mb-1">💰 이용 요금</p>
                  <p className="text-gray-900">{data.usage_amount}</p>
                </div>
              )}

              {data.facilities && (
                <div className="py-3 border-b border-gray-200">
                  <p className="font-semibold text-sm text-gray-700 mb-1">🏬 편의시설</p>
                  <p className="text-gray-900">{data.facilities}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 교통 정보 */}
        {data.traffic_info && (
          <section className="mt-10 pt-4 border-t border-gray-300">
            <h2 className="text-xl font-bold mb-4">교통 정보</h2>
            <p className="whitespace-pre-line text-gray-700">{data.traffic_info}</p>
          </section>
        )}

        {/* 소개 */}
        <section className="mt-10 pt-4 border-t border-gray-300">
          <h2 className="text-2xl font-extrabold mb-6 text-gray-800">장소 소개</h2>

          {data.description && (
            <p className="mb-6 text-xl font-semibold text-gray-700 leading-snug">
              {data.description}
            </p>
          )}

          {paragraphs.length > 0 && (
            <div className="space-y-6 text-gray-800 text-base leading-relaxed">
              {paragraphs.map((p, i) => (
                <p key={i}>{p.trim()}</p>
              ))}
            </div>
          )}
        </section>

        {/* 지도 */}
        <section className="mt-12 pt-4 border-t border-gray-300">
          <h2 className="text-2xl font-extrabold mb-6 text-gray-800">위치 정보</h2>

          {validLocation ? (
            <div className="w-full h-[400px] overflow-hidden rounded-md border border-gray-300">
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
                      href={`https://map.kakao.com/link/map/${data.title},${lat},${lng}`}
                      target="_blank"
                      className="text-blue-600 underline"
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

export default MarineDetail;
