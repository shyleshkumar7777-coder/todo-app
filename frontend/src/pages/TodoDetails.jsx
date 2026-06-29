import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

function formatDate(value) {
  if (!value) return "No due date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function dateKey(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(todo) {
  return Boolean(todo?.dueDate && !todo.completed && dateKey(todo.dueDate) < todayKey());
}

export default function TodoDetails() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTodo() {
      try {
        const response = await fetch(`http://localhost:5000/todos/${id}`);
        const data = await response.json();
        setTodo(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadTodo();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="app-viewport">
        <div className="setup-container setup-container-narrow">
          <div className="setup-card details-content-card">
            <h2>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="app-viewport">
        <div className="setup-container setup-container-narrow">
          <div className="setup-card details-content-card">
            <h2>Todo Not Found</h2>
            <div className="accessory-view">
              <Link to="/">
                <button className="btn btn-secondary">Back</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const overdue = isOverdue(todo);
  const statusLabel = todo.completed ? "Completed" : overdue ? "Overdue" : "Pending";
  const statusClass = todo.completed
    ? "badge-status-completed"
    : overdue
      ? "badge-status-overdue"
      : "badge-status-pending";

  return (
    <div className="app-viewport">
      <div className="setup-container setup-container-narrow">
        <div className="details-header-bar">
          <h1>Todo Details</h1>
          <Link to="/">
            <button className="btn btn-secondary">Back to Todo List</button>
          </Link>
        </div>

        <div className="setup-card details-content-card">
          <div className="template-type">
            <h2 className="setup-card-title">{todo.title}</h2>
            <span className={`badge-status ${statusClass}`}>{statusLabel}</span>
          </div>

          <div className="setup-details-container">
            <div className="details-meta-item">
              <span className="meta-label">Description</span>
              <p className="meta-value">{todo.description || "No description provided."}</p>
            </div>

            <div className="details-meta-grid">
              <div className="details-meta-item">
                <span className="meta-label">Due Date</span>
                <p className="meta-value">{formatDate(todo.dueDate)}</p>
              </div>

              <div className="details-meta-item">
                <span className="meta-label">Priority</span>
                <p className="meta-value">{todo.priority || "medium"}</p>
              </div>

              <div className="details-meta-item">
                <span className="meta-label">Category</span>
                <p className="meta-value">{todo.category || "General"}</p>
              </div>

              <div className="details-meta-item">
                <span className="meta-label">Created</span>
                <p className="meta-value">{formatDateTime(todo.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="accessory-view" style={{ borderBlockStart: "none", paddingBlockStart: 0, marginBlockStart: "var(--space-16)" }}>
          <Link to="/">
            <button className="btn btn-primary">Back to Todo List</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
