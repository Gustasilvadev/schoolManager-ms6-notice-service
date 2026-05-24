import { useEffect, useState } from "react";
import { listNotices, type Notice } from "../services/noticeService";
import { NoticeTable } from "../components/NoticeTable";

export function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadNotices() {
    try {
      setLoading(true);
      setError(null);

      const data = await listNotices({
        page: 1,
        limit: 10,
      });

      setNotices(data.notices);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar os comunicados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotices();
  }, []);

  if (loading) {
    return <p>Carregando comunicados...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1>Comunicados</h1>
      <NoticeTable notices={notices} />
    </main>
  );
}