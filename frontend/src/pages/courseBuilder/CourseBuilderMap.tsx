import React, { useEffect, useMemo, useRef } from "react";
import type { CourseSpotUI } from "./courseBuilder.api";

declare global {
  interface Window {
    kakao: any;
  }
}

type Props = {
  selected: CourseSpotUI[];
  height?: number | string; // ✅ number도 받고, "100%"도 받게
};

const CourseBuilderMap: React.FC<Props> = ({ selected, height = "100%" }) => {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  const coords = useMemo(() => {
    return selected
      .filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
      .map((s) => ({
        lat: s.lat as number,
        lng: s.lng as number,
        title: s.title,
        orderIndex: s.orderIndex,
      }));
  }, [selected]);

  useEffect(() => {
    const kakaoKey = import.meta.env.VITE_KAKAOMAP_KEY;

    const init = () => {
      if (!window.kakao || !window.kakao.maps) return;

      window.kakao.maps.load(() => {
        const container = document.getElementById("courseBuilderMap");
        if (!container) return;

        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(35.1796, 129.0756),
          level: 6,
        });
        mapRef.current = map;

        // ✅ 컨테이너 높이가 clamp/반응형으로 바뀌면 relayout 필요
        setTimeout(() => map.relayout?.(), 100);
        window.addEventListener("resize", () => map.relayout?.());
      });
    };

    if (window.kakao && window.kakao.maps) init();
    else {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = init;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.kakao) return;

    // 기존 오버레이/라인 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (coords.length === 0) return;

    coords.forEach((c) => {
      const pos = new window.kakao.maps.LatLng(c.lat, c.lng);

      const content = document.createElement("div");
      content.style.cssText =
        "background:#111;color:#fff;border-radius:16px;padding:6px 10px;font-size:12px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.25);";
      content.textContent = String(c.orderIndex + 1);

      const overlay = new window.kakao.maps.CustomOverlay({
        position: pos,
        content,
        yAnchor: 1,
      });

      overlay.setMap(map);
      markersRef.current.push(overlay);
    });

    const path = coords.map((c) => new window.kakao.maps.LatLng(c.lat, c.lng));
    polylineRef.current = new window.kakao.maps.Polyline({
      path,
      strokeWeight: 4,
      strokeOpacity: 0.8,
      strokeStyle: "solid",
    });
    polylineRef.current.setMap(map);

    const bounds = new window.kakao.maps.LatLngBounds();
    path.forEach((p: any) => bounds.extend(p));
    map.setBounds(bounds);

    // ✅ 데이터 바뀔 때도 relayout 한 번 더 안전빵
    setTimeout(() => map.relayout?.(), 0);
  }, [coords]);

  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      id="courseBuilderMap"
      style={{
        width: "100%",
        height: resolvedHeight, // ✅ 기본 "100%" (부모 높이를 그대로 씀)
        borderRadius: 12,
      }}
    />
  );
};

export default CourseBuilderMap;
