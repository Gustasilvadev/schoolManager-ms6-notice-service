import type { Notice } from "../services/noticeService";

interface NoticeTableProps {
  notices: Notice[];
}

function getStatusLabel(status: Notice["notice_status"]) {
  const labels = {
    0: "Inativo",
    1: "Ativo",
    2: "Deletado",
  };

  return labels[status];
}

function getPriorityLabel(priority: Notice["notice_priority"]) {
  const labels = {
    1: "Baixa",
    2: "Média",
    3: "Alta",
    4: "Urgente",
  };

  return labels[priority];
}

export function NoticeTable({ notices }: NoticeTableProps) {
  if (notices.length === 0) {
    return <p>Nenhum comunicado encontrado.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Título</th>
          <th>Conteúdo</th>
          <th>Data</th>
          <th>Status</th>
          <th>Prioridade</th>
        </tr>
      </thead>

      <tbody>
        {notices.map((notice) => (
          <tr key={notice.notice_id}>
            <td>{notice.notice_id}</td>
            <td>{notice.notice_title}</td>
            <td>{notice.notice_content}</td>
            <td>{notice.notice_date}</td>
            <td>{getStatusLabel(notice.notice_status)}</td>
            <td>{getPriorityLabel(notice.notice_priority)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}