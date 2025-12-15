// src/pages/courseBuilder/courseBuilder.api.ts
import { api, withApi } from "./courseBuilder.http";
import { normalizeMaybeSwapped, safeText, toNumber } from "./courseBuilder.coords";

export type PlaceType =
  | "search"
  | "festival_core"
  | "food_core"
  | "marine_core"
  | "urban_core"
  | "theme_core"
  | "walk_core"
  | "shopping_core"
  | "stay_core"
  | "parking_core";

export type PlaceItem = {
  placeId: string;
  placeType: PlaceType;
  title: string;
  address?: string | null;
  thumbnail?: string | null;
  category?: string | null;
  lat?: number | null;
  lng?: number | null;
  raw?: any;
};

export type PagedResult<T> = {
  list: T[];
  total?: number;
};

type TabDef = {
  key: PlaceType;
  label: string;
  listPath: string;         // ✅ "/festival/search" 처럼 /api 없이 관리
  mapItem: (raw: any) => PlaceItem;
  supportsPaging: boolean;
};

export const COURSE_BUILDER_TABS: TabDef[] = [
  {
    key: "search",
    label: "명소",
    listPath: "/search",
    supportsPaging: false,
    mapItem: (r) => {
      const coord = normalizeMaybeSwapped(r.latitude ?? r.lat, r.longitude ?? r.lng);
      return {
        placeId: safeText(r.spotId ?? r.id ?? r.placeId, ""),
        placeType: "search",
        title: safeText(r.title, "(제목 없음)"),
        address: safeText(r.address, "") || null,
        thumbnail: safeText(r.imageUrl ?? r.image_url, "") || null,
        category: safeText(r.themeId ?? r.theme_id, "") || null,
        lat: coord?.lat ?? null,
        lng: coord?.lng ?? null,
        raw: r,
      };
    },
  },
  {
    key: "festival_core",
    label: "축제",
    listPath: "/festival/search",
    supportsPaging: true,
    mapItem: (r) => {
      const coord = normalizeMaybeSwapped(r.lat ?? r.LAT_d ?? r.latitude, r.lng ?? r.LNG_d ?? r.longitude);
      return {
        placeId: safeText(r.ucSeq ?? r.id, ""),
        placeType: "festival_core",
        title: safeText(r.mainTitle ?? r.MAIN_TITLE_text ?? r.title, "(제목 없음)"),
        address:
          safeText(
            r.addr1 ?? r.ADDR1_s ?? r.gugunNm ?? r.GUGUN_NM_s ?? r.place ?? r.PLACE_s,
            ""
          ) || null,
        thumbnail: safeText(r.mainImgNormal ?? r.MAIN_IMG_NORMAL_s ?? r.mainImgThumb, "") || null,
        category: "festival",
        lat: coord?.lat ?? null,
        lng: coord?.lng ?? null,
        raw: r,
      };
    },
  },
  {
    key: "food_core",
    label: "음식",
    listPath: "/food/search",
    supportsPaging: true,
    mapItem: (r) => {
      const coord = normalizeMaybeSwapped(r.latitude, r.longitude);
      return {
        placeId: safeText(r.id, ""),
        placeType: "food_core",
        title: safeText(r.title, "(제목 없음)"),
        address: safeText(r.address, "") || null,
        thumbnail: safeText(r.image_url ?? r.imageUrl, "") || null,
        category: safeText(r.type, "") || null,
        lat: coord?.lat ?? null,
        lng: coord?.lng ?? null,
        raw: r,
      };
    },
  },
  {
    key: "marine_core",
    label: "해양",
    listPath: "/marine/search",
    supportsPaging: true,
    mapItem: (r) => {
      const coord = normalizeMaybeSwapped(r.latitude, r.longitude);
      return {
        placeId: safeText(r.id, ""),
        placeType: "marine_core",
        title: safeText(r.main_title ?? r.title, "(제목 없음)"),
        address: safeText(r.address, "") || null,
        thumbnail: safeText(r.thumbnail ?? r.image_url, "") || null,
        category: safeText(r.type, "") || null,
        lat: coord?.lat ?? null,
        lng: coord?.lng ?? null,
        raw: r,
      };
    },
  },
  {
    key: "urban_core",
    label: "도시",
    listPath: "/urban/search",
    supportsPaging: true,
    mapItem: (r) => {
      const coord = normalizeMaybeSwapped(r.latitude, r.longitude);
      return {
        placeId: safeText(r.id, ""),
        placeType: "urban_core",
        title: safeText(r.main_title ?? r.title, "(제목 없음)"),
        address: safeText(r.address, "") || null,
        thumbnail: safeText(r.thumbnail ?? r.image_url, "") || null,
        category: safeText(r.type, "") || null,
        lat: coord?.lat ?? null,
        lng: coord?.lng ?? null,
        raw: r,
      };
    },
  },
  {
    key: "theme_core",
    label: "테마",
    listPath: "/theme/search",
    supportsPaging: true,
    mapItem: (r) => {
      const coord = normalizeMaybeSwapped(r.latitude, r.longitude);
      return {
        placeId: safeText(r.id, ""),
        placeType: "theme_core",
        title: safeText(r.main_title ?? r.title, "(제목 없음)"),
        address: safeText(r.address, "") || null,
        thumbnail: safeText(r.thumbnail ?? r.image_url, "") || null,
        category: safeText(r.category, "") || null,
        lat: coord?.lat ?? null,
        lng: coord?.lng ?? null,
        raw: r,
      };
    },
  },
  {
    key: "walk_core",
    label: "도보",
    listPath: "/walk/search",
    supportsPaging: true,
    mapItem: (r) => {
      const coord = normalizeMaybeSwapped(r.latitude, r.longitude);
      return {
        placeId: safeText(r.id, ""),
        placeType: "walk_core",
        title: safeText(r.main_title ?? r.title, "(제목 없음)"),
        address: safeText(r.address, "") || null,
        thumbnail: safeText(r.thumbnail ?? r.image_url, "") || null,
        category: safeText(r.category, "") || null,
        lat: coord?.lat ?? null,
        lng: coord?.lng ?? null,
        raw: r,
      };
    },
  },
  {
    key: "shopping_core",
    label: "쇼핑",
    listPath: "/shopping/search",
    supportsPaging: true,
    mapItem: (r) => {
      const coord = normalizeMaybeSwapped(r.lat ?? r.latitude, r.lng ?? r.longitude);
      return {
        placeId: safeText(r.id, ""),
        placeType: "shopping_core",
        title: safeText(r.main_title ?? r.title, "(제목 없음)"),
        address: safeText(r.addr1 ?? r.address, "") || null,
        thumbnail: safeText(r.main_img_thumb ?? r.main_img_normal ?? r.thumbnail, "") || null,
        category: "shopping",
        lat: coord?.lat ?? null,
        lng: coord?.lng ?? null,
        raw: r,
      };
    },
  },
  {
    key: "stay_core",
    label: "숙박",
    listPath: "/stay/search",
    supportsPaging: true,
    mapItem: (r) => {
      const coord = normalizeMaybeSwapped(r.latitude, r.longitude);
      return {
        placeId: safeText(r.id ?? r.content_id, ""),
        placeType: "stay_core",
        title: safeText(r.title, "(제목 없음)"),
        address: safeText(r.road_address ?? r.address, "") || null,
        thumbnail: safeText(r.image_url ?? r.firstimage, "") || null,
        category: "stay",
        lat: coord?.lat ?? null,
        lng: coord?.lng ?? null,
        raw: r,
      };
    },
  },
  {
    key: "parking_core",
    label: "주차",
    listPath: "/parking/search",
    supportsPaging: false,
    mapItem: (r) => {
      const coord = normalizeMaybeSwapped(r.latitude ?? r.yCdnt, r.longitude ?? r.xCdnt);
      const title = safeText(r.name ?? r.pkNam, "(주차장)");
      const addr = safeText(r.address ?? r.doroAddr ?? r.jibunAddress ?? r.jibunAddr, "");
      return {
        placeId: safeText(r.mgntNum ?? r.id, ""),
        placeType: "parking_core",
        title,
        address: addr || null,
        thumbnail: null,
        category: "parking",
        lat: coord?.lat ?? null,
        lng: coord?.lng ?? null,
        raw: r,
      };
    },
  },
];

