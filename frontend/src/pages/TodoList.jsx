import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const priorities = ["low", "medium", "high"];

function formatDate(value) {
  if (!value) return "No due date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
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
  return Boolean(todo.dueDate && !todo.completed && dateKey(todo.dueDate) < todayKey());
}

function priorityRank(priority) {
  return { high: 0, medium: 1, low: 2 }[priority] ?? 1;
}

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("dueDate");

  // State for Editing
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editCategory, setEditCategory] = useState("");

  const loadTodos = async () => {
    const res = await fetch("http://localhost:5000/todos");
    const data = await res.json();
    setTodos(data);
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const addTodo = async () => {
    if (!title.trim()) {
      alert("Title Required");
      return;
    }

    await fetch("http://localhost:5000/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
        priority,
        category: category.trim(),
        completed: false,
      }),
    });

    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setCategory("");
    loadTodos();
  };

  const deleteTodo = async (id) => {
    await fetch(`http://localhost:5000/todos/${id}`, {
      method: "DELETE",
    });
    loadTodos();
  };

  const toggleCompleted = async (todo) => {
    await fetch(`http://localhost:5000/todos/${todo._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...todo,
        completed: !todo.completed,
      }),
    });
    loadTodos();
  };

  // Editing handlers
  const startEditing = (todo) => {
    setEditingId(todo._id);
    setEditTitle(todo.title || "");
    setEditDescription(todo.description || "");
    setEditDueDate(todo.dueDate ? dateKey(todo.dueDate) : "");
    setEditPriority(todo.priority || "medium");
    setEditCategory(todo.category || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) {
      alert("Title Required");
      return;
    }

    await fetch(`http://localhost:5000/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editTitle.trim(),
        description: editDescription.trim(),
        dueDate: editDueDate || null,
        priority: editPriority,
        category: editCategory.trim(),
      }),
    });

    setEditingId(null);
    loadTodos();
  };

  const displayedTodos = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return todos
      .filter((todo) => {
        const searchableText = [
          todo.title,
          todo.description,
          todo.category,
          todo.priority,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = searchableText.includes(normalizedSearch);
        const isDueToday = dateKey(todo.dueDate) === todayKey();
        const matchesFilter =
          filter === "all" ||
          (filter === "completed" && todo.completed) ||
          (filter === "pending" && !todo.completed) ||
          (filter === "today" && isDueToday) ||
          (filter === "overdue" && isOverdue(todo)) ||
          (filter === "high" && todo.priority === "high");

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sort === "priority") {
          return priorityRank(a.priority) - priorityRank(b.priority);
        }

        if (sort === "createdAt") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }

        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aDue - bDue;
      });
  }, [filter, search, sort, todos]);

  const stats = useMemo(() => {
    return {
      total: todos.length,
      pending: todos.filter((todo) => !todo.completed).length,
      dueToday: todos.filter((todo) => dateKey(todo.dueDate) === todayKey()).length,
      overdue: todos.filter(isOverdue).length,
    };
  }, [todos]);

  return (
    <div className="app-viewport">
      <div className="setup-container">
        <div className="setup-header">
          <h1>Todo Application</h1>
          <p>Organize tasks with due dates, priorities, categories, and status tracking.</p>
        </div>

        <div className="stats-row">
          <div className="stat-item">
            <span>Total</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-item">
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>
          <div className="stat-item">
            <span>Today</span>
            <strong>{stats.dueToday}</strong>
          </div>
          <div className="stat-item">
            <span>Overdue</span>
            <strong>{stats.overdue}</strong>
          </div>
        </div>

        <div className="setup-card-container">
          <div className="setup-card setup-card-form">
            <h2>Create Task</h2>
            <div className="form-grid">
              <input
                className="setup-input input-title-field"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="setup-input input-desc-field"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <input
                className="setup-input"
                type="date"
                aria-label="Due date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <select
                className="setup-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {priorities.map((item) => (
                  <option key={item} value={item}>
                    {item[0].toUpperCase() + item.slice(1)} priority
                  </option>
                ))}
              </select>
              <input
                className="setup-input"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <button className="btn btn-primary" onClick={addTodo}>
                Add Todo
              </button>
            </div>
          </div>
        </div>

        <div className="controls-bar">
          <input
            className="setup-input search-field"
            placeholder="Search title, description, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="setup-select filter-select-field"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="today">Due today</option>
            <option value="overdue">Overdue</option>
            <option value="high">High priority</option>
          </select>
          <select
            className="setup-select filter-select-field"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="dueDate">Sort by due date</option>
            <option value="priority">Sort by priority</option>
            <option value="createdAt">Newest first</option>
          </select>
        </div>

        {displayedTodos.length === 0 && (
          <div className="empty-view">
            <p>No todos found</p>
          </div>
        )}

        <div className="card-grid">
          {displayedTodos.map((todo) => {
            const overdue = isOverdue(todo);
            const statusLabel = todo.completed ? "Completed" : overdue ? "Overdue" : "Pending";
            const statusClass = todo.completed
              ? "badge-status-completed"
              : overdue
                ? "badge-status-overdue"
                : "badge-status-pending";

            const isEditing = editingId === todo._id;

            if (isEditing) {
              return (
                <div key={todo._id} className="setup-card-item" style={{ borderColor: "var(--primary-color)" }}>
                  <div className="setup-details" style={{ gap: "var(--space-12)" }}>
                    <div className="template-type">
                      <h3 className="setup-card-title" style={{ fontSize: "0.95rem", color: "var(--display-onlight-secondary)" }}>
                        Editing Task
                      </h3>
                      <span className={`badge-status ${statusClass}`}>{statusLabel}</span>
                    </div>

                    <input
                      className="setup-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title"
                    />

                    <input
                      className="setup-input"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description"
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)" }}>
                      <input
                        className="setup-input"
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                      />
                      <select
                        className="setup-select"
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                      >
                        {priorities.map((item) => (
                          <option key={item} value={item}>
                            {item[0].toUpperCase() + item.slice(1)} priority
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      className="setup-input"
                      placeholder="Category"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    />
                  </div>

                  <div className="accessory-view">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => saveEdit(todo._id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={todo._id} className="setup-card-item">
                <div className="setup-details">
                  <div className="template-type">
                    <h3 className="setup-card-title">{todo.title}</h3>
                    <span className={`badge-status ${statusClass}`}>{statusLabel}</span>
                  </div>

                  <p className="setup-description">
                    {todo.description || "No description provided."}
                  </p>

                  <div className="task-meta-grid">
                    <span>Due: {formatDate(todo.dueDate)}</span>
                    <span>Priority: {todo.priority || "medium"}</span>
                    <span>Category: {todo.category || "General"}</span>
                  </div>
                </div>

                <div className="accessory-view">
                  <button
                    className={`btn btn-sm ${todo.completed ? "btn-secondary" : "btn-success"}`}
                    onClick={() => toggleCompleted(todo)}
                  >
                    {todo.completed ? "Undo" : "Complete"}
                  </button>

                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => startEditing(todo)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteTodo(todo._id)}
                  >
                    Delete
                  </button>

                  <div className="btn-link-wrapper">
                    <Link to={`/todo?id=${todo._id}`}>
                      <button className="btn btn-sm btn-secondary">View</button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
