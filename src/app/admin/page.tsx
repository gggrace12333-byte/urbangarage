export default function Dashboard() {
  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24 }}>Dashboard</h1>
      <p>Admin panel loaded.</p>
      <ul>
        <li><a href="/admin/products">Products</a></li>
        <li><a href="/admin/orders">Orders</a></li>
        <li><a href="/admin/settings">Settings</a></li>
      </ul>
    </div>
  );
}