function pickTab(placeType: PlaceType): TabDef {
  const tab = COURSE_BUILDER_TABS.find((t) => t.key === placeType);
  if (!tab) throw new Error(`Unknown placeType: ${placeType}`);
  return tab;
}

export async function fetchPlaceList(args: {
  placeType: PlaceType;
  keyword?: string;
  page?: number;
  size?: number;
}): Promise<PagedResult<PlaceItem>> {
  const { placeType, keyword = "", page = 1, size = 20 } = args;
  const tab = pickTab(placeType);

  const params: any = {};
  if (keyword) params.keyword = keyword;

  if (tab.supportsPaging) {
    params.page = String(page);
    params.size = String(size);
  }

  // ✅ 여기서 withApi로 "/api"를 딱 한 번만 붙인다
  const res = await api.get(withApi(tab.listPath), { params });
  const data = res.data;

  let listRaw: any[] = [];
  let total: number | undefined;

  if (Array.isArray(data)) {
    listRaw = data;
    total = data.length;
  } else if (data && typeof data === "object") {
    if (Array.isArray((data as any).list)) {
      listRaw = (data as any).list;
      total = toNumber((data as any).total) ?? toNumber((data as any).totalCount) ?? toNumber((data as any).totalElements) ?? undefined;
    } else if (Array.isArray((data as any).items)) {
      listRaw = (data as any).items;
      total = toNumber((data as any).total) ?? toNumber((data as any).totalCount) ?? toNumber((data as any).totalElements) ?? undefined;
    } else if ((data as any).response?.body?.items?.item) {
      listRaw = (data as any).response.body.items.item;
      total = toNumber((data as any).response.body.totalCount) ?? listRaw.length;
    } else if (Array.isArray((data as any).content)) {
      listRaw = (data as any).content;
      total = toNumber((data as any).totalElements) ?? listRaw.length;
    }
  }

  if (!tab.supportsPaging) {
    total = listRaw.length;
    const start = (page - 1) * size;
    listRaw = listRaw.slice(start, start + size);
  }

  const mapped = listRaw.map(tab.mapItem).filter((x) => x.placeId);
  return { list: mapped, total };
}

/** UI에서 선택된 스팟 타입 */
export type CourseSpotUI = {
  orderIndex: number;
  placeId: string;
  placeType: PlaceType;
  title: string;
  address?: string | null;
  thumbnail?: string | null;
  lat?: number | null;
  lng?: number | null;
};
