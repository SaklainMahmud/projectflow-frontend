import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskTitle, setTaskTitle] = useState("");

  const fetchProjects = async () => {
    const res = await api.get("/projects");
    setProjects(res.data);
  };

  const fetchTasks = async (projectId) => {
    const res = await api.get(`/projects/${projectId}/tasks`);
    setTasks((prev) => ({ ...prev, [projectId]: res.data }));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    await api.post("/projects", { title, description });
    setTitle("");
    setDescription("");
    fetchProjects();
  };

  const handleDeleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
    fetchProjects();
  };

  const handleCreateTask = async (projectId) => {
    await api.post(`/projects/${projectId}/tasks`, {
      title: taskTitle,
    });
    setTaskTitle("");
    fetchTasks(projectId);
  };

  const handleDeleteTask = async (taskId, projectId) => {
    await api.delete(`/tasks/${taskId}`);
    fetchTasks(projectId);
  };

  return (
    <div className="container">
      <div className="navbar">
        <h1>ProjectFlow</h1>

        <div className="navbar-right">
            <span>{user?.name}</span>
            <button onClick={logout}>Logout</button>
        </div>
      </div>

      <hr />

      <h3>Create Project</h3>
      <form onSubmit={handleCreateProject}>
        <input
          type="text"
          placeholder="Project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="text"
          placeholder="Project description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit">Create Project</button>
      </form>

      <hr />

      <h3>Your Projects</h3>

      {projects.map((project) => (
        <div
          key={project._id}
          style={{
            border: "1px solid #e5e7eb",
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "6px",
            backgroundColor: "#fafafa"
          }}
        >
          <h4>{project.title}</h4>
          <p>{project.description}</p>

          <button onClick={() => handleDeleteProject(project._id)}>
            Delete Project
          </button>

          <hr />

          <h5>Tasks</h5>

          <button onClick={() => fetchTasks(project._id)}>
            Load Tasks
          </button>

          <ul>
            {(tasks[project._id] || []).map((task) => (
              <li key={task._id} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                <strong>{task.title}</strong>
                <span className={`status-badge status-${task.status}`}>
                    ({task.status})
                </span>

                <select
                    value={task.status}
                    onChange={async (e) => {
                    await api.patch(`/tasks/${task._id}`, {
                        status: e.target.value,
                    });
                    fetchTasks(project._id);
                    }}
                    style={{ marginLeft: "10px" }}
                >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                </select>

                <button
                    style={{ marginLeft: "10px" }}
                    onClick={() => handleDeleteTask(task._id, project._id)}
                >
                    Delete
                </button>
              </li>
            ))}
          </ul>

          <input
            type="text"
            placeholder="New task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          <button onClick={() => handleCreateTask(project._id)}>
            Add Task
          </button>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
