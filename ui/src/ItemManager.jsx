import React, { useEffect, useState } from "react";

const API_URL = "https://81liflhylf.execute-api.eu-central-1.amazonaws.com/dev"; 

export default function ItemManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ id: "", name: "", price: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch items
  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, { method: "GET" });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError("Failed to fetch items");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update item
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const method = editId ? "PUT" : "POST";
      const body = JSON.stringify({
        id: form.id,
        name: form.name,
        ...(form.price && { price: Number(form.price) }),
      });
      const res = await fetch(API_URL, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) throw new Error("Request failed");
      setForm({ id: "", name: "", price: "" });
      setEditId(null);
      fetchItems();
    } catch (err) {
      setError("Failed to save item");
    }
    setLoading(false);
  };

  // Edit item
  const handleEdit = (item) => {
    setForm({ id: item.id, name: item.name, price: item.price || "" });
    setEditId(item.id);
  };

  // Delete item
  const handleDelete = async (id) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchItems();
    } catch (err) {
      setError("Failed to delete item");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Item Manager</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          name="id"
          placeholder="ID"
          value={form.id}
          onChange={handleChange}
          required
          disabled={!!editId}
        />
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          type="number"
          min="0"
        />
        <button type="submit" disabled={loading}>
          {editId ? "Update" : "Add"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setForm({ id: "", name: "", price: "" });
              setEditId(null);
            }}
          >
            Cancel
          </button>
        )}
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {loading && <div>Loading...</div>}
      <ul>
        {items.map((item) => (
          <li key={item.id} style={{ marginBottom: 8 }}>
            <b>{item.name}</b> (ID: {item.id}
            {item.price !== undefined && `, $${item.price}`})
            <button style={{ marginLeft: 8 }} onClick={() => handleEdit(item)}>
              Edit
            </button>
            <button style={{ marginLeft: 4 }} onClick={() => handleDelete(item.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}