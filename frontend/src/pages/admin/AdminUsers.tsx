import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import "./AdminUsers.css";

interface User {
  accountId: string;
  accountName: string;
  email: string;
  phoneNumber: string;
  accountRole: string;
  regDate: string;
  reviewCount: number;
  eventCount: number;
}

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      if (search) {
        params.append('search', search);
      }

      const res = await api.get(`/admin/users?${params}`);
      if (res.data.success) {
        setUsers(res.data.users);
        setTotal(res.data.total);
      } else {
        alert('관리자 권한이 필요합니다.');
        navigate('/');
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert('관리자 권한이 필요합니다.');
        navigate('/');
      } else {
        console.error('회원 목록 로드 실패:', error);
        alert('데이터를 불러올 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (accountId: string, newRole: string) => {
    if (!confirm(`정말로 이 회원의 권한을 ${newRole}로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const res = await api.put(`/admin/users/${accountId}/role`, { role: newRole });
      if (res.data.success) {
        alert('권한이 변경되었습니다.');
        loadUsers();
      } else {
        alert(res.data.msg || '권한 변경에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('권한 변경 실패:', error);
      alert(error.response?.data?.msg || '권한 변경에 실패했습니다.');
    }
  };

  const handleDeleteUser = async (accountId: string) => {
    if (!confirm(`정말로 이 회원을 강제 탈퇴시키시겠습니까?`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/users/${accountId}`);
      if (res.data.success) {
        alert('회원이 탈퇴 처리되었습니다.');
        loadUsers();
      } else {
        alert(res.data.msg || '회원 탈퇴에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('회원 탈퇴 실패:', error);
      alert(error.response?.data?.msg || '회원 탈퇴에 실패했습니다.');
    }
  };

  const totalPages = Math.ceil(total / size);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>회원 관리</h1>
        <button onClick={() => navigate('/admin')}>대시보드로</button>
      </div>

      <div className="admin-search">
        <input
          type="text"
          placeholder="아이디, 이름, 이메일로 검색..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        <button onClick={loadUsers}>검색</button>
      </div>

      {loading ? (
        <div className="admin-loading">로딩 중...</div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>아이디</th>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>전화번호</th>
                  <th>권한</th>
                  <th>가입일</th>
                  <th>리뷰 수</th>
                  <th>이벤트 수</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.accountId}>
                    <td>{user.accountId}</td>
                    <td>{user.accountName}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber || '-'}</td>
                    <td>
                      <select
                        value={user.accountRole}
                        onChange={(e) => handleRoleChange(user.accountId, e.target.value)}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>{new Date(user.regDate).toLocaleDateString('ko-KR')}</td>
                    <td>{user.reviewCount}</td>
                    <td>{user.eventCount}</td>
                    <td>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteUser(user.accountId)}
                      >
                        탈퇴
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                disabled={page === 0}
              >
                이전
              </button>
              <span>{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={page >= totalPages - 1}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUsers;



