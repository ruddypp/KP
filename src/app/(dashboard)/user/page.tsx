import { redirect } from 'next/navigation';

// Halaman ini hanya berfungsi untuk mengarahkan pengguna
// dari /user ke /user/request secara default.
export default function UserPage() {
  redirect('/user/request');
} 