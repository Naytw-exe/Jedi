const BASE_API = "https://api-anime-rouge.vercel.app/aniwatch";

async function search(query) {
  const url = `${BASE_API}/search?keyword=${encodeURIComponent(query)}&page=1`;
  const res = await fetch(url);
  const data = await res.json();
  const results = data?.animes || [];
  return results.map((anime) => ({
    id: anime.id,
    title: anime.name,
    image: anime.img || anime.poster || "",
  }));
}

async function fetchEpisodes(id) {
  const url = `${BASE_API}/episodes/${id}`;
  const res = await fetch(url);
  const data = await res.json();
  const episodes = data?.episodes || [];
  return episodes.map((ep) => ({
    id: ep.episodeId,
    number: ep.number,
  }));
}

async function fetchSources(id) {
  const serversUrl = `${BASE_API}/servers?id=${encodeURIComponent(id)}`;
  const serversRes = await fetch(serversUrl);
  const serversData = await serversRes.json();
  const subServers = serversData?.sub || [];
  const dubServers = serversData?.dub || [];
  const serverName = subServers[0]?.serverName || dubServers[0]?.serverName || "hd-1";
  const category = subServers.length > 0 ? "sub" : "dub";
  const sourcesUrl = `${BASE_API}/episode-srcs?id=${encodeURIComponent(id)}&server=${serverName}&category=${category}`;
  const sourcesRes = await fetch(sourcesUrl);
  const sourcesData = await sourcesRes.json();
  const sources = sourcesData?.sources || [];
  const subtitles = sourcesData?.tracks?.filter((t) => t.kind === "captions") || [];
  const headers = sourcesData?.headers || {};
  return [{
    label: `${serverName} (${category})`,
    type: "hls",
    qualities: sources.map((src) => ({
      quality: src.quality || "default",
      url: src.url,
      headers: headers,
      metadata: { language: category === "sub" ? "Japanese" : "English" },
    })),
    subtitles: subtitles.map((track) => ({
      url: track.file,
      label: track.label || "Subtitle",
      language: track.label || "en",
      format: "vtt",
    })),
  }];
}

return { search, fetchEpisodes, fetchSources };
