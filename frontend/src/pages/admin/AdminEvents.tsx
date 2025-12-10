import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import "./AdminEvents.css";

interface EventHistory {
  historyId: number;
  accountId: string;
  eventType: string;
  eventName: string;
  description: string;
  count: number;
  createdAt: string;
}

const AdminEvents: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    // 이벤트 이력은 사용자별로 조회해야 하므로, 통계만 표시
    setLoading(false);
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>이벤트 관리</h1>
        <button onClick={() => navigate('/admin')}>대시보드로</button>
      </div>

      <div className="admin-info-box">
        <p>이벤트 관리 기능은 추후 구현 예정입니다.</p>
        <p>현재는 통계 대시보드에서 이벤트 수를 확인할 수 있습니다.</p>
      </div>
    </div>
  );
};

export default AdminEvents;

