import { Category, Priority, Status } from './types';

export const predefinedTasks: { category: Category; title: string; description: string; status: Status; priority: Priority }[] = [
  // Produksi
  { category: 'Produksi', title: 'Formula print/work sheets bug', description: 'Formula print/work sheets bug untuk tampilan tidak terupdate', status: 'Done', priority: 'High' },
  { category: 'Produksi', title: 'Search nama atau kode cat', description: 'Search nama atau kode cat mohon untuk langsung terupdate tidak harus klik per page', status: 'New', priority: 'Medium' },
  { category: 'Produksi', title: 'Tambahkan kolom PIC', description: 'tambakan kolom pic yang membuat cat tersebut di bagian dalam star qc', status: 'New', priority: 'Medium' },
  { category: 'Produksi', title: 'SPK in progress padahal belum assign formula', description: 'beberapa spk statusnya in progress padahal belum assign formula', status: 'New', priority: 'Medium' },
  { category: 'Produksi', title: 'List produk untuk create restock SPK', description: 'tambahkan list produk untuk create restock spk', status: 'New', priority: 'Medium' },
  { category: 'Produksi', title: 'Kode produk form pengambilan bahan baku', description: 'kode produk pada form pengambilan bahan baku tidak sinkron dengan worksheet', status: 'New', priority: 'Medium' },
  { category: 'Produksi', title: 'Warna pada form pengambilan bahan baku', description: 'tambahkan warna pada form pengambilan bahan baku', status: 'New', priority: 'Medium' },
  { category: 'Produksi', title: 'Kemasan pada formula tidak muncul', description: 'kemasan yang dipilih pada formula tidak muncul di worksheet (no packagaing selected)', status: 'New', priority: 'Medium' },
  { category: 'Produksi', title: 'Kolom warna pasta di print worksheet', description: 'Penambahan kolom pada Print worksheet untuk tempat komponen warna pasta, dan penyesuaian ukuran agar bisa cukup dalam 1 lembar kertas WS', status: 'New', priority: 'Medium' },

  // RMC
  { category: 'RMC', title: 'Formula pembuatan RMC tidak wajib 100%', description: 'Formula untuk pembuatan RMC tidak wajib 100%', status: 'Done', priority: 'Medium' },
  { category: 'RMC', title: 'TDS List', description: 'TDS List', status: 'In Progress', priority: 'Medium' },

  // Finance
  { category: 'Finance', title: 'PI untuk PO customer yang sudah bayar', description: 'PI untuk PO customer yang sudah bayar', status: 'Done', priority: 'High' },
  { category: 'Finance', title: 'Record Payment tidak berfungsi', description: 'Record Payment tidak berfungsi', status: 'Done', priority: 'High' },
  { category: 'Finance', title: 'Print invoice perusahaan & pribadi', description: 'Print invoice untuk perusahaan Dan pribadi', status: 'In Progress', priority: 'Medium' },
  { category: 'Finance', title: 'Tampilan Pajak di invoice', description: 'Penyesuaian tampilan Pajak dan perhitungan untuk ke invoice', status: 'Done', priority: 'High' },
  { category: 'Finance', title: 'Pengajuan Anggaran', description: 'Pengajuan Anggaran (Kebuthan OPS perusahaan)', status: 'In Progress', priority: 'Medium' },
  { category: 'Finance', title: 'Pengajuan pembelian barang', description: 'Pengajuan penbelian barang (dari Procurement)', status: 'Done', priority: 'Medium' },
  { category: 'Finance', title: 'Invoice pribadi kop Elvian Helmi', description: 'untuk invoice pribadi diganti kopnya jadi elvian helmi', status: 'New', priority: 'Medium' },
  { category: 'Finance', title: 'Record payment diperjelas', description: 'record payment dibuat lebih jelas biar keliatan mana yang udah dibayar atau belum', status: 'New', priority: 'Medium' },
  { category: 'Finance', title: 'Invoice untuk beberapa SJ', description: 'bikin invoice untuk beberapa sj apakah bisa??', status: 'New', priority: 'Medium' },
  { category: 'Finance', title: 'Total PO di ERP belum include pajak', description: 'total Po di erp belum include pajak', status: 'New', priority: 'High' },
  { category: 'Finance', title: 'Revisi harga tidak masuk PO ke invoice', description: 'revisi harga dll tidak masuk ke dalam PO yang sudah di jadikan invoice', status: 'New', priority: 'High' },

  // Inventory
  { category: 'Inventory', title: 'Surat Jalan untuk project/packing list', description: 'Surat Jalan untuk project/packing list', status: 'Done', priority: 'Medium' },

  // Project
  { category: 'Project', title: 'Informasi PO tidak muncul di list', description: 'Informasi PO tidak muncul di LIST PROJECT', status: 'New', priority: 'Medium' },

  // Procurement
  { category: 'Procurement', title: 'PO direvisi tanpa ubah no PO', description: 'PO dapat di revisi tanpa merubah no PO yg awal', status: 'New', priority: 'Medium' },
  { category: 'Procurement', title: 'Searching supplier', description: 'Searching supplier belum bisa', status: 'New', priority: 'High' },
  { category: 'Procurement', title: 'Pengajuan Raw Material', description: 'Pengajuan Raw Material Belum bisa pakai ERP , coba mulai trial dr Inventory', status: 'New', priority: 'Medium' },
  { category: 'Procurement', title: 'Gabung PO supplier sama', description: 'Menggabungkan PO ke supplier yg sama', status: 'New', priority: 'Medium' },
  { category: 'Procurement', title: 'Status PO sudah dikirim', description: 'Purchasing belum bisa merubah stts PO sudah di kirim', status: 'New', priority: 'Medium' },
  { category: 'Procurement', title: 'Kolom diskon rupiah', description: 'Tambahkan kolom diskon (dalam rupiah)', status: 'New', priority: 'Medium' },

  // Marketing/Sales
  { category: 'Marketing/Sales', title: 'Leads data customer', description: 'Leads data customer', status: 'Waiting', priority: 'Medium' },
  { category: 'Marketing/Sales', title: 'List produk cat tersedia', description: 'List produk cat yang tersedia', status: 'Waiting', priority: 'Low' },
  { category: 'Marketing/Sales', title: 'Nomor PO customer', description: 'Nomor PO pada list PO customer dan print', status: 'Waiting', priority: 'Medium' },
  { category: 'Marketing/Sales', title: 'No PO customer di dashboard, PI, SJ', description: 'Tambah no po customer di dashboard, di PI dan SJ', status: 'Waiting', priority: 'Medium' },
  { category: 'Marketing/Sales', title: 'Item packing kayu', description: 'Tambah item packing kayu', status: 'Waiting', priority: 'Low' },
  { category: 'Marketing/Sales', title: 'Export Laporan PO excel', description: 'Laporan PO per bulan bisa diexport jadi bentuk excel', status: 'Waiting', priority: 'Medium' },
];
