import axios from "axios";

export interface Artwork {
  id: number;
  title: string | null;
  place_of_origin: string | null;
  artist_display: string | null;
  inscriptions: string | null;
  date_start: number | null;
  date_end: number | null;
}

export interface ApiResponse {
  data: Artwork[];
  pagination: { current_page: number; total_pages: number; total: number };
}

export async function fetchArtworksPage(page = 1, limit = 12) {
  // The provided API uses "page" query param. We'll rely on page only.
  const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`;
  const res = await axios.get(url);
  const json = res.data;
  const data = (json.data || []).map((item: any) => ({
    id: item.id,
    title: item.title ?? "",
    place_of_origin: item.place_of_origin ?? "",
    artist_display: item.artist_display ?? "",
    inscriptions: item.inscriptions ?? "",
    date_start: item.date_start ?? null,
    date_end: item.date_end ?? null,
  }));
  const pagination = {
    current_page: json.pagination?.current_page ?? page,
    total_pages: json.pagination?.total_pages ?? 1,
    total: json.pagination?.total ?? data.length,
  };
  return { data, pagination };
}
