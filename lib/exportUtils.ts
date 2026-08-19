// CSV & Data Export Utility for Admin and Users

export function downloadCSV(filename: string, rows: object[]) {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(header => {
        const value = (row as any)[header] ?? '';
        const escaped = ('' + value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ].join('\n');

  // Add UTF-8 BOM so Excel displays Vietnamese correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportDesignsToCSV(designs: any[]) {
  const data = designs.map(d => ({
    ID: d.id,
    Tiêu_đề: d.title,
    Thể_loại: d.category,
    Chuyên_ngành: d.specialty || 'Tất cả',
    Lượt_tải: d.downloadsCount || 0,
    Trạng_thái: d.status || 'Approved',
    Tác_giả: d.authorName || 'N/A',
    Ngày_tạo: d.createdAt || 'N/A'
  }));
  downloadCSV(`ICTC_Danh_sach_Design_${new Date().toISOString().slice(0,10)}.csv`, data);
}

export function exportUsersToCSV(users: any[]) {
  const data = users.map(u => ({
    ID: u.id,
    Họ_tên: u.displayName,
    Email: u.email,
    Vai_trò: u.role,
    Ngày_tham_gia: u.joinedDate || 'N/A'
  }));
  downloadCSV(`ICTC_Danh_sach_Thanh_vien_${new Date().toISOString().slice(0,10)}.csv`, data);
}

export function exportFontsToCSV(fonts: any[]) {
  const data = fonts.map(f => ({
    ID: f.id,
    Tên_Font: f.name,
    Thể_loại: f.category,
    Ghim_nổi_bật: f.isPinned ? 'Có' : 'Không',
    Tác_giả: f.author || 'N/A'
  }));
  downloadCSV(`ICTC_Danh_sach_Font_${new Date().toISOString().slice(0,10)}.csv`, data);
}
